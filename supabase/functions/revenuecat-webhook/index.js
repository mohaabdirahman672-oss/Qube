// Receives RevenueCat webhook events and keeps public.user_entitlements in sync,
// so the solve function (and any other server-side premium check) can trust a
// Supabase-side table instead of ever taking a client's word for "I'm premium."
//
// RevenueCat calls this directly (not through the app), so there's no Supabase JWT
// to verify — auth is a shared secret you set both in the RevenueCat dashboard
// (Project Settings > Webhooks > Authorization header) and as the
// REVENUECAT_WEBHOOK_SECRET env var here. verify_jwt = false for this function
// (see ../../config.toml) since RevenueCat can't send a Supabase-signed JWT.
//
// Plain JS, not TypeScript — see solve/index.js for why (this repo has no
// TypeScript anywhere else, and expo start's CLI scans the whole repo for .ts files).

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const REVENUECAT_WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");

// Event types that mean "this user is currently entitled" vs. "they are not."
// https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
const ACTIVE_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
]);
const INACTIVE_EVENTS = new Set(["EXPIRATION"]);
// CANCELLATION means "won't renew" but stays active until expiry — handled as a
// will_renew flip, not a premium flip (see below).

async function upsertEntitlement(userId, fields) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/user_entitlements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      "Prefer": "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ user_id: userId, updated_at: new Date().toISOString(), ...fields }),
  });
  if (!response.ok) {
    throw new Error(`Failed to upsert entitlement: ${response.status} ${await response.text().catch(() => "")}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");

  try {
    if (!REVENUECAT_WEBHOOK_SECRET) throw new Error("Server misconfigured: REVENUECAT_WEBHOOK_SECRET not set.");

    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${REVENUECAT_WEBHOOK_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const event = body?.event;
    if (!event) return new Response(JSON.stringify({ error: "Missing event" }), { status: 400 });

    // app_user_id is set to our own Supabase auth uid at Purchases.configure() time
    // (see src/lib/iap.js) — purchases only ever happen for signed-in users, so this
    // is always a real uid, not a RevenueCat-generated anonymous id.
    const userId = event.app_user_id;
    const eventType = event.type;

    if (!userId || !eventType) {
      return new Response(JSON.stringify({ error: "Missing app_user_id or type" }), { status: 400 });
    }

    if (ACTIVE_EVENTS.has(eventType)) {
      await upsertEntitlement(userId, {
        revenuecat_user_id: userId,
        is_premium: true,
        product_id: event.product_id ?? null,
        expires_at: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
        will_renew: true,
      });
    } else if (eventType === "CANCELLATION") {
      // Still entitled until expiry — just won't renew. Leave is_premium as-is;
      // is_user_premium() already checks expires_at, so no separate expiry job needed.
      await upsertEntitlement(userId, {
        revenuecat_user_id: userId,
        will_renew: false,
      });
    } else if (INACTIVE_EVENTS.has(eventType)) {
      await upsertEntitlement(userId, {
        revenuecat_user_id: userId,
        is_premium: false,
        will_renew: false,
      });
    }
    // Other event types (BILLING_ISSUE, TRANSFER, SUBSCRIBER_ALIAS, TEST) are
    // logged by RevenueCat's own dashboard and don't need a local state change yet.

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[revenuecat-webhook] error", e.message);
    // Non-2xx makes RevenueCat retry with backoff — correct behavior for a real
    // failure (unlike solve's fail-open rate-limit check, entitlement writes must
    // not be silently dropped).
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500 });
  }
});
