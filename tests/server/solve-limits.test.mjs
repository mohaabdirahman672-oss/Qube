// Offline tests for the free-tier and abuse limits in supabase/functions/solve.
// The real function runs under Node with a Deno shim; Supabase RPCs AND OpenAI are
// mocked, so no paid API call is made and no database row changes.
//
//   node --test "tests/**/*.test.mjs"
//
// docs/plans/freemium-paywall-v2.md

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const FN = pathToFileURL(join(import.meta.dirname, '..', '..', 'supabase', 'functions', 'solve', 'index.js')).href;
const SOLUTION = { hasMath: true, problem: '2x + 3 = 7', problemType: 'Linear Equation', difficulty: 'Easy', steps: [{ title: 'Subtract 3', explanation: 'Move the constant.', math: '2x = 4' }], answer: 'x = 2', answerLatex: 'x = 2', explanation: 'Isolate x.', commonMistake: 'Sign errors.', practiceQuestion: 'Solve 3x − 1 = 8' };

let loads = 0;
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const token = (claims) => `Bearer ${b64({ alg: 'HS256' })}.${b64(claims)}.sig`;
const SIGNED_IN = token({ role: 'authenticated', sub: 'user-1' });
const GUEST = token({ role: 'anon' });

// world: { premium, rateAllowed, remaining, openai: 'ok' | 'fail' | 'nomath' | [reply, reply, …] }
// An array gives successive OpenAI replies (the last one repeats).
async function load(world = {}) {
  const w = { premium: false, rateAllowed: true, remaining: 10, openai: 'ok', ...world };
  const env = { OPENAI_API_KEY: 'sk-test-not-real', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-test' };
  let handler;
  globalThis.Deno = { env: { get: (k) => env[k] }, serve: (h) => { handler = h; } };
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    url = String(url);
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ url, body });
    const ok = (v) => new Response(JSON.stringify(v), { status: 200, headers: { 'Content-Type': 'application/json' } });
    if (url.includes('api.openai.com')) {
      if (w.openai === 'fail') return new Response(JSON.stringify({ error: { message: 'upstream down' } }), { status: 500 });
      const n = calls.filter((c) => c.url.includes('api.openai.com')).length - 1;
      const content = Array.isArray(w.openai) ? w.openai[Math.min(n, w.openai.length - 1)]
        : w.openai === 'nomath' ? { hasMath: false, message: 'A photo of a cat.' } : SOLUTION;
      return ok({ choices: [{ message: { content: JSON.stringify(content) } }], usage: { prompt_tokens: 1, completion_tokens: 1 } });
    }
    if (url.endsWith('/rpc/is_user_premium')) return ok(w.premium);
    if (url.endsWith('/rpc/check_and_increment_rate_limit')) return ok(w.rateAllowed);
    if (url.endsWith('/rpc/get_weekly_solve_remaining')) return ok(w.remaining);
    if (url.endsWith('/rpc/increment_weekly_solve')) return new Response(null, { status: 204 });
    throw new Error('unexpected fetch ' + url);
  };
  await import(`${FN}?v=${++loads}`);
  const call = (body, auth = SIGNED_IN) => handler(new Request('https://fn/solve', {
    method: 'POST',
    headers: { ...(auth ? { Authorization: auth } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
  const count = (frag) => calls.filter((c) => c.url.includes(frag)).length;
  const rpc = (name) => calls.find((c) => c.url.endsWith(`/rpc/${name}`));
  return { call, calls, count, rpc };
}

test('no session token → 401, nothing else runs', async () => {
  const { call, calls } = await load();
  const res = await call({ text: '1+1' }, null);
  assert.equal(res.status, 401);
  assert.equal(calls.length, 0);
});

test('guest without a device id → 400, no OpenAI call', async () => {
  const { call, count } = await load();
  assert.equal((await call({ text: '1+1' }, GUEST)).status, 400);
  assert.equal(count('api.openai.com'), 0);
});

test('free user under the limit: solved, charged exactly once, after the AI answered', async () => {
  const { call, calls, count, rpc } = await load({ remaining: 5 });
  const res = await call({ text: '2x + 3 = 7' });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).answer, 'x = 2');
  assert.equal(count('api.openai.com'), 1);
  assert.equal(count('/rpc/increment_weekly_solve'), 1);
  const ai = calls.findIndex((c) => c.url.includes('api.openai.com'));
  const charge = calls.findIndex((c) => c.url.endsWith('/rpc/increment_weekly_solve'));
  assert.ok(ai < charge, 'charged only after the AI responded');
  assert.equal(rpc('get_weekly_solve_remaining').body.p_limit, 20, 'free tier is 20/week');
  assert.equal(rpc('increment_weekly_solve').body.p_key, 'user-1', 'signed-in usage is keyed by uid');
});

test('free user at the weekly limit → 402 WEEKLY_LIMIT_REACHED, no AI call, no charge', async () => {
  const { call, count } = await load({ remaining: 0 });
  const res = await call({ text: '2x + 3 = 7' });
  assert.equal(res.status, 402);
  assert.deepEqual(await res.json(), { error: "You've used your free solves this week.", code: 'WEEKLY_LIMIT_REACHED' });
  assert.equal(count('api.openai.com'), 0);
  assert.equal(count('/rpc/increment_weekly_solve'), 0);
});

test('a failed AI call is never charged', async () => {
  const { call, count } = await load({ openai: 'fail' });
  const res = await call({ text: '2x + 3 = 7' });
  assert.equal(res.status, 400);
  assert.equal(count('/rpc/increment_weekly_solve'), 0);
  assert.equal(count('api.openai.com'), 2, 'one retry, then gives up');
});

test('Premium: no weekly check, no charge, and the 100/hour fair-use ceiling', async () => {
  const { call, count, rpc } = await load({ premium: true, remaining: 0 });
  const res = await call({ text: '2x + 3 = 7' });
  assert.equal(res.status, 200, 'weekly cap does not apply to Premium');
  assert.equal(count('/rpc/get_weekly_solve_remaining'), 0);
  assert.equal(count('/rpc/increment_weekly_solve'), 0);
  assert.equal(rpc('check_and_increment_rate_limit').body.p_limit, 100);
});

test('free signed-in user gets the 20/hour abuse ceiling', async () => {
  const { call, rpc } = await load();
  await call({ text: '1+1' });
  assert.equal(rpc('check_and_increment_rate_limit').body.p_limit, 20);
});

test('hourly ceiling hit → 429 with a clear message, no AI call', async () => {
  const { call, count } = await load({ rateAllowed: false });
  const res = await call({ text: '1+1' });
  assert.equal(res.status, 429);
  assert.match((await res.json()).error, /hourly limit/);
  assert.equal(count('api.openai.com'), 0);
});

test('guest: keyed by device id, 10/hour ceiling, same weekly cap', async () => {
  const { call, rpc } = await load({ remaining: 3 });
  const res = await call({ text: '1+1', deviceId: 'device-abc' }, GUEST);
  assert.equal(res.status, 200);
  assert.equal(rpc('check_and_increment_rate_limit').body.p_user_id, 'device-abc');
  assert.equal(rpc('check_and_increment_rate_limit').body.p_limit, 10);
  assert.equal(rpc('get_weekly_solve_remaining').body.p_key, 'device-abc');
  assert.equal(rpc('increment_weekly_solve').body.p_key, 'device-abc');
});

test('a guest cannot skip the weekly cap by claiming Premium (only signed-in users are checked)', async () => {
  const { call, count } = await load({ premium: true, remaining: 0 });
  const res = await call({ text: '1+1', deviceId: 'device-abc' }, GUEST);
  assert.equal(res.status, 402);
  assert.equal(count('/rpc/is_user_premium'), 0);
});

// ── Answer verification and honest partial results (docs/plans/solve-quality.md) ──

const OWNER_EQ = '2*(x+1/x)^2 = 10 - x - 1/x';
const RIGHT = { ...SOLUTION, status: 'solved', answer: 'x = 1, −2 or −1/2', check: { kind: 'equation', variable: 'x', equation: OWNER_EQ, solutions: ['1', '-2', '-1/2'] } };
const WRONG = { ...SOLUTION, status: 'solved', answer: 'x = −1 or −2', check: { kind: 'equation', variable: 'x', equation: OWNER_EQ, solutions: ['-1', '-2'] } };
const PARTIAL = { ...SOLUTION, status: 'partial', answer: "I couldn't finish this one. Here's how far I got.", answerLatex: undefined, stuckReason: 'The quartic did not factor.' };
const aiBodies = (calls) => calls.filter((c) => c.url.includes('api.openai.com')).map((c) => c.body);

test('production model: gpt-5.4 at low reasoning effort, no temperature', async () => {
  const { call, calls } = await load();
  await call({ text: '2x + 3 = 7' });
  const [body] = aiBodies(calls);
  assert.equal(body.model, 'gpt-5.4');
  assert.equal(body.reasoning_effort, 'low');
  assert.equal(body.temperature, undefined);
  assert.ok(body.max_completion_tokens >= 4000);
});

test('a verified answer is marked verified, the server-only check is stripped, one AI call', async () => {
  const { call, count } = await load({ openai: [RIGHT] });
  const body = await (await call({ text: OWNER_EQ })).json();
  assert.equal(body.verified, true);
  assert.equal(body.check, undefined);
  assert.equal(count('api.openai.com'), 1);
});

test('a provably wrong answer is retried with specific feedback; a correct retry is returned verified', async () => {
  const { call, calls, count } = await load({ openai: [WRONG, RIGHT] });
  const body = await (await call({ text: OWNER_EQ })).json();
  assert.equal(count('api.openai.com'), 2);
  assert.equal(body.verified, true);
  assert.equal(body.answer, RIGHT.answer);
  const retry = aiBodies(calls)[1].messages.at(-1).content;
  assert.match(retry, /x = -1 does not satisfy the equation: the left side is 8 and the right side is 12/);
  assert.equal(count('/rpc/increment_weekly_solve'), 1, 'charged once, not per attempt');
});

test('still wrong after the retry → returned with verified: false (app shows "check it yourself")', async () => {
  const { call, count } = await load({ openai: [WRONG, WRONG] });
  const body = await (await call({ text: OWNER_EQ })).json();
  assert.equal(count('api.openai.com'), 2, 'exactly one retry');
  assert.equal(body.verified, false);
});

test('an unparseable check never blocks: returned as-is, no retry, no verified flag', async () => {
  const { call, count } = await load({ openai: [{ ...SOLUTION, check: { kind: 'equation', equation: '\\frac{1}{x}=2', solutions: ['1/2'] } }] });
  const body = await (await call({ text: '1/x = 2' })).json();
  assert.equal(count('api.openai.com'), 1);
  assert.equal(body.verified, undefined);
});

test('an honest partial result is returned, never verified, and NOT charged', async () => {
  const { call, count } = await load({ openai: [PARTIAL] });
  const res = await call({ text: 'x^5 + x + 1 = 0' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'partial');
  assert.equal(body.verified, undefined);
  assert.equal(count('api.openai.com'), 1);
  assert.equal(count('/rpc/increment_weekly_solve'), 0);
});

test('a retry that admits it is stuck returns the partial, uncharged', async () => {
  const { call, count } = await load({ openai: [WRONG, PARTIAL] });
  const body = await (await call({ text: OWNER_EQ })).json();
  assert.equal(body.status, 'partial');
  assert.equal(count('/rpc/increment_weekly_solve'), 0);
});

test('"no math found" still counts as an answered request (current documented behaviour)', async () => {
  const { call, count } = await load({ openai: 'nomath' });
  const res = await call({ text: 'hello' });
  assert.equal((await res.json()).hasMath, false);
  assert.equal(count('/rpc/increment_weekly_solve'), 1);
});
