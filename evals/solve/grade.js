// Grading for the solve eval.
//
// Two stages, so no language model ever decides whether an answer is right:
// 1. extract: a small model copies the FINAL answer the user would see into
//    machine-readable mathjs syntax (or flags that there is no real answer).
// 2. check: mathjs compares it with the expected answer numerically.
// Every failure is printed with the original answer text, so a bad extraction
// is easy to spot in the report.

import { create, all } from "mathjs";

const math = create(all);
const TOL = 1e-6;
const PROBE_POINTS = [0.37, 0.71, 1.23, 1.89, 2.61, 3.3, -0.53, -1.47, -2.2, 4.1];

const SHAPES = {
  solutions: `{"noAnswer": false, "values": ["<each solution of VAR>", ...]}  (values: [] if the answer says there is no (real) solution)`,
  system: `{"noAnswer": false, "values": {"x": "<x>", "y": "<y>"}}`,
  expression: `{"noAnswer": false, "expr": "<the final simplified expression, in VARS>"}`,
  antiderivative: `{"noAnswer": false, "expr": "<the antiderivative, in VARS, without + C>"}`,
  number: `{"noAnswer": false, "value": "<the single final number>"}`,
  interval: `{"noAnswer": false, "condition": "<boolean condition on VAR using < <= > >= and/or, e.g. 2 < x and x < 3>"}`,
};

function extractorPrompt(testCase, result) {
  const vars = testCase.vars?.join(", ") || testCase.var || "x";
  const shape = SHAPES[testCase.grade].replace("VARS", vars).replace(/VAR/g, testCase.var || "x");
  return `You convert a math tutor's FINAL ANSWER into machine-readable form. Do not solve anything and do not fix mistakes: copy exactly what the final answer claims, even if it is wrong.

Problem: ${testCase.text}

Tutor's final answer (plain text): ${JSON.stringify(result?.answer ?? "")}
Tutor's final answer (LaTeX): ${JSON.stringify(result?.answerLatex ?? "")}

Reply with JSON only, in this shape:
${shape}

Rules:
- Use mathjs syntax: * for multiplication, ^ for powers, sqrt(), abs(), pi, e, sin(), cos(), tan(), log(x) for natural log, log(x, b) for base b. Use the variable names exactly as listed. No units, no "x =".
- Solutions the tutor explicitly REJECTED (extraneous, outside the domain or interval) are not solutions: leave them out.
- If the final answer does not actually state a result (it says the problem needs further work, gives only a method, is cut off, or says it could not finish), reply {"noAnswer": true}.`;
}

export async function extractAnswer({ apiKey, judgeModel, testCase, result }) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
    body: JSON.stringify({
      model: judgeModel,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: extractorPrompt(testCase, result) }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error("extractor: " + (err.error?.message || response.status));
  }
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function num(expr, scope = {}) {
  const v = math.evaluate(String(expr), scope);
  if (typeof v === "number") return v;
  if (v && typeof v.re === "number") return Math.abs(v.im) < TOL ? v.re : NaN; // complex
  if (v && typeof v.toNumber === "function") return v.toNumber();
  return NaN;
}

const close = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= TOL * Math.max(1, Math.abs(b));

function sameSet(gotValues, expectedValues) {
  const dedupe = (xs) => xs.filter((v, i) => xs.findIndex((w) => close(w, v)) === i);
  const got = dedupe(gotValues.map((v) => num(v)));
  const want = dedupe(expectedValues.map((v) => num(v)));
  if (got.some((v) => !Number.isFinite(v))) return { ok: false, why: "a solution isn't a real number" };
  const missing = want.filter((w) => !got.some((g) => close(g, w)));
  const extra = got.filter((g) => !want.some((w) => close(g, w)));
  if (!missing.length && !extra.length) return { ok: true };
  return { ok: false, why: `missing [${missing.map(fmt)}], extra [${extra.map(fmt)}]` };
}

const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(4));

// Same function of `v` at the probe points (skipping points where the expected
// function is undefined, e.g. a removable singularity).
function equivalent(gotExpr, expectedFn, v) {
  const f = math.compile(String(gotExpr));
  let compared = 0;
  for (const p of PROBE_POINTS) {
    const want = expectedFn(p);
    if (!Number.isFinite(want) || Math.abs(want) > 1e6) continue;
    let got;
    try { got = num(f.evaluate({ [v]: p })); } catch { got = NaN; }
    if (!close(got, want)) return { ok: false, why: `at ${v} = ${p}: got ${fmt(got)}, expected ${fmt(want)}` };
    compared++;
  }
  return compared >= 4 ? { ok: true } : { ok: false, why: "too few comparable points" };
}

// The extractor sometimes leaves LaTeX grouping braces (`x^{2}`), which mathjs
// reads as object literals. Answers never contain objects, so braces → parens.
function deLatexBraces(value) {
  if (typeof value === "string") {
    return value
      .replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "(($1)/($2))")
      .replace(/\\(pi|sqrt|sin|cos|tan|ln|log)\b/g, "$1")
      .replace(/\\cdot|\\times/g, "*")
      .replace(/\{/g, "(").replace(/\}/g, ")");
  }
  if (Array.isArray(value)) return value.map(deLatexBraces);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deLatexBraces(v)]));
  }
  return value;
}

// Returns { ok, why }. Throws only on extractor output mathjs can't parse
// (the caller reports that as "ungradable" for a manual look).
export function check(testCase, extracted) {
  extracted = deLatexBraces(extracted);
  switch (testCase.grade) {
    case "solutions":
      return sameSet(extracted.values ?? [], testCase.expected);
    case "system": {
      for (const [k, want] of Object.entries(testCase.expected)) {
        const got = num(extracted.values?.[k] ?? "NaN");
        if (!close(got, num(want))) return { ok: false, why: `${k}: got ${fmt(got)}, expected ${want}` };
      }
      return { ok: true };
    }
    case "expression": {
      const v = testCase.vars[0];
      const want = math.compile(testCase.expected);
      return equivalent(extracted.expr, (p) => num(want.evaluate({ [v]: p })), v);
    }
    case "antiderivative": {
      // Any antiderivative passes: its derivative must equal the integrand.
      const v = testCase.vars[0];
      const dF = math.derivative(String(extracted.expr), v).compile();
      const integrand = math.compile(testCase.integrand);
      let compared = 0;
      for (const p of PROBE_POINTS) {
        const want = num(integrand.evaluate({ [v]: p }));
        const got = num(dF.evaluate({ [v]: p }));
        if (!close(got, want)) return { ok: false, why: `derivative at ${v} = ${p}: got ${fmt(got)}, expected ${fmt(want)}` };
        compared++;
      }
      return { ok: compared >= 4 };
    }
    case "number": {
      const got = num(extracted.value);
      const want = num(testCase.expected);
      return close(got, want) ? { ok: true } : { ok: false, why: `got ${fmt(got)}, expected ${fmt(want)}` };
    }
    case "interval": {
      const want = math.compile(testCase.expected);
      const got = math.compile(String(extracted.condition));
      for (const p of testCase.probes) {
        const scope = { [testCase.var]: p };
        if (Boolean(got.evaluate(scope)) !== Boolean(want.evaluate(scope))) {
          return { ok: false, why: `disagrees at ${testCase.var} = ${p}` };
        }
      }
      return { ok: true };
    }
    default:
      throw new Error("unknown grade rule " + testCase.grade);
  }
}
