// Read-only(ish) companion to solve/index.js's weekly cap: lets the client show
// "N free solves left" / the paywall's reset day *before* attempting a solve,
// without consuming one. Also handles the one-time anonymous-device -> account
// merge right after sign-in (docs/plans/freemium-paywall-v2.md, decision 3).
//
// Plain JS, not TypeScript — see solve/index.js for why.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const WEEKLY_FREE_SOLVE_LIMIT = 10; // keep in sync with solve/index.js

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

async function rpc(name, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${name} failed: ${response.status} ${await response.text().catch(() => "")}`);
  }
  // A `returns void` Postgres function (merge_weekly_solve_usage) comes back from
  // PostgREST as 204 No Content with an empty body — response.json() throws on
  // that ("Unexpected end of JSON input"), which was silently turning a successful
  // merge into a reported failure. Parse only when there's actually a body.
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Next Monday 00:00 UTC, for the paywall's "or wait until [reset day]" copy.
function nextResetDate() {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday .. 1 = Monday
  const daysUntilMonday = day === 1 ? 7 : ((8 - day) % 7 || 7);
  const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday));
  return reset.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const claims = decodeJwt(req.headers.get("Authorization"));
    if (!claims || (claims.role !== "authenticated" && claims.role !== "anon")) {
      return new Response(JSON.stringify({ error: "Sign in required." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isAuthenticated = claims.role === "authenticated";
    const { deviceId, mergeDeviceId } = await req.json().catch(() => ({}));

    if (!isAuthenticated && !deviceId) {
      return new Response(JSON.stringify({ error: "Missing device identifier." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // One-time: a guest just signed in and is handing us their device id so its
    // usage this week merges into the account instead of resetting for free.
    if (isAuthenticated && mergeDeviceId) {
      await rpc("merge_weekly_solve_usage", {
        p_device_key: mergeDeviceId,
        p_user_key: claims.sub,
        p_limit: WEEKLY_FREE_SOLVE_LIMIT,
      });
    }

    const isPremium = isAuthenticated ? await rpc("is_user_premium", { p_user_id: claims.sub }) : false;
    const key = isAuthenticated ? claims.sub : deviceId;
    const remaining = isPremium
      ? WEEKLY_FREE_SOLVE_LIMIT
      : await rpc("get_weekly_solve_remaining", { p_key: key, p_limit: WEEKLY_FREE_SOLVE_LIMIT });

    return new Response(JSON.stringify({
      remaining,
      limit: WEEKLY_FREE_SOLVE_LIMIT,
      isPremium,
      resetsOn: nextResetDate(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
