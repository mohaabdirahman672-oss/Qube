// Offline tests for supabase/functions/delete-account/index.js.
// Runs the real function under Node with a Deno shim and a mocked fetch, so no live
// account, database row, Apple or RevenueCat endpoint is ever touched.
//
//   node --test tests/server/
//
// docs/plans/account-deletion.md

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The function is a plain script (Deno globals, no imports), so it's evaluated fresh
// for every scenario rather than imported (Node would cache it after the first load).
const SOURCE = readFileSync(join(import.meta.dirname, '..', '..', 'supabase', 'functions', 'delete-account', 'index.js'), 'utf8');
const SUPABASE_URL = 'https://example.supabase.co';
const TABLES = ['saved_problems', 'custom_flashcards', 'weekly_solve_usage', 'solve_rate_limits', 'user_entitlements'];

let appleKeyPem = null;

async function makeApplePem() {
  if (appleKeyPem) return appleKeyPem;
  const { privateKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const der = Buffer.from(await crypto.subtle.exportKey('pkcs8', privateKey)).toString('base64');
  // Literal "\n" sequences, the way a secret pasted from a shell often arrives.
  appleKeyPem = `-----BEGIN PRIVATE KEY-----\\n${der.match(/.{1,64}/g).join('\\n')}\\n-----END PRIVATE KEY-----`;
  return appleKeyPem;
}

// Loads a fresh copy of the function with the given secrets and a scripted fetch.
// routes: (url, init) => Response | undefined. Every call is recorded in `calls`.
async function load({ apple = false, revenuecat = false, routes = () => undefined } = {}) {
  const env = { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: 'service-role-test' };
  if (apple) Object.assign(env, { APPLE_TEAM_ID: 'TEAM123', APPLE_KEY_ID: 'KEY123', APPLE_PRIVATE_KEY: await makeApplePem() });
  if (revenuecat) env.REVENUECAT_SECRET_KEY = 'sk_test';
  let handler;
  globalThis.Deno = { env: { get: (k) => env[k] }, serve: (h) => { handler = h; } };
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET', init });
    const r = routes(String(url), init);
    if (r) return r;
    return new Response('{}', { status: 200 });
  };
  new Function('Deno', 'fetch', SOURCE)(globalThis.Deno, globalThis.fetch);
  const call = (body, { auth = 'Bearer user-token', method = 'POST' } = {}) => handler(new Request('https://fn/delete-account', {
    method,
    headers: auth ? { Authorization: auth, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined,
  }));
  return { call, calls };
}

const user = (extra = {}) => ({ id: 'user-1', identities: [{ provider: 'email' }], app_metadata: { providers: ['email'] }, ...extra });
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const authUser = (u) => (url) => (url.endsWith('/auth/v1/user') ? json(u) : undefined);
const quiet = () => { const e = console.error, w = console.warn, l = console.log; console.error = console.warn = console.log = () => {}; return () => { console.error = e; console.warn = w; console.log = l; }; };

test('rejects a request without a valid session and deletes nothing', async () => {
  const { call, calls } = await load({ routes: (url) => (url.endsWith('/auth/v1/user') ? json({ msg: 'bad jwt' }, 401) : undefined) });
  const res = await call({}, { auth: 'Bearer forged' });
  assert.equal(res.status, 401);
  assert.ok(!calls.some((c) => c.method === 'DELETE'), 'no DELETE calls');
});

test('rejects non-POST methods', async () => {
  const { call } = await load();
  assert.equal((await call(null, { method: 'GET' })).status, 405);
});

test('email user: deletes every table, then the auth user last', async () => {
  const restore = quiet();
  const { call, calls } = await load({ routes: authUser(user()) });
  const res = await call({});
  restore();
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, appleRevoked: null });
  const deletes = calls.filter((c) => c.method === 'DELETE').map((c) => c.url);
  for (const t of TABLES) assert.ok(deletes.some((u) => u.includes(`/rest/v1/${t}?`) && u.includes('eq.user-1')), `deletes ${t}`);
  assert.ok(deletes.at(-1).endsWith('/auth/v1/admin/users/user-1'), 'auth user deleted last');
  assert.ok(!calls.some((c) => c.url.includes('appleid.apple.com')), 'no Apple call for an email user');
});

test('uses the uid from the verified token, never one from the request body', async () => {
  const restore = quiet();
  const { call, calls } = await load({ routes: authUser(user()) });
  await call({ userId: 'victim', uid: 'victim', user_id: 'victim' });
  restore();
  assert.ok(!calls.some((c) => c.url.includes('victim')), 'never touches another user');
});

test('a failed table delete stops before the auth user is deleted (retryable, never half-deleted)', async () => {
  const restore = quiet();
  const { call, calls } = await load({
    routes: (url, init) => authUser(user())(url) ?? (url.includes('/rest/v1/custom_flashcards') && init.method === 'DELETE' ? new Response('boom', { status: 500 }) : undefined),
  });
  const res = await call({});
  restore();
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { error: 'Could not delete account.' }, 'no internal detail leaked');
  assert.ok(!calls.some((c) => c.url.includes('/auth/v1/admin/users/')), 'auth user NOT deleted');
});

test('a failed auth-user delete reports failure', async () => {
  const restore = quiet();
  const { call } = await load({ routes: (url) => authUser(user())(url) ?? (url.includes('/auth/v1/admin/users/') ? new Response('nope', { status: 500 }) : undefined) });
  const res = await call({});
  restore();
  assert.equal(res.status, 500);
});

test('Apple user with a code: exchanges it, revokes, then deletes', async () => {
  const restore = quiet();
  let secretJwt = null;
  const { call, calls } = await load({
    apple: true,
    routes: (url, init) => {
      const u = authUser(user({ identities: [{ provider: 'apple' }], app_metadata: { providers: ['apple'] } }))(url);
      if (u) return u;
      if (url.endsWith('/auth/token')) { secretJwt = new URLSearchParams(init.body).get('client_secret'); return json({ refresh_token: 'rt-1' }); }
      if (url.endsWith('/auth/revoke')) return new Response('', { status: 200 });
      return undefined;
    },
  });
  const res = await call({ appleAuthorizationCode: 'code-1' });
  restore();
  assert.equal(res.status, 200);
  assert.equal((await res.json()).appleRevoked, true);
  const order = calls.map((c) => c.url);
  const revokeAt = order.findIndex((u) => u.endsWith('/auth/revoke'));
  const firstDelete = calls.findIndex((c) => c.method === 'DELETE');
  assert.ok(revokeAt >= 0 && revokeAt < firstDelete, 'revoke happens before any delete');
  const revokeBody = new URLSearchParams(calls[revokeAt].init.body);
  assert.equal(revokeBody.get('token'), 'rt-1');
  assert.equal(revokeBody.get('token_type_hint'), 'refresh_token');
  // client_secret is a 3-part ES256 JWT with the right claims.
  const [h, p, s] = secretJwt.split('.');
  assert.ok(s && s.length > 40);
  const header = JSON.parse(Buffer.from(h, 'base64url'));
  const claims = JSON.parse(Buffer.from(p, 'base64url'));
  assert.deepEqual(header, { alg: 'ES256', kid: 'KEY123' });
  assert.equal(claims.iss, 'TEAM123');
  assert.equal(claims.aud, 'https://appleid.apple.com');
  assert.equal(claims.sub, 'com.qube.mathapp');
});

test('Apple revoke failing never blocks deletion (appleRevoked: false)', async () => {
  const restore = quiet();
  const { call, calls } = await load({
    apple: true,
    routes: (url) => authUser(user({ identities: [{ provider: 'apple' }] }))(url) ?? (url.includes('appleid.apple.com') ? json({ error: 'invalid_grant' }, 400) : undefined),
  });
  const res = await call({ appleAuthorizationCode: 'expired' });
  restore();
  assert.equal(res.status, 200);
  assert.equal((await res.json()).appleRevoked, false);
  assert.ok(calls.some((c) => c.url.includes('/auth/v1/admin/users/user-1')), 'account still deleted');
});

test('Apple user without a code: deleted, reported as not revoked', async () => {
  const restore = quiet();
  const { call, calls } = await load({ apple: true, routes: authUser(user({ app_metadata: { providers: ['email', 'apple'] } })) });
  const res = await call({});
  restore();
  assert.equal((await res.json()).appleRevoked, false);
  assert.ok(!calls.some((c) => c.url.includes('appleid.apple.com')));
});

test('RevenueCat being down never blocks deletion', async () => {
  const restore = quiet();
  const { call, calls } = await load({
    revenuecat: true,
    routes: (url) => authUser(user())(url) ?? (url.includes('api.revenuecat.com') ? new Response('down', { status: 503 }) : undefined),
  });
  const res = await call({});
  restore();
  assert.equal(res.status, 200);
  assert.ok(calls.some((c) => c.url.includes('api.revenuecat.com/v1/subscribers/user-1')));
});
