// Proxies the math-solve request to OpenAI so the API key never ships in the client bundle.
// verify_jwt = true (see ../../config.toml) means Supabase rejects unauthenticated callers
// before this code runs — only a signed-in app user's session can reach here.
//
// Plain JS, not TypeScript: this project has no TypeScript anywhere else, and Expo's
// `expo start` CLI scans the whole repo (not just the app source) for .ts/.tsx files to
// decide whether to require typescript/@types/react — the one .ts file that used to live
// here was enough to trip that check and block `expo start --web` entirely.

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // 20 requests / hour / authenticated user — abuse backstop, not the product limit

// Coarse hourly abuse backstop for anonymous callers, keyed by a client-generated
// device ID. Easier to work around (reinstall, clear storage) than the authenticated
// limit above, which is fine — it only needs to stop scripted abuse, not enforce the
// real product limit (that's WEEKLY_FREE_SOLVE_LIMIT below, enforced server-side).
const ANON_RATE_LIMIT_MAX = 10;
const ANON_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

// The actual product free tier (docs/plans/freemium-paywall-v2.md): 10 solves/week,
// resetting Monday 00:00 UTC, tracked server-side (public.weekly_solve_usage) keyed
// by auth uid or device id — NOT client-side, specifically so reinstalling the app
// or clearing storage doesn't reset it. Applies to guests AND signed-in non-Premium
// users alike; only a verified Premium entitlement bypasses it.
const WEEKLY_FREE_SOLVE_LIMIT = 10;

function decodeJwt(authHeader) {
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  const payload = token?.split(".")[1];
  if (!payload) return null;
  try {
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

async function checkRateLimit(userId, limit, windowSeconds) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_and_increment_rate_limit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      p_user_id: userId,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    }),
  });
  if (!response.ok) {
    console.error("Rate limit check failed:", await response.text().catch(() => ""));
    return true; // fail open — a broken rate-limit check shouldn't take down the feature
  }
  return await response.json();
}

async function checkAndIncrementWeeklySolve(key, limit) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_and_increment_weekly_solve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ p_key: key, p_limit: limit }),
  });
  if (!response.ok) {
    console.error("Weekly solve check failed:", await response.text().catch(() => ""));
    return true; // fail open to free tier, never silently block a paying-eligible user
  }
  return await response.json();
}

async function isPremiumUser(userId) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_user_premium`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ p_user_id: userId }),
  });
  if (!response.ok) {
    console.error("Premium check failed:", await response.text().catch(() => ""));
    // Fail to free tier, not premium — an outage here should never leak paid access
    // (docs/plans/freemium-paywall-v2.md, Edge Cases).
    return false;
  }
  return await response.json();
}

const SYSTEM_PROMPT = `You are Qube, an expert math tutor. Solve math problems step by step.

You handle: arithmetic, algebra, equations, inequalities, systems of equations, factoring, expanding, simplifying, functions, geometry, trigonometry, logarithms, exponents, calculus (derivatives, integrals, limits), probability, statistics, and word problems.

Respond ONLY with a valid JSON object using this exact structure:
{
  "hasMath": true,
  "problemType": "Quadratic Equation",
  "difficulty": "Medium",
  "steps": [
    { "title": "Verb-led title (3-6 words)", "body": "Full explanation of this step showing all work" }
  ],
  "answer": "Final answer (concise)",
  "explanation": "One sentence summary of the method or technique used",
  "commonMistake": "The single most common error students make on this problem type",
  "formula": "Key formula used — omit this field entirely if none applies",
  "practiceQuestion": "A similar follow-up problem at the same difficulty for the student to try"
}

If no math problem is found:
{ "hasMath": false, "message": "Brief description of what you see instead" }

Rules:
- Plain text only — no LaTeX, no markdown, no special symbols except standard math operators
- difficulty must be exactly: Easy, Medium, Hard, or Advanced
- Step titles: short (3-6 words), verb-led — e.g. "Identify the coefficients", "Apply the formula"
- Step bodies: show every calculation clearly, educational tone
- Always include practiceQuestion`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callOpenAI(messages, isRetry = false) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY,
      },
      body: JSON.stringify({ model: "gpt-4o", max_tokens: 2000, messages }),
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
      throw new Error(err.error?.message || "Error " + response.status);
    }
    return await response.json();
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") throw new Error("Request timed out. Please try again.");
    if (!isRetry) return callOpenAI(messages, true);
    throw e;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!OPENAI_API_KEY) throw new Error("Server misconfigured: OPENAI_API_KEY not set.");

    // verify_jwt = true already rejected anything without a validly-signed JWT — the anon
    // key itself is one, so both signed-in users and anonymous guests reach here. Guests
    // are allowed through (the real "N free solves" limit lives client-side), but still
    // need a rate-limit key, so an anonymous caller must supply a deviceId.
    const claims = decodeJwt(req.headers.get("Authorization"));
    if (!claims || (claims.role !== "authenticated" && claims.role !== "anon")) {
      return new Response(JSON.stringify({ error: "Sign in required." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, imageBase64, imageMimeType, deviceId } = await req.json();

    const isAuthenticated = claims.role === "authenticated";
    if (!isAuthenticated && !deviceId) {
      return new Response(JSON.stringify({ error: "Missing device identifier." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowed = isAuthenticated
      ? await checkRateLimit(claims.sub, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS)
      : await checkRateLimit(deviceId, ANON_RATE_LIMIT_MAX, ANON_RATE_LIMIT_WINDOW_SECONDS);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "You've hit the hourly limit for solving problems. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Premium bypasses the weekly product cap entirely, but still passes through the
    // hourly abuse backstop above — "unlimited" means no product limit, not literally
    // no ceiling against a compromised/scripted client.
    const isPremium = isAuthenticated ? await isPremiumUser(claims.sub) : false;
    if (!isPremium) {
      const weeklyKey = isAuthenticated ? claims.sub : deviceId;
      const weeklyAllowed = await checkAndIncrementWeeklySolve(weeklyKey, WEEKLY_FREE_SOLVE_LIMIT);
      if (!weeklyAllowed) {
        return new Response(JSON.stringify({
          error: "You've used your free solves this week.",
          code: "WEEKLY_LIMIT_REACHED",
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    let messages;

    if (text) {
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Solve this problem:\n\n" + text },
      ];
    } else if (imageBase64) {
      const dataUrl = `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}`;
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            { type: "text", text: "Solve the math problem shown in this image. If no math problem is visible, say so." },
          ],
        },
      ];
    } else {
      throw new Error("No input provided.");
    }

    const data = await callOpenAI(messages);
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty response from AI.");

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response. Please try again.");

    const result = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. `supabase secrets set --env-file ./supabase/.env.local OPENAI_API_KEY=sk-...` (or export it before `supabase functions serve`)
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/solve' \
    --header 'Authorization: Bearer <a real user access token or the anon key>' \
    --header 'Content-Type: application/json' \
    --data '{"text":"2x + 3 = 7"}'

*/
