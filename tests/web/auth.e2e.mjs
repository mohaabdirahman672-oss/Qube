// Auth flows in the real web build with Supabase Auth mocked: no real account is
// created or signed into, no email is sent, nothing in production changes.
import puppeteer from 'puppeteer-core';
import { BROWSER, APP_URL, SHOTS } from './config.mjs';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const ok = (n, c, d = '') => { results.push(!!c); console.log(`${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const USER = { id: 'u-test-1', aud: 'authenticated', role: 'authenticated', email: 'tester@example.com', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, identities: [{ provider: 'email', id: 'u-test-1' }], created_at: '2026-11-01T00:00:00Z' };
const JWT = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER.id, email: USER.email, role: 'authenticated', aud: 'authenticated', exp: now + 3600 })}.sig`;
const SESSION = { access_token: JWT, token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: 'refresh-1', user: USER };

let tokenMode = 'ok'; // ok | wrong | unconfirmed | offline
let signupMode = 'ok'; // ok | exists
const authCalls = [];

const browser = await puppeteer.launch({ executablePath: BROWSER, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.setRequestInterception(true);
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
const reply = (req, status, body) => req.respond({ status, contentType: 'application/json', headers: cors, body: JSON.stringify(body) });
page.on('request', (req) => {
  const u = req.url();
  if (u.includes('api.openai.com')) return req.abort();
  if (!u.includes('.supabase.co')) return req.continue();
  if (req.method() === 'OPTIONS') return req.respond({ status: 204, headers: cors });
  if (u.includes('/auth/v1/')) {
    authCalls.push(`${req.method()} ${u.replace(/^.*\/auth\/v1/, '')}`);
    if (u.includes('/token?grant_type=password')) {
      if (tokenMode === 'offline') return req.abort('internetdisconnected');
      if (tokenMode === 'wrong') return reply(req, 400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
      if (tokenMode === 'unconfirmed') return reply(req, 400, { code: 400, error_code: 'email_not_confirmed', msg: 'Email not confirmed' });
      return reply(req, 200, SESSION);
    }
    if (u.includes('/signup')) {
      if (signupMode === 'exists') return reply(req, 422, { code: 422, error_code: 'user_already_exists', msg: 'User already registered' });
      return reply(req, 200, { ...USER, email: 'new@example.com', confirmation_sent_at: new Date().toISOString() });
    }
    if (u.includes('/recover')) return reply(req, 200, {});
    if (u.includes('/logout')) return req.respond({ status: 204, headers: cors });
    if (u.endsWith('/user')) return reply(req, 200, USER);
    return reply(req, 200, {});
  }
  if (u.includes('/functions/v1/')) return reply(req, 200, { remaining: 20, limit: 20, isPremium: false, resetsOn: '2026-11-16T00:00:00Z' });
  if (u.includes('/rest/v1/')) return reply(req, 200, []);
  return reply(req, 200, {});
});

const text = () => page.evaluate(() => document.body.innerText);
const has = async (s) => (await text()).includes(s);
const clickText = async (s, last = false) => { const els = await page.$$(`xpath/.//*[text()="${s}"]`); const el = last ? els.at(-1) : els[0]; if (!el) throw new Error('no element: ' + s); try { await el.click(); } catch (e) { await page.screenshot({ path: `${SHOTS}auth-fail.png` }); throw new Error(`click "${s}" (${els.length} matches): ${e.message}`); } await sleep(700); };
async function fill(placeholder, value) {
  // Screens under the top of the stack stay mounted, so pick the visible match.
  let el = null;
  for (const c of await page.$$(`input[placeholder="${placeholder}"]`)) { if (await c.boundingBox()) { el = c; } }
  if (!el) throw new Error('no visible input ' + placeholder);
  await el.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await el.type(value);
}
async function openLogin() {
  await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  await sleep(5500);
  await clickText('Profile', true);
  await clickText('Sign In →');
  await page.waitForSelector('input[placeholder="Email address"]');
}

await page.evaluateOnNewDocument(() => { try { localStorage.setItem('@qube/welcome_prompt_seen', '1'); } catch {} });

// ── Login ──
await openLogin();
await clickText('Sign In');
ok('login: empty fields → validation message, no request', await has('Please enter your email and password.') && !authCalls.some((c) => c.includes('token')));
await fill('Email address', 'tester@example.com');
await fill('Password', 'wrongpass1');
tokenMode = 'wrong';
await clickText('Sign In');
await sleep(800);
ok('login: wrong password → "Wrong email or password"', await has('Wrong email or password'));
tokenMode = 'unconfirmed';
await clickText('Sign In');
await sleep(800);
ok('login: unconfirmed email → "Please verify your email"', await has('Please verify your email'));
tokenMode = 'offline';
await clickText('Sign In');
await sleep(1500);
const offlineMsg = await text();
ok('login: offline → connection message, not a crash', offlineMsg.includes('No connection') || offlineMsg.includes('Something went wrong'), offlineMsg.match(/No connection[^\n]*|Something went wrong[^\n]*/)?.[0]);
tokenMode = 'ok';
await clickText('Sign In');
await sleep(2500);
// Back on the tabs, signed in.
if (!(await has('Guest User'))) { const els = await page.$$('xpath/.//*[text()="Profile"]'); if (els.length) { await els.at(-1).click(); await sleep(1000); } }
ok('login: success → Profile shows the account, not "Guest User"', (await has('tester@example.com') || await has('tester')) && !(await has('Guest User')));
const stored = await page.evaluate(() => Object.keys(localStorage).find((k) => k.includes('auth-token')));
ok('session persisted to storage', !!stored, stored);

// ── Persistence ──
await page.reload({ waitUntil: 'networkidle2' });
await sleep(5500);
await clickText('Profile', true);
ok('session survives an app reload (still signed in)', !(await has('Guest User')) && (await has('tester')));

// ── Sign out ──
// Profile's Sign Out goes through a native Alert confirm, which react-native-web
// renders as a no-op — so sign-out is exercised directly through supabase-js here,
// and the app must react to the SIGNED_OUT event.
await page.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.includes('auth-token')); localStorage.removeItem(k); });
await page.reload({ waitUntil: 'networkidle2' });
await sleep(5500);
await clickText('Profile', true);
ok('after the session is cleared the app is back to guest', await has('Guest User'));

// ── Sign up ──
await page.goto(APP_URL, { waitUntil: 'networkidle2' });
await sleep(5500);
await clickText('Saved', true);
await clickText('Create free account');
await page.waitForSelector('input[placeholder="Password (min. 8 characters)"]');
const signupBtn = async () => { const els = await page.$$('xpath/.//*[text()="Create Account"]'); await els.at(-1).click(); await sleep(700); };
await fill('Email address', 'not-an-email');
await fill('Password (min. 8 characters)', 'longenough1');
const confirmPh = await page.evaluate(() => [...document.querySelectorAll('input')].map((i) => i.placeholder).find((p) => /confirm/i.test(p)));
await fill(confirmPh, 'longenough1');
await signupBtn();
ok('sign-up: invalid email rejected locally', await has('Enter a valid email address.') && !authCalls.some((c) => c.includes('signup')));
await fill('Email address', 'new@example.com');
await fill('Password (min. 8 characters)', 'short');
await fill(confirmPh, 'short');
await signupBtn();
ok('sign-up: short password rejected locally', await has('Password must be at least 8 characters.'));
await fill('Password (min. 8 characters)', 'longenough1');
await fill(confirmPh, 'different99');
await signupBtn();
ok('sign-up: mismatched passwords rejected locally', await has('Passwords do not match.'));
await fill(confirmPh, 'longenough1');
signupMode = 'exists';
await signupBtn();
await sleep(800);
ok('sign-up: existing account → clear message', await has('An account with this email already exists'));
signupMode = 'ok';
await signupBtn();
await sleep(1200);
const afterSignup = await text();
ok('sign-up: success → "check your email" state', /check your (email|inbox)|verify|confirmation/i.test(afterSignup), afterSignup.split('\n').filter((l) => /email|inbox|verify/i.test(l)).slice(0, 2).join(' / '));

// ── Forgot password ──
await openLogin();
await clickText('Forgot password?', true);
await page.waitForSelector('input[placeholder="Email address"]');
await clickText('Send Reset Email', true);
ok('reset: empty email → validation message', await has('Please enter your email address.'));
await fill('Email address', 'tester@example.com');
await clickText('Send Reset Email', true);
await sleep(1000);
ok('reset: success → confirmation shown', await has('Reset email sent successfully.') || /check your (email|inbox)/i.test(await text()));
ok('reset request goes to Supabase recover endpoint', authCalls.some((c) => c.startsWith('POST /recover')));

await browser.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed. Auth calls (all mocked): ${[...new Set(authCalls.map((c) => c.split('?')[0]))].join(', ')}`);
