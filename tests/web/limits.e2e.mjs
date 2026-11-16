// Client handling of the weekly limit (mocked backend, no paid calls).
import puppeteer from 'puppeteer-core';
import { BROWSER, APP_URL, SHOTS } from './config.mjs';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const ok = (n, c, d = '') => { results.push(!!c); console.log(`${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); };
const browser = await puppeteer.launch({ executablePath: BROWSER, headless: true });

async function run({ remaining, solveStatus }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.setRequestInterception(true);
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
  let solveCalls = 0;
  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('api.openai.com')) return req.abort();
    if (u.includes('/functions/v1/') && req.method() === 'OPTIONS') return req.respond({ status: 204, headers: cors });
    if (u.includes('/functions/v1/solve')) {
      solveCalls++;
      return req.respond({ status: solveStatus, contentType: 'application/json', headers: cors, body: JSON.stringify({ error: "You've used your free solves this week.", code: 'WEEKLY_LIMIT_REACHED' }) });
    }
    if (u.includes('/functions/v1/')) return req.respond({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ remaining, limit: 20, isPremium: false, resetsOn: '2026-11-16T00:00:00Z' }) });
    req.continue();
  });
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('@qube/welcome_prompt_seen', '1'); } catch {} });
  await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  await sleep(5500);
  const scan = await page.$$('xpath/.//*[text()="Scan"]');
  await scan.at(-1).click();
  await sleep(1500);
  const f = await (await page.waitForSelector('iframe[data-testid="math-field-frame"]')).contentFrame();
  await f.waitForFunction(() => window.qubeField);
  await f.evaluate(() => { const mf = document.getElementById('mf'); mf.value = '2x+1=5'; mf.dispatchEvent(new Event('input')); });
  await sleep(300);
  const btn = await page.$$('xpath/.//*[text()="Solve with AI"]');
  await btn.at(-1).click();
  await sleep(2500); // paywall slides up
  const text = await page.evaluate(() => document.body.innerText);
  const pill = text.match(/\d+ free solves? remaining[^\n]*|\d+ of 20 free solves used[^\n]*/)?.[0];
  await page.close();
  return { solveCalls, paywall: /used your 20 free solves|wait until|Premium/i.test(text) && /Monday/.test(text), pill };
}

const zero = await run({ remaining: 0, solveStatus: 402 });
ok('at 0 remaining: paywall opens before any network solve', zero.paywall && zero.solveCalls === 0, `solve calls: ${zero.solveCalls}`);
ok('at 0 remaining: pill shows 0 left and the reset day', /^0 free solves remaining • Resets Monday/.test(zero.pill || ''), zero.pill);
const stale = await run({ remaining: 2, solveStatus: 402 });
ok('stale count (server says limit reached): paywall instead of an error', stale.paywall && stale.solveCalls === 1, `solve calls: ${stale.solveCalls}`);
await browser.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
