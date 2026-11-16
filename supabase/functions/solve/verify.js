// Server-side answer checking for `solve` (docs/plans/solve-quality.md §3).
// The model returns a machine-readable `check` object in mathjs syntax alongside
// its solution; this substitutes the answer back numerically instead of trusting
// the model's word. Shared by the edge function (via pipeline.js) and the eval.
//
// Result: { status: "pass" | "fail" | "skipped", feedback?, reason? }
//   pass     the answer checks out
//   fail     it provably doesn't; `feedback` is a specific, model-facing message
//   skipped  nothing to check (kind "none") or `check` couldn't be parsed —
//            verification never blocks a solve
//
// What this can't catch: a MISSING solution of an equation (substitution only
// tests the roots the model gave), or a wrong `check` that faithfully mirrors a
// misread problem. The eval tracks both.

import { create, all } from "mathjs";

const math = create(all);
const TOL = 1e-6;
// Avoid 0, ±1 and small integers: they hide errors (x = 1 makes x² = x) and sit
// on common singularities. 10 points, both signs, a range of magnitudes.
const PROBES = [-3.7, -2.3, -1.3, -0.6, -0.15, 0.35, 0.8, 1.7, 2.9, 4.4];

class Skip extends Error {}

function toReal(v) {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v && typeof v.re === "number") return Math.abs(v.im) < TOL ? v.re : NaN; // complex
  if (v && typeof v.toNumber === "function") return v.toNumber(); // Fraction/BigNumber
  return NaN;
}

const close = (a, b, scale = 1) =>
  Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= TOL * Math.max(1, Math.abs(a), Math.abs(b), scale);

const fmt = (v) => (Number.isFinite(v) ? String(Math.round(v * 1e6) / 1e6) : "undefined");

// Compile, or Skip if the model wrote something mathjs can't parse.
function compile(expr) {
  if (typeof expr !== "string" || !expr.trim()) throw new Skip("missing expression");
  try {
    return math.compile(normalize(expr));
  } catch (e) {
    throw new Skip(`unparseable: ${expr}`);
  }
}

// Tolerate the usual near-misses: Unicode operators, LaTeX braces, "ln".
function normalize(expr) {
  return String(expr)
    .replace(/[−–]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/\{/g, "(").replace(/\}/g, ")")
    .replace(/\bln\(/g, "log(");
}

function evalAt(compiled, scope) {
  try {
    return toReal(compiled.evaluate(scope));
  } catch {
    return NaN;
  }
}

function splitEquation(equation) {
  const parts = normalize(equation).split("=").filter((p) => p.trim() !== "");
  if (parts.length !== 2 || /[<>!]$/.test(parts[0].trim())) throw new Skip(`not an equation: ${equation}`);
  return [compile(parts[0]), compile(parts[1])];
}

// Each solution must make LHS = RHS, with both sides defined.
function checkEquation({ variable = "x", equation, solutions }) {
  if (!Array.isArray(solutions)) throw new Skip("no solutions array");
  if (solutions.length === 0) return { status: "skipped", reason: "no solutions claimed" };
  const [lhs, rhs] = splitEquation(equation);
  for (const s of solutions) {
    const value = evalAt(compile(String(s)), {});
    if (!Number.isFinite(value)) throw new Skip(`solution isn't a real number: ${s}`);
    const l = evalAt(lhs, { [variable]: value });
    const r = evalAt(rhs, { [variable]: value });
    if (!Number.isFinite(l) || !Number.isFinite(r)) {
      return { status: "fail", feedback: `${variable} = ${s} is not a valid solution: the original equation is undefined there (division by zero or outside the domain). It is extraneous and must be rejected.` };
    }
    if (!close(l, r)) {
      return { status: "fail", feedback: `${variable} = ${s} does not satisfy the equation: the left side is ${fmt(l)} and the right side is ${fmt(r)}.` };
    }
  }
  return { status: "pass" };
}

// Every equation must hold at the claimed solution.
function checkSystem({ equations, solution }) {
  if (!Array.isArray(equations) || !equations.length || !solution || typeof solution !== "object") throw new Skip("bad system check");
  const scope = {};
  for (const [k, v] of Object.entries(solution)) {
    scope[k] = evalAt(compile(String(v)), {});
    if (!Number.isFinite(scope[k])) throw new Skip(`not a real value: ${k} = ${v}`);
  }
  const shown = Object.entries(solution).map(([k, v]) => `${k} = ${v}`).join(", ");
  for (const eq of equations) {
    const [lhs, rhs] = splitEquation(eq);
    const l = evalAt(lhs, scope);
    const r = evalAt(rhs, scope);
    if (!close(l, r)) {
      return { status: "fail", feedback: `${shown} does not satisfy ${eq}: the left side is ${fmt(l)} and the right side is ${fmt(r)}.` };
    }
  }
  return { status: "pass" };
}

// Two functions of `variable` agree at the probe points where both are defined.
function sameFunction(f, g, variable) {
  let compared = 0;
  for (const p of PROBES) {
    const a = evalAt(f, { [variable]: p });
    const b = evalAt(g, { [variable]: p });
    if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(b) > 1e8) continue;
    if (!close(a, b)) return { ok: false, at: p, a, b };
    compared++;
  }
  if (compared < 4) throw new Skip("too few comparable points");
  return { ok: true };
}

function checkExpression({ variable = "x", original, result }) {
  const same = sameFunction(compile(result), compile(original), variable);
  if (same.ok) return { status: "pass" };
  return { status: "fail", feedback: `The simplified result ${result} is not equivalent to the original ${original}: at ${variable} = ${same.at} the result gives ${fmt(same.a)} but the original gives ${fmt(same.b)}.` };
}

function symbolicDerivative(fn, variable) {
  try {
    return math.derivative(normalize(fn), variable).compile();
  } catch {
    throw new Skip(`can't differentiate: ${fn}`);
  }
}

function checkDerivative({ variable = "x", fn, result }) {
  const same = sameFunction(compile(result), symbolicDerivative(fn, variable), variable);
  if (same.ok) return { status: "pass" };
  return { status: "fail", feedback: `The derivative ${result} is wrong: at ${variable} = ${same.at} it gives ${fmt(same.a)}, but the true derivative of ${fn} there is ${fmt(same.b)}.` };
}

// Indefinite integral: differentiate the claimed antiderivative (so any + C passes).
function checkIntegral({ variable = "x", integrand, result }) {
  const cleaned = String(result).replace(/\+\s*C\s*$/i, "");
  const same = sameFunction(symbolicDerivative(cleaned, variable), compile(integrand), variable);
  if (same.ok) return { status: "pass" };
  return { status: "fail", feedback: `The antiderivative ${result} is wrong: its derivative at ${variable} = ${same.at} is ${fmt(same.a)}, but the integrand there is ${fmt(same.b)}.` };
}

// Composite Simpson's rule; plenty for textbook definite integrals.
function simpson(f, variable, a, b, n = 2000) {
  const h = (b - a) / n;
  let sum = evalAt(f, { [variable]: a }) + evalAt(f, { [variable]: b });
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * evalAt(f, { [variable]: a + i * h });
  return (sum * h) / 3;
}

function checkDefiniteIntegral({ variable = "x", integrand, lower, upper, value }) {
  const a = evalAt(compile(String(lower)), {});
  const b = evalAt(compile(String(upper)), {});
  const claimed = evalAt(compile(String(value)), {});
  if (![a, b, claimed].every(Number.isFinite)) throw new Skip("non-numeric bounds or value");
  const actual = simpson(compile(integrand), variable, a, b);
  if (!Number.isFinite(actual)) throw new Skip("integral didn't converge numerically (improper?)");
  if (Math.abs(actual - claimed) <= 1e-4 * Math.max(1, Math.abs(actual))) return { status: "pass" };
  return { status: "fail", feedback: `The definite integral's value ${value} is wrong: numerically it is about ${fmt(actual)}.` };
}

// Numeric limit: approach from both sides (or out to ±∞) and look for agreement.
function checkLimit({ variable = "x", expression, approaches, value }) {
  const f = compile(expression);
  const target = String(approaches).replace(/\s/g, "").toLowerCase();
  let samples;
  if (/^\+?(inf|infinity|∞)$/.test(target)) samples = [1e4, 1e5, 1e6];
  else if (/^-(inf|infinity|∞)$/.test(target)) samples = [-1e4, -1e5, -1e6];
  else {
    const a = evalAt(compile(String(approaches)), {});
    if (!Number.isFinite(a)) throw new Skip(`bad limit point: ${approaches}`);
    samples = [a - 1e-5, a + 1e-5, a - 1e-6, a + 1e-6];
  }
  const ys = samples.map((x) => evalAt(f, { [variable]: x }));
  if (!ys.every(Number.isFinite)) throw new Skip("limit not finite numerically");
  const spread = Math.max(...ys) - Math.min(...ys);
  if (spread > 1e-2 * Math.max(1, Math.abs(ys[0]))) throw new Skip("numeric limit didn't settle");
  const claimed = String(value).replace(/\s/g, "").toLowerCase();
  if (/^[+-]?(inf|infinity|∞)$/.test(claimed) || /^(dne|none)$/.test(claimed)) {
    return { status: "fail", feedback: `The limit is finite (about ${fmt(ys.at(-1))}), not ${value}.` };
  }
  const v = evalAt(compile(String(value)), {});
  if (!Number.isFinite(v)) throw new Skip(`non-numeric limit value: ${value}`);
  if (Math.abs(ys.at(-1) - v) <= 1e-3 * Math.max(1, Math.abs(v))) return { status: "pass" };
  return { status: "fail", feedback: `The limit value ${value} is wrong: numerically the expression approaches about ${fmt(ys.at(-1))}.` };
}

// Plain arithmetic / word-problem result that can be recomputed from an expression.
function checkNumber({ expression, value }) {
  const actual = evalAt(compile(expression), {});
  const claimed = evalAt(compile(String(value)), {});
  if (!Number.isFinite(actual) || !Number.isFinite(claimed)) throw new Skip("non-numeric");
  if (close(actual, claimed)) return { status: "pass" };
  return { status: "fail", feedback: `The value ${value} is wrong: ${expression} evaluates to ${fmt(actual)}.` };
}

// The claimed solution set (a mathjs boolean like "x > 2 and x < 3") must agree
// with the inequality at probe points, skipping points right at a boundary.
function checkInequality({ variable = "x", inequality, solution }) {
  const ineq = compile(inequality);
  const sol = compile(solution);
  const probes = [...PROBES, -10.5, -6.2, 6.6, 12.3];
  let compared = 0;
  for (const p of probes) {
    const a = ineq.evaluate({ [variable]: p });
    const b = sol.evaluate({ [variable]: p });
    if (typeof a !== "boolean" || typeof b !== "boolean") throw new Skip("not boolean expressions");
    if (a !== b) {
      return { status: "fail", feedback: `The solution set "${solution}" is wrong: at ${variable} = ${p} the inequality is ${a ? "true" : "false"}, but the stated solution says ${b ? "true" : "false"}.` };
    }
    compared++;
  }
  return compared ? { status: "pass" } : { status: "skipped", reason: "nothing compared" };
}

const CHECKERS = {
  equation: checkEquation,
  system: checkSystem,
  expression: checkExpression,
  derivative: checkDerivative,
  integral: checkIntegral,
  definite_integral: checkDefiniteIntegral,
  limit: checkLimit,
  number: checkNumber,
  inequality: checkInequality,
};

export function verifyCheck(check) {
  if (!check || typeof check !== "object" || check.kind === "none") return { status: "skipped", reason: "no check" };
  const checker = CHECKERS[check.kind];
  if (!checker) return { status: "skipped", reason: `unknown kind ${check.kind}` };
  try {
    return checker(check);
  } catch (e) {
    if (e instanceof Skip) return { status: "skipped", reason: e.message };
    return { status: "skipped", reason: "verifier error: " + (e?.message || e) };
  }
}
