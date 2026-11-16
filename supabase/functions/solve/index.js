// Proxies the math-solve request to OpenAI so the API key never ships in the client bundle.
// verify_jwt = true (see ../../config.toml) means Supabase rejects unauthenticated callers
// before this code runs — only a signed-in app user's session can reach here.
//
// Plain JS, not TypeScript: this project has no TypeScript anywhere else, and Expo's
// `expo start` CLI scans the whole repo (not just the app source) for .ts/.tsx files to
// decide whether to require typescript/@types/react — the one .ts file that used to live
// here was enough to trip that check and block `expo start --web` entirely.

import { runSolve, PRODUCTION_CONFIG } from "./pipeline.js";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    if (!text && !imageBase64) throw new Error("No input provided.");

    const { result } = await runSolve({
      apiKey: OPENAI_API_KEY,
      config: PRODUCTION_CONFIG,
      input: { text, imageBase64, imageMimeType },
    });

    // Only charged here, after a real AI response came back (hasMath true or
    // false both count — the AI successfully answered either way; only a thrown
    // error above skips this and leaves the weekly count untouched). An honest
    // "couldn't finish" (status "partial") is free (docs/plans/solve-quality.md,
    // owner decision 3).
    if (!isPremium && result?.status !== "partial") await incrementWeeklySolve(weeklyKey);

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
