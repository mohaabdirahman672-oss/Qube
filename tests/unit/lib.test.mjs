// Offline unit tests for pure app logic. No network, no device.
//   node --test "tests/**/*.test.mjs"

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAuthDeepLink } from '../../src/lib/authDeepLink.js';
import { latexForSolve, hasEmptySlot, plainToLatex, looksLikeWords, readProblemToLatex } from '../../src/lib/mathFieldText.js';
import { AMBIGUOUS_DIVISION } from '../../supabase/functions/solve/prompt.js';

// ── Auth deep links (password reset / email confirmation) ──────────────────

test('deep link: recovery tokens in the fragment', () => {
  assert.deepEqual(
    parseAuthDeepLink('qube://reset-password#access_token=AT&refresh_token=RT&type=recovery&expires_in=3600'),
    { access_token: 'AT', refresh_token: 'RT', type: 'recovery' },
  );
});

test('deep link: confirmation tokens in the query string', () => {
  assert.deepEqual(parseAuthDeepLink('qube://?access_token=A&refresh_token=R&type=signup'), { access_token: 'A', refresh_token: 'R', type: 'signup' });
});

test('deep link: expired link returns an error with a readable description', () => {
  assert.deepEqual(
    parseAuthDeepLink('qube://reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'),
    { error: 'otp_expired', errorDescription: 'Email link is invalid or has expired' },
  );
});

test('deep link: non-auth links and partial tokens are ignored', () => {
  assert.equal(parseAuthDeepLink(null), null);
  assert.equal(parseAuthDeepLink('qube://'), null);
  assert.equal(parseAuthDeepLink('qube://scan?foo=bar'), null);
  assert.equal(parseAuthDeepLink('qube://#access_token=only'), null);
});

// ── Math keypad text helpers ────────────────────────────────────────────────

test('keypad: the owner ÷ problem keeps the server ambiguity check working', () => {
  const sent = latexForSolve(String.raw`4\left(a^{10}\div a^4\right)\div2\left(a^3\times a^2\right)-3a^0`);
  assert.equal(sent, '4(a^{10}÷a^4)÷2(a^3 × a^2)-3a^0');
  assert.ok(AMBIGUOUS_DIVISION.test(sent));
});

test('keypad: unambiguous input is not flagged', () => {
  assert.ok(!AMBIGUOUS_DIVISION.test(latexForSolve(String.raw`\frac{x}{2}+\left(3\right)`)));
});

test('keypad: only the \\div command is rewritten, not longer names', () => {
  assert.equal(latexForSolve(String.raw`\divideontimes`), String.raw`\divideontimes`);
});

test('keypad: empty template slots are detected', () => {
  assert.ok(hasEmptySlot(String.raw`\frac{3}{\placeholder{}}`));
  assert.ok(!hasEmptySlot(String.raw`\frac{3}{4}`));
  assert.ok(!hasEmptySlot(''));
});

test('keypad: plain Unicode math becomes field LaTeX', () => {
  assert.equal(plainToLatex('2x² + 7x − 15 = 0'), '2x^{2} + 7x - 15 = 0');
  assert.equal(plainToLatex('√(x+1) = 3'), String.raw`\sqrt{x+1} = 3`);
  assert.equal(plainToLatex('x₁ ≤ π'), String.raw`x_{1} \le \pi`);
});

test('keypad: word problems vs expressions', () => {
  assert.ok(looksLikeWords('A train travels 60 miles per hour for 3 hours'));
  assert.ok(!looksLikeWords('Solve sin(x) = 1/2'));
  assert.ok(!looksLikeWords('x² − 9 = 0'));
});

test('scan correction: drops the leading instruction word, prefers server LaTeX', () => {
  assert.equal(readProblemToLatex({ problem: 'Solve x² − 9 = 0' }), 'x^{2} - 9 = 0');
  assert.equal(readProblemToLatex({ problem: 'Simplify: (x² − 9)/(x + 3)' }), '(x^{2} - 9)/(x + 3)');
  assert.equal(readProblemToLatex({ problem: 'Solve for x: 2x = 4' }), '2x = 4');
  assert.equal(readProblemToLatex({ problem: 'x', problemLatex: String.raw`\frac{1}{2}` }), String.raw`\frac{1}{2}`);
});
