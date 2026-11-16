// The model call behind `solve`: build messages, call OpenAI, parse the reply.
// Shared by the edge function (index.js) and the eval runner (evals/solve/run.js),
// so the eval measures exactly what ships. Plain ES module using only web-standard
// APIs (fetch, AbortController), so it runs under both Deno and Node.

import { SYSTEM_PROMPT, solveUserMessage, IMAGE_USER_TEXT, parseModelJson, retryMessage } from "./prompt.js";
import { verifyCheck } from "./verify.js";

// What production runs. Chosen by the eval on 2026-11-15 (evals/solve/README.md):
// gpt-5.4 at low reasoning effort was the only candidate with 0 confident-wrong
// answers (105/105), p90 ≈ 10 s.
// - maxTokens covers hidden reasoning too; a normal solve uses ~600.
// - timeoutMs is per OpenAI call; budgetMs caps the whole solve INCLUDING the
//   verification retry, kept under the app's 90 s client timeout
//   (src/services/solveApi.js) so the server answers before the app gives up.
export const PRODUCTION_CONFIG = { model: "gpt-5.4", effort: "low", maxTokens: 8000, timeoutMs: 60000, budgetMs: 80000 };
// A retry is only worth starting with at least this much budget left.
const MIN_RETRY_BUDGET_MS = 25000;

// Reasoning models take max_completion_tokens (which also covers their hidden
// reasoning tokens), take an optional reasoning_effort, and reject temperature.
export function isReasoningModel(model) {
  return /^(o\d|gpt-5)/.test(model);
}

export function buildMessages({ text, imageBase64, imageMimeType }) {
  if (text) {
    return [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: solveUserMessage(text) },
    ];
  }
  if (imageBase64) {
    const dataUrl = `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}`;
    return [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          { type: "text", text: IMAGE_USER_TEXT },
        ],
      },
    ];
  }
  throw new Error("No input provided.");
}

export async function callOpenAI({ apiKey, config, messages }, isRetry = false) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  // json_object mode guarantees syntactically valid JSON, which LaTeX's
  // backslashes otherwise regularly break.
  const body = { model: config.model, response_format: { type: "json_object" }, messages };
  if (isReasoningModel(config.model)) {
    body.max_completion_tokens = config.maxTokens;
    if (config.effort) body.reasoning_effort = config.effort;
  } else {
    body.max_tokens = config.maxTokens;
    if (config.temperature !== undefined) body.temperature = config.temperature;
  }
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify(body),
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
      throw new Error(err.error?.message || "Error " + response.status);
    }
    return await response.json();
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") throw new Error("Request timed out. Please try again.");
    if (!isRetry) return callOpenAI({ apiKey, config, messages }, true);
    throw e;
  }
}

function addUsage(a, b) {
  if (!a) return b ?? null;
  if (!b) return a;
  return {
    prompt_tokens: (a.prompt_tokens || 0) + (b.prompt_tokens || 0),
    completion_tokens: (a.completion_tokens || 0) + (b.completion_tokens || 0),
  };
}

// One full solve: model → verify the answer (verify.js) → on a provable failure,
// one retry with specific feedback → verify again.
// result.verified: true (checked and correct), false (still failing after the
// retry; the app shows a "check this yourself" note), or absent (nothing to
// check, or partial). Returns usage, timing and a verification trace for the eval.
export async function runSolve({ apiKey, config = PRODUCTION_CONFIG, input, verify = true }) {
  const started = Date.now();
  const budgetMs = config.budgetMs ?? Infinity;
  const remaining = () => budgetMs - (Date.now() - started);
  const callConfig = () => ({ ...config, timeoutMs: Math.max(1000, Math.min(config.timeoutMs, remaining())) });

  const messages = buildMessages(input);
  const data = await callOpenAI({ apiKey, config: callConfig(), messages });
  const raw = data?.choices?.[0]?.message?.content;
  let result = parseModelJson(raw);
  let usage = data?.usage ?? null;
  const trace = { attempts: 1, first: null, second: null };

  const done = () => {
    if (result && typeof result === "object") delete result.check; // server-only
    return { result, usage, ms: Date.now() - started, verification: trace };
  };
  const needsCheck = (r) => verify && r?.hasMath !== false && r?.status !== "partial";

  if (!needsCheck(result)) return done();
  trace.first = verifyCheck(result.check);
  if (trace.first.status === "pass") { result.verified = true; return done(); }
  if (trace.first.status === "skipped") return done();

  // Provably wrong. One retry if there's time; otherwise flag it.
  if (remaining() < MIN_RETRY_BUDGET_MS) { result.verified = false; return done(); }
  try {
    trace.attempts = 2;
    const retryMessages = [...messages, { role: "assistant", content: raw }, { role: "user", content: retryMessage(trace.first.feedback) }];
    const data2 = await callOpenAI({ apiKey, config: callConfig(), messages: retryMessages });
    usage = addUsage(usage, data2?.usage);
    const second = parseModelJson(data2?.choices?.[0]?.message?.content);
    if (second?.status === "partial") { result = second; return done(); }
    if (second?.hasMath === false) { result.verified = false; return done(); }
    trace.second = verifyCheck(second.check);
    result = second;
    result.verified = trace.second.status === "pass";
  } catch (e) {
    // Retry failed (timeout, API or parse error): return the first answer, flagged.
    trace.retryError = e?.message || String(e);
    result.verified = false;
  }
  return done();
}
