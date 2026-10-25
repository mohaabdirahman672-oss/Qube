// In-app account deletion (App Store guideline 5.1.1(v)) — docs/plans/account-deletion.md.
// Deletes the caller's data, revokes Sign in with Apple (Apple's separate requirement),
// optionally removes the RevenueCat customer, then deletes the auth user LAST so a
// failure partway through leaves a retryable account, never a half-deleted one.
//
// Plain JS, not TypeScript — see solve/index.js for why.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Sign in with Apple key (developer.apple.com → Keys). Optional so the function works
// before the key exists — but must be set before App Review (plan: "Secrets").
const APPLE_TEAM_ID = Deno.env.get("APPLE_TEAM_ID");
const APPLE_CLIENT_ID = Deno.env.get("APPLE_CLIENT_ID") || "com.qube.mathapp";
const APPLE_KEY_ID = Deno.env.get("APPLE_KEY_ID");
const APPLE_PRIVATE_KEY = Deno.env.get("APPLE_PRIVATE_KEY");

// Optional: RevenueCat secret (sk_) key. Skipped until RevenueCat is set up (checklist C3).
const REVENUECAT_SECRET_KEY = Deno.env.get("REVENUECAT_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const serviceHeaders = {
  "apikey": SUPABASE_SERVICE_ROLE_KEY,
  "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
};

// Resolve the caller from their own access token — the uid is never taken from the body.
async function getCaller(authHeader) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": authHeader },
  });
  if (!response.ok) return null;
  const user = await response.json();
  return user?.id ? user : null;
}

async function deleteRows(table, column, value) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}`,
    { method: "DELETE", headers: serviceHeaders },
  );
  if (!response.ok) {
    throw new Error(`delete from ${table} failed: ${response.status} ${await response.text().catch(() => "")}`);
  }
}

// ── Sign in with Apple revoke ────────────────────────────────────────────────

function base64UrlEncode(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ES256 client_secret JWT for appleid.apple.com. WebCrypto's ECDSA signature is already
// the raw r||s form JWS expects, so no DER conversion or library is needed.
async function appleClientSecret() {
  // Secrets set from a shell often carry the PEM's newlines as literal "\n" — strip
  // the armor and every kind of whitespace so either form decodes.
  const pem = APPLE_PRIVATE_KEY
    .replace(/\\n/g, "\n")
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"],
  );

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "ES256", kid: APPLE_KEY_ID }));
  const payload = base64UrlEncode(JSON.stringify({
    iss: APPLE_TEAM_ID,
    iat: now,
    exp: now + 300,
    aud: "https://appleid.apple.com",
    sub: APPLE_CLIENT_ID,
  }));
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(`${header}.${payload}`),
  );
  return `${header}.${payload}.${base64UrlEncode(signature)}`;
}

async function applePost(path, params) {
  return fetch(`https://appleid.apple.com${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
}

// Returns true when Apple confirmed the revoke. Never throws — a failed revoke must not
// block deletion (plan: Risks), it's logged and reported back as appleRevoked: false.
async function revokeApple(authorizationCode) {
  if (!APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY) {
    console.warn("[delete-account] Apple secrets not set — skipping Sign in with Apple revoke");
    return false;
  }
  try {
    const clientSecret = await appleClientSecret();
    const tokenResponse = await applePost("/auth/token", {
      client_id: APPLE_CLIENT_ID,
      client_secret: clientSecret,
      code: authorizationCode,
      grant_type: "authorization_code",
    });
    const tokens = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok) {
      console.error("[delete-account] Apple token exchange failed", tokenResponse.status, tokens?.error);
      return false;
    }

    const token = tokens.refresh_token || tokens.access_token;
    const revokeResponse = await applePost("/auth/revoke", {
      client_id: APPLE_CLIENT_ID,
      client_secret: clientSecret,
      token,
      token_type_hint: tokens.refresh_token ? "refresh_token" : "access_token",
    });
    if (!revokeResponse.ok) {
      console.error("[delete-account] Apple revoke failed", revokeResponse.status, await revokeResponse.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[delete-account] Apple revoke error", e?.message);
    return false;
  }
}

// Best effort, same reasoning as revokeApple: RevenueCat being down mustn't block deletion.
async function deleteRevenueCatCustomer(userId) {
  if (!REVENUECAT_SECRET_KEY) return;
  try {
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + REVENUECAT_SECRET_KEY },
    });
    if (!response.ok && response.status !== 404) {
      console.error("[delete-account] RevenueCat delete failed", response.status);
    }
  } catch (e) {
    console.error("[delete-account] RevenueCat delete error", e?.message);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const user = await getCaller(req.headers.get("Authorization"));
    if (!user) return json({ error: "Sign in required." }, 401);
    const uid = user.id;

    const { appleAuthorizationCode } = await req.json().catch(() => ({}));
    const isAppleUser = (user.identities || []).some((i) => i.provider === "apple")
      || (user.app_metadata?.providers || []).includes("apple");

    let appleRevoked = null; // null = not an Apple user
    if (isAppleUser) {
      appleRevoked = appleAuthorizationCode ? await revokeApple(appleAuthorizationCode) : false;
    }

    // Explicit deletes rather than FK cascades: saved_problems / custom_flashcards were
    // created in the dashboard, so their FK behaviour isn't recorded in migrations.
    await deleteRows("saved_problems", "user_id", uid);
    await deleteRows("custom_flashcards", "user_id", uid);
    await deleteRows("weekly_solve_usage", "key", uid); // signed-in usage key is the raw uid
    await deleteRows("solve_rate_limits", "user_id", uid);
    await deleteRows("user_entitlements", "user_id", uid);

    await deleteRevenueCatCustomer(uid);

    const deleteUser = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${uid}`, {
      method: "DELETE",
      headers: serviceHeaders,
    });
    if (!deleteUser.ok) {
      throw new Error(`auth user delete failed: ${deleteUser.status} ${await deleteUser.text().catch(() => "")}`);
    }

    console.log("[delete-account] deleted", uid, { appleRevoked });
    return json({ ok: true, appleRevoked });
  } catch (e) {
    console.error("[delete-account] failed", e?.message);
    return json({ error: "Could not delete account." }, 500);
  }
});
