// Offline tests for supabase/functions/solve/verify.js: each real failure the
// solve eval caught (evals/solve/README.md) must be rejected, and the correct
// answer to the same problem accepted.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyCheck } from '../../supabase/functions/solve/verify.js';

const status = (check) => verifyCheck(check).status;

test('verify: owner substitution problem, right vs the gpt-4o wrong answer', () => {
  const eq = '2*(x+1/x)^2 = 10 - x - 1/x';
  assert.equal(status({ kind: 'equation', variable: 'x', equation: eq, solutions: ['1', '-2', '-1/2'] }), 'pass');
  const r = verifyCheck({ kind: 'equation', variable: 'x', equation: eq, solutions: ['1', '-1', '-1/2'] });
  assert.equal(r.status, 'fail');
  assert.match(r.feedback, /x = -1 .* left side is 8 and the right side is 12/);
});

test('verify: an extraneous root (division by zero) is rejected', () => {
  const r = verifyCheck({ kind: 'equation', variable: 'x', equation: 'x/(x-2) + 1 = 2/(x-2)', solutions: ['2'] });
  assert.equal(r.status, 'fail');
  assert.match(r.feedback, /extraneous/);
});

test('verify: factoring and trig slips from the eval are rejected', () => {
  assert.equal(status({ kind: 'equation', variable: 'x', equation: '6x^2 - x - 2 = 0', solutions: ['-2/3', '1/2'] }), 'fail');
  assert.equal(status({ kind: 'equation', variable: 'x', equation: '6x^2 - x - 2 = 0', solutions: ['-1/2', '2/3'] }), 'pass');
  assert.equal(status({ kind: 'equation', variable: 'x', equation: '2 sin(x)^2 - sin(x) - 1 = 0', solutions: ['7*pi/6', '3*pi/2', '11*pi/6'] }), 'fail');
  assert.equal(status({ kind: 'equation', variable: 'x', equation: '2 sin(x)^2 - sin(x) - 1 = 0', solutions: ['pi/2', '7*pi/6', '11*pi/6'] }), 'pass');
});

test('verify: tolerates Unicode operators and LaTeX braces from the model', () => {
  assert.equal(status({ kind: 'equation', variable: 'x', equation: 'x^{2} − 9 = 0', solutions: ['3', '−3'] }), 'pass');
});

test('verify: systems, expressions, derivatives, integrals, limits, numbers, inequalities', () => {
  assert.equal(status({ kind: 'system', equations: ['2x + 3y = 12', 'x - y = 1'], solution: { x: '3', y: '2' } }), 'pass');
  assert.equal(status({ kind: 'system', equations: ['2x + 3y = 12', 'x - y = 1'], solution: { x: '2', y: '1' } }), 'fail');
  assert.equal(status({ kind: 'expression', variable: 'x', original: '(x^2-9)/(x+3)', result: 'x-3' }), 'pass');
  assert.equal(status({ kind: 'expression', variable: 'x', original: '(x^2-9)/(x+3)', result: 'x+3' }), 'fail');
  assert.equal(status({ kind: 'derivative', variable: 'x', fn: 'x^2*sin(3x)', result: '2x*sin(3x) + 3x^2*cos(3x)' }), 'pass');
  assert.equal(status({ kind: 'derivative', variable: 'x', fn: 'x^2*sin(3x)', result: '2x*cos(3x)' }), 'fail');
  assert.equal(status({ kind: 'integral', variable: 'x', integrand: 'x*e^x', result: 'x*e^x - e^x' }), 'pass');
  assert.equal(status({ kind: 'integral', variable: 'x', integrand: 'x*e^x', result: 'x*e^x + e^x' }), 'fail');
  assert.equal(status({ kind: 'definite_integral', variable: 'x', integrand: 'sin(x)', lower: '0', upper: 'pi', value: '2' }), 'pass');
  assert.equal(status({ kind: 'definite_integral', variable: 'x', integrand: 'sin(x)', lower: '0', upper: 'pi', value: '1' }), 'fail');
  assert.equal(status({ kind: 'limit', variable: 'x', expression: 'sin(5x)/x', approaches: '0', value: '5' }), 'pass');
  assert.equal(status({ kind: 'limit', variable: 'x', expression: '(3x^2+1)/(x^2-4)', approaches: 'infinity', value: '1' }), 'fail');
  assert.equal(status({ kind: 'number', expression: '80 * (1 - 0.25)', value: '60' }), 'pass');
  assert.equal(status({ kind: 'number', expression: '80 * (1 - 0.25)', value: '20' }), 'fail');
  assert.equal(status({ kind: 'inequality', variable: 'x', inequality: 'x^2 - 5x + 6 < 0', solution: 'x > 2 and x < 3' }), 'pass');
  assert.equal(status({ kind: 'inequality', variable: 'x', inequality: 'x^2 - 5x + 6 < 0', solution: 'x < 2 or x > 3' }), 'fail');
});

test('verify: never blocks — unparseable, unknown, none and "no solutions" are skipped', () => {
  assert.equal(status({ kind: 'equation', variable: 'x', equation: '\\frac{1}{x} = 2', solutions: ['1/2'] }), 'skipped');
  assert.equal(status({ kind: 'mystery' }), 'skipped');
  assert.equal(status({ kind: 'none' }), 'skipped');
  assert.equal(status(undefined), 'skipped');
  assert.equal(status({ kind: 'equation', variable: 'x', equation: 'x^2 + 1 = 0', solutions: [] }), 'skipped');
});
