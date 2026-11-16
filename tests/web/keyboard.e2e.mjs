// Drives the real Qube web build (expo start --web) in headless Edge to test the
// math keypad. ALL Supabase function calls are intercepted and answered with mocks,
// and api.openai.com is blocked outright: no paid API call, no production writes.
import puppeteer from 'puppeteer-core';
import { BROWSER, APP_URL, SHOTS } from './config.mjs';

const URL_APP = APP_URL;
const results = [];
const ok = (name, cond, detail = '') => { results.push({ name, pass: !!cond, detail }); console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); };

const MOCK_SOLUTION = {
  hasMath: true, problem: 'x² + 3/4 = 1', problemType: 'Linear Equation', difficulty: 'Easy',
  steps: [{ title: 'Subtract three quarters', explanation: 'Move the constant to the right side.', math: 'x^{2} = \\frac{1}{4}' },
          { title: 'Take the square root', explanation: 'Both signs work.', math: 'x = \\pm\\frac{1}{2}' }],
  answer: 'x = ±1/2', answerLatex: 'x = \\pm\\frac{1}{2}', explanation: 'Isolate x² then take roots.',
  commonMistake: 'Forgetting the negative root.', practiceQuestion: 'Solve x² − 9 = 0',
};

const solveBodies = [];
const browser = await puppeteer.launch({
  executablePath: BROWSER,
  headless: true,
  args: ['--no-first-run', '--disable-extensions'],
});
const page = await browser.newPage();
await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.setRequestInterception(true);
page.on('request', (req) => {
  const url = req.url();
  if (url.includes('api.openai.com')) return req.abort();
  if (url.includes('/functions/v1/')) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
    if (req.method() === 'OPTIONS') return req.respond({ status: 204, headers: cors });
    let body;
    if (url.includes('/solve')) { solveBodies.push(JSON.parse(req.postData() || '{}')); body = MOCK_SOLUTION; }
    else if (url.includes('/weekly-usage')) body = { remaining: 17, limit: 20, isPremium: false, resetsOn: '2026-11-16T00:00:00Z' };
    else body = {};
    return req.respond({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(body) });
  }
  req.continue();
});
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(String(e.message || e)));
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const byTestId = (id) => page.$(`[data-testid="${id}"]`);
async function tap(id) {
  const el = await byTestId(id);
  if (!el) throw new Error('missing ' + id);
  await el.click();
  await sleep(120);
}
async function fieldFrame() {
  const handle = await page.waitForSelector('iframe[data-testid="math-field-frame"]', { timeout: 30000 });
  return handle.contentFrame();
}
const latex = async () => (await fieldFrame()).evaluate(() => document.getElementById('mf').value);
const setField = async (v) => (await fieldFrame()).evaluate((x) => { const mf = document.getElementById('mf'); mf.value = x; mf.dispatchEvent(new Event('input')); }, v);

await page.evaluateOnNewDocument(() => { try { localStorage.setItem('@qube/welcome_prompt_seen', '1'); } catch {} });
await page.goto(URL_APP, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(4000); // splash
// The guest "Welcome to Qube" sheet can appear on top of anything; close it.
async function dismissWelcome() {
  const [later] = await page.$$('xpath/.//*[text()="Maybe Later"]');
  if (later) { await later.click().catch(() => {}); await sleep(700); }
}
// Is a bottom-nav label (Home/Saved/Profile) visible at the bottom of the screen?
const tabBarVisible = () => page.evaluate(() => [...document.querySelectorAll('div')].some((d) =>
  ['Home', 'Saved', 'Profile'].includes(d.textContent) && d.children.length === 0 &&
  d.getBoundingClientRect().height > 0 && d.getBoundingClientRect().top > innerHeight - 90));
await dismissWelcome();
// Go to Solve via the center Scan tab.
const [scanTab] = await page.$$('xpath/.//*[text()="Scan"]');
await scanTab.click();
await sleep(1500);

const frame = await fieldFrame();
await frame.waitForFunction(() => !!window.qubeField, { timeout: 30000 });
ok('math field page loads offline (MathLive ready)', true);
await page.screenshot({ path: SHOTS + '01-solve-type.png' });

// Keypad opens on tapping the field.
ok('keypad hidden before tapping', !(await byTestId('math-keypad')));
ok('tab bar visible before tapping', await tabBarVisible());
await dismissWelcome();
await frame.click('#mf');
const opened = await page.waitForSelector('[data-testid="math-keypad"]', { timeout: 5000 }).then(() => true, () => false);
await sleep(300);
await dismissWelcome();
ok('keypad opens on tapping the field', opened);
ok('tab bar hidden while keypad open', !(await tabBarVisible()));
// Regression (found on the phone 2026-11-16): on touch devices MathLive popped up
// its OWN virtual keyboard inside the field (clipped, covering the expression),
// because its "manual" policy was set before connect and got reset to "auto".
// MathLive shows it 300 ms after focus, so wait past that.
await sleep(700);
const vk = await frame.evaluate(() => ({
  coarse: matchMedia('(pointer: coarse)').matches,
  policy: document.getElementById('mf').mathVirtualKeyboardPolicy,
  visible: !!window.mathVirtualKeyboard?.visible,
  rendered: !!document.querySelector('.ML__keyboard') && getComputedStyle(document.querySelector('.ML__keyboard')).display !== 'none',
}));
ok("MathLive's own keyboard never shows inside the field (touch device)", vk.coarse && vk.policy === 'manual' && !vk.visible && !vk.rendered, JSON.stringify(vk));
// Regression (2026-11-16): the focused empty field painted a blue box behind the
// "Type a problem" placeholder (MathLive's text-run tint). It must be plain text,
// while a real selection still highlights.
const paintedBackgrounds = () => frame.evaluate(() => {
  const out = [];
  const walk = (root) => root.querySelectorAll('*').forEach((el) => {
    const bg = getComputedStyle(el).backgroundColor;
    const r = el.getBoundingClientRect();
    if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && r.width && r.height) out.push({ cls: String(el.className), bg });
    if (el.shadowRoot) walk(el.shadowRoot);
  });
  walk(document.getElementById('mf').shadowRoot);
  return out;
});
const placeholderBgs = await paintedBackgrounds();
ok('empty focused field: placeholder has no highlight box', placeholderBgs.length === 0, JSON.stringify(placeholderBgs));
await setField('x+1');
await frame.evaluate(() => document.getElementById('mf').executeCommand('selectAll'));
await sleep(200);
const selectionBgs = await paintedBackgrounds();
ok('manual selection still highlights', selectionBgs.length > 0, JSON.stringify(selectionBgs.slice(0, 2)));
await setField('');
await page.screenshot({ path: SHOTS + '01b-keypad.png' });

// Type x² + 3/4 with keys.
for (const id of ['key-basic-x', 'key-basic-x²', 'key-basic-+', 'key-basic-3', 'key-basic-a/b']) await tap(id);
let v = await latex();
ok('fraction template makes a slot (3 over empty)', /\\frac\{3\}\{\\placeholder\{\}\}/.test(v), v);
await page.screenshot({ path: SHOTS + '02-fraction-slot.png' });
// Solve with an empty slot is blocked with a message (no network call).
await tap('key-solve');
await sleep(300);
const slotMsg = await page.evaluate(() => document.body.innerText.includes('Fill in the empty boxes'));
ok('empty slot blocks Solve with a message', slotMsg && solveBodies.length === 0);
await tap('key-basic-4');
v = await latex();
ok('typing fills the slot', v === 'x^2+\\frac34', v);

// Cursor: right arrow leaves the fraction, then = 1.
await tap('key-right');
for (const id of ['key-basic-=', 'key-basic-1']) await tap(id);
v = await latex();
ok('right arrow exits the fraction; = 1 appended after it', v === 'x^2+\\frac34=1', v);

// Backspace and left arrow.
await tap('key-backspace');
v = await latex();
ok('backspace deletes one character', v === 'x^2+\\frac34=', v);
await tap('key-basic-1');

await tap('key-left'); await tap('key-left'); await tap('key-left');
await tap('key-basic-5');
v = await latex();
ok('left arrows move the caret into the fraction (edits in place)', v !== 'x^2+\\frac34=1' && v.includes('5'), v);
await tap('key-backspace');
v = await latex();
ok('backspace inside the fraction removes the inserted digit', v === 'x^2+\\frac34=1', v);

// Long-press alternates on x².
await setField('');
await tap('key-basic-y');
const sq = await byTestId('key-basic-x²');
const box = await sq.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down(); await sleep(700); await page.mouse.up();
await sleep(200);
const altShown = !!(await byTestId('alt-x³'));
ok('long-press x² shows alternates', altShown);
await page.screenshot({ path: SHOTS + '03-long-press.png' });
if (altShown) { await tap('alt-x³'); }
v = await latex();
ok('choosing x³ inserts a cube', v === 'y^3', v);

// Tabs: functions, calculus, symbols.
await setField('');
await tap('keypad-tab-functions');
await page.screenshot({ path: SHOTS + '04-functions.png' });
await tap('key-functions-sin'); await tap('key-functions-θ');
v = await latex();
ok('sin key inserts sin( ) with the caret inside', /\\sin\\left\(\\theta\\right\)/.test(v), v);
await setField('');
await tap('keypad-tab-calculus');
await page.screenshot({ path: SHOTS + '05-calculus.png' });
await tap('key-calculus-∫ₐᵇ');
v = await latex();
ok('definite integral template has slots for the limits', (v.match(/placeholder/g) || []).length >= 2, v);
await setField('');
await tap('keypad-tab-symbols');
await tap('key-symbols-≤');
v = await latex();
ok('≤ key', v === '\\le', v);
await tap('keypad-tab-basic');

// Solve: owner's ÷ expression typed with keys, check what's sent.
await setField('');
const seq = ['4', '(', 'x', ')', '÷', '2', '(', 'x', ')'];
for (const s of seq) await tap('key-basic-' + s);
v = await latex();
await tap('key-solve');
await page.waitForFunction(() => document.body.innerText.includes('Take the square root'), { timeout: 15000 });
const sent = solveBodies.at(-1)?.text;
ok('Solve sends the problem (÷ normalised for the server ambiguity check)', !!sent && sent.includes('÷2('), JSON.stringify(sent));
ok('keypad closes after Solve and the solution shows', !(await byTestId('math-keypad')));
ok('tab bar returns after Solve', await tabBarVisible());
await page.screenshot({ path: SHOTS + '06-solved.png', fullPage: false });

// History tab has it.
await frame.click('#mf');
await sleep(300);
await tap('keypad-tab-history');
await sleep(300);
const histHasItem = await page.evaluate(() => !document.body.innerText.includes('Problems you type will show up here'));
ok('History tab lists the solved problem', histHasItem);
await page.screenshot({ path: SHOTS + '07-history.png' });
await tap('keypad-tab-basic');

// ABC → text box, and back.
await tap('key-abc');
await sleep(300);
ok('ABC switches to the word-problem text box', !!(await byTestId('type-text-input')) && !(await byTestId('math-keypad')));
await page.screenshot({ path: SHOTS + '08-abc.png' });
await tap('switch-to-math');
await sleep(300);
ok('"Math keypad" switches back and reopens the keypad', !!(await byTestId('math-keypad')));

// Dismiss.
await tap('keypad-dismiss');
ok('chevron hides the keypad', !(await byTestId('math-keypad')));

// Scan correction: upload a photo → "We read" card → Edit loads it into the field.
const [uploadTab] = await page.$$('xpath/.//*[text()="Upload"]');
await uploadTab.click();
await sleep(400);
const [chooser] = await Promise.all([
  page.waitForFileChooser({ timeout: 10000 }),
  page.$$('xpath/.//*[text()="Choose an image"]').then(([el]) => el.click()),
]);
await chooser.accept([SHOTS + '01-solve-type.png']);
await page.waitForFunction(() => document.body.innerText.includes('WE READ'), { timeout: 20000 }).catch(() => {});
const readShown = await page.evaluate(() => document.body.innerText.includes('WE READ'));
ok('photo solve shows the "We read" card', readShown);
ok('photo solve sent an image, not text', !!solveBodies.at(-1)?.imageBase64 && !solveBodies.at(-1)?.text);
await page.screenshot({ path: SHOTS + '10-we-read.png' });
await tap('edit-read-problem');
await page.waitForSelector('[data-testid="math-keypad"]', { timeout: 5000 }).catch(() => {});
await sleep(500);
v = await latex();
ok('Edit loads the read problem into the math field with the keypad open', v.includes('x') && v.includes('=') && !!(await byTestId('math-keypad')), v);
await page.screenshot({ path: SHOTS + '11-edit-read.png' });
await tap('keypad-dismiss');

// Long and tall input stays readable: the field grows for stacked fractions, and
// a long line scrolls inside the field with the caret kept in view; the page
// itself never scrolls sideways.
await frame.click('#mf');
await sleep(300);
const fieldHeight = async () => (await page.$('iframe[data-testid="math-field-frame"]')).evaluate((f) => f.getBoundingClientRect().height);
await setField('x+1=2');
await sleep(400);
const oneLine = await fieldHeight();
await setField('\\frac{\\frac{x+1}{x-1}}{\\frac{x^{2}+1}{2}}=\\frac{3}{4}');
await sleep(600);
const tall = await fieldHeight();
ok('field grows to fit tall math (nested fractions)', tall > oneLine + 10, `${oneLine} → ${tall}`);
await setField('2(x+1)^{2}+3(x-4)^{3}-5(x+7)^{2}+11x-13=17x^{2}-19x+23-29(x-31)^{2}');
await (await fieldFrame()).evaluate(() => { const mf = document.getElementById('mf'); mf.focus(); mf.position = mf.lastOffset; });
await sleep(500);
const longLine = await (await fieldFrame()).evaluate(() => {
  const caret = document.getElementById('mf').shadowRoot?.querySelector('.ML__caret');
  const r = caret?.getBoundingClientRect();
  return { caret: !!r, caretInView: !!r && r.right <= innerWidth + 1 && r.left >= -1, vk: !!window.mathVirtualKeyboard?.visible };
});
const pageW = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, w: innerWidth }));
ok('long expression: caret stays in view, no MathLive keyboard, no page sideways scroll', longLine.caretInView && !longLine.vk && pageW.docW <= pageW.w, JSON.stringify({ ...longLine, ...pageW }));
await page.screenshot({ path: SHOTS + '12-long-expression.png' });
await setField('');
await tap('keypad-dismiss').catch(() => {});

// Small phone (iPhone SE).
await page.setViewport({ width: 320, height: 568, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await sleep(500);
await frame.click('#mf');
await sleep(400);
const se = await page.evaluate(() => {
  const kp = document.querySelector('[data-testid="math-keypad"]');
  if (!kp) return null;
  const r = kp.getBoundingClientRect();
  const solve = document.querySelector('[data-testid="key-solve"]').getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, h: innerHeight, w: innerWidth, docW: document.documentElement.scrollWidth, solveBottom: solve.bottom };
});
ok('iPhone SE: keypad fits on screen, no sideways scroll', se && se.bottom <= se.h + 1 && se.docW <= se.w && se.solveBottom <= se.h, JSON.stringify(se));
await page.screenshot({ path: SHOTS + '09-iphone-se.png' });

const relevantErrors = consoleErrors.filter((e) => !/favicon|Sentry|RevenueCat|\[iap]|DevTools|does not recognize the|JSHandle@array/i.test(e));
ok('no page errors', relevantErrors.length === 0, relevantErrors.slice(0, 5).join(' | '));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed. Paid API calls made: 0 (solve mocked ${solveBodies.length}x, OpenAI blocked).`);
process.exit(failed.length ? 1 : 0);
