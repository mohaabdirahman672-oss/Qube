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

// Premium's fair-use ceiling. Premium is advertised as "Unlimited (fair use)" —
// this is high enough that no genuine homework session hits it, and exists only
// to cap OpenAI cost from scripted/automated hammering. The Terms of Service
// ("Fair use") state this number; change both together.
const PREMIUM_RATE_LIMIT_MAX = 100;

// Coarse hourly abuse backstop for anonymous callers, keyed by a client-generated
// device ID. Easier to work around (reinstall, clear storage) than the authenticated
// limit above, which is fine — it only needs to stop scripted abuse, not enforce the
// real product limit (that's WEEKLY_FREE_SOLVE_LIMIT below, enforced server-side).
const ANON_RATE_LIMIT_MAX = 10;
const ANON_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

// The actual product free tier (docs/plans/freemium-paywall-v2.md): 20 solves/week,
// resetting Monday 00:00 UTC, tracked server-side (public.weekly_solve_usage) keyed
// by auth uid or device id — NOT client-side, specifically so reinstalling the app
// or clearing storage doesn't reset it. Applies to guests AND signed-in non-Premium
// users alike; only a verified Premium entitlement bypasses it.
const WEEKLY_FREE_SOLVE_LIMIT = 20;

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

async function getWeeklySolveRemaining(key, limit) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_weekly_solve_remaining`, {
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
    return limit; // fail open to free tier, never silently block a paying-eligible user
  }
  return await response.json();
}

// Charges one solve against the weekly cap — called only after a successful AI
// response (see Deno.serve below), never before, so a failed/errored request is
// never charged. Increment-only (no limit re-check): eligibility was already
// confirmed by getWeeklySolveRemaining() before the OpenAI call was even made.
async function incrementWeeklySolve(key) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_weekly_solve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ p_key: key }),
  });
  if (!response.ok) {
    console.error("Weekly solve increment failed:", await response.text().catch(() => ""));
  }
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

// String.raw so the LaTeX examples reach the model exactly as written here
// (\\frac stays \\frac — i.e. correctly JSON-escaped in the example output).
// Field contract (docs/plans/latex-math-rendering.md): `math`, `answerLatex` and
// `formula` are LaTeX and get typeset by the app; every other field is plain text
// shown as-is in lists and titles, so it must never contain LaTeX or ^ notation.
const SYSTEM_PROMPT = String.raw`You are Qube, an expert math tutor. Solve math problems step by step, laid out like a good textbook: each step is one short plain-English sentence followed by the math for that step.

You handle: arithmetic, algebra, equations, inequalities, systems of equations, factoring, expanding, simplifying, functions, geometry, trigonometry, logarithms, exponents, calculus (derivatives, integrals, limits), probability, statistics, and word problems.

Respond ONLY with a valid JSON object using this exact structure:
{
  "hasMath": true,
  "problem": "The problem as given, in plain text with Unicode symbols (e.g. Solve x² − 9 = 0)",
  "problemType": "Quadratic Equation",
  "difficulty": "Medium",
  "steps": [
    {
      "title": "Verb-led title (3-6 words)",
      "explanation": "One or two plain-English sentences: what this step does and why.",
      "math": "LaTeX for this step's working, e.g. \\frac{x^{2}}{3} = 12"
    }
  ],
  "answer": "Final answer in plain text with Unicode, e.g. x = 3/2 or x = −5",
  "answerLatex": "The same final answer in LaTeX, e.g. x = \\frac{3}{2} \\quad \\text{or} \\quad x = -5",
  "explanation": "One sentence summary of the method or technique used",
  "commonMistake": "The single most common error students make on this problem type",
  "formula": "LaTeX of the key formula used, e.g. x = \\frac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a} (omit this field entirely if none applies)",
  "practiceQuestion": "A similar follow-up problem at the same difficulty, in plain text with Unicode symbols"
}

If no math problem is found:
{ "hasMath": false, "message": "Brief description of what you see instead" }

Rules for "math", "answerLatex" and "formula" (LaTeX, typeset by the app):
- LaTeX only, no $ or \( \) delimiters, no markdown.
- Use only standard LaTeX/AMS macros: \frac, \sqrt, \times, \div, \cdot, \pm, \le, \ge, \ne, \pi, \theta, \sin, \cos, \tan, \log, \ln, \lim, \int, \sum, \infty, \left( \right), \text{}, ^{}, _{}.
- Always brace exponents and subscripts: a^{10}, x_{1}.
- If the problem uses ÷ or ×, write \div and \times — don't silently rewrite them as fractions or dots. Use \frac for fractions you create yourself. Never write \/ or a bare / for division.
- One step = one line of working. For a short chain of equalities in one step, use \begin{aligned} ... \end{aligned} with & alignment and \\ line breaks.
- A step that is purely a statement may have "math": "".

Rules for every other field (plain text, shown as-is):
- Never use LaTeX or ^ notation. Use Unicode instead: superscripts (a², x¹⁰, aⁿ), subscripts (x₁), and symbols (÷ × − ± √ π θ ≤ ≥ ≠ °).
- Step explanations: one or two short sentences of plain English describing what the step does and why. Keep math symbols out of them where possible — the math belongs in "math".

Ambiguous notation:
- The notation counts as ambiguous when ÷ or / is directly followed by an implied multiplication — a number or letter right before a bracket or variable, e.g. "÷ 2(b + c)", "÷ 2(a³ × a²)", "1/2x". Nothing else counts.
- In that case use the standard textbook reading: the implied multiplication binds tighter, so 2(b + c) is ONE grouped term that the whole thing is divided by. Step 1's explanation must then begin with one short clause naming the reading, e.g. "Reading 2(a³ × a²) as one grouped term, ...".
- If the problem is not ambiguous, never mention interpretation.

Other rules:
- difficulty must be exactly: Easy, Medium, Hard, or Advanced
- Step titles: short (3-6 words), verb-led — e.g. "Identify the coefficients", "Apply the formula"
- Show every calculation across the steps; don't skip work. Use as many steps as the problem needs (usually 3-6) — never collapse a whole solution into one step.
- Always include practiceQuestion`;

// The model's JSON sometimes single-escapes LaTeX ("\frac" instead of "\\frac").
// Two failure modes, both fixed here:
// 1. Invalid escapes like "\div", "\sqrt", "\left" make JSON.parse throw — those
//    backslashes get doubled before parsing. Valid escape pairs ("\\", "\"", "\n",
//    "²"…) are consumed as pairs first, so already-correct LaTeX is untouched.
// 2. Escapes that happen to be valid JSON — "\frac" (\f), "\times" (\t), "\beta"
//    (\b), "\rho" (\r), "\neq" (\n) — parse silently into control characters.
//    Those are restored to backslash-letter in the LaTeX fields only; a control
//    character never belongs in LaTeX, and a newline there is just whitespace.
function repairJsonEscapes(raw) {
  return raw.replace(/\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})|\\/g, (m) => (m.length > 1 ? m : "\\\\"));
}

function restoreLatexEscapes(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/\f/g, "\\f")
    .replace(/\t/g, "\\t")
    .replace(/\x08/g, "\\b")
    .replace(/\r/g, "\\r")
    .replace(/\n(?=[a-zA-Z])/g, "\\n");
}

// ÷ or / directly followed by an implied multiplication: "÷ 2(", "÷ 2x", "/ 2(", "/2x".
// The prompt's ambiguity rule alone wasn't reliably followed (the model applied the
// textbook reading but silently), so for typed problems — where we can see the text —
// the server detects it and tells the model outright. Photos rely on the prompt rule.
const AMBIGUOUS_DIVISION = /[÷/]\s*\d+(\.\d+)?\s*[(a-zA-Z]/;

function solveUserMessage(text) {
  const note = AMBIGUOUS_DIVISION.test(text)
    ? "\n\nNote: this problem has an implied multiplication right after a division sign, so it is ambiguous. Use the textbook reading (the implied multiplication is one grouped term) and begin step 1's explanation with one short clause saying so. In every step's math, keep that grouped term together as the divisor — in brackets or as a fraction's denominator, e.g. 4a^{6} \\div \\left(2a^{5}\\right) or \\frac{4a^{6}}{2a^{5}} — never split it as \\div 2 \\times ..."
    : "";
  return "Solve this problem:\n\n" + text + note;
}

function fixLatexFields(result) {
  if (!result || result.hasMath === false) return result;
  if (Array.isArray(result.steps)) {
    result.steps = result.steps.map((step) => ({ ...step, math: restoreLatexEscapes(step?.math ?? "") }));
  }
  result.answerLatex = restoreLatexEscapes(result.answerLatex);
  result.formula = restoreLatexEscapes(result.formula);
  return result;
}

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
      // json_object mode guarantees syntactically valid JSON, which LaTeX's
      // backslashes otherwise regularly break. max_tokens raised from 2000: LaTeX
      // working is more verbose than the old plain-text bodies.
      body: JSON.stringify({ model: "gpt-4o", max_tokens: 2500, response_format: { type: "json_object" }, messages }),
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
    // are allowed through and pass through the weekly cap below like anyone else (the
    // real limit is enforced server-side, not client-side — see WEEKLY_FREE_SOLVE_LIMIT),
    // but still need a rate-limit key, so an anonymous caller must supply a deviceId.
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

    // Checked first because it decides the hourly ceiling below. Premium bypasses
    // the weekly product cap entirely and gets the higher fair-use hourly ceiling —
    // "unlimited" means no product limit, not literally no ceiling against a
    // compromised/scripted client.
    const isPremium = isAuthenticated ? await isPremiumUser(claims.sub) : false;

    const allowed = isAuthenticated
      ? await checkRateLimit(claims.sub, isPremium ? PREMIUM_RATE_LIMIT_MAX : RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS)
      : await checkRateLimit(deviceId, ANON_RATE_LIMIT_MAX, ANON_RATE_LIMIT_WINDOW_SECONDS);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "You've hit the hourly limit for solving problems. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const weeklyKey = isAuthenticated ? claims.sub : deviceId;
    if (!isPremium) {
      const remaining = await getWeeklySolveRemaining(weeklyKey, WEEKLY_FREE_SOLVE_LIMIT);
      if (remaining <= 0) {
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
        { role: "user", content: solveUserMessage(text) },
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

    const result = fixLatexFields(JSON.parse(repairJsonEscapes(jsonMatch[0])));

    // Only charged here, after a real AI response came back (hasMath true or
    // false both count — the AI successfully answered either way; only a thrown
    // error above skips this and leaves the weekly count untouched).
    if (!isPremium) await incrementWeeklySolve(weeklyKey);

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
