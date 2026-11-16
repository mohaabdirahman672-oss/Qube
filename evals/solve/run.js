// Solve eval runner. See README.md for usage.
//
//   node run.js --production                      today's production settings (baseline)
//   node run.js --model gpt-4o --temperature 0    a candidate config, same pipeline as the server
//   node run.js --model o4-mini --effort low
//   node run.js --live --runs 1 --only linear     the deployed function, end to end
//   node run.js --list-models                     models this key can use
//
// Reads OPENAI_EVAL_KEY from the repo's .env.local (gitignored). Never prints it.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runSolve, PRODUCTION_CONFIG } from "../../supabase/functions/solve/pipeline.js";
import { extractAnswer, check } from "./grade.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

// ---- config ---------------------------------------------------------------

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = { ...loadEnvFile(join(ROOT, ".env")), ...loadEnvFile(join(ROOT, ".env.local")), ...process.env };

function parseArgs(argv) {
  const args = { runs: 3, concurrency: 4, judge: "gpt-4o-mini" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--production") args.production = true;
    else if (a === "--live") args.live = true;
    else if (a === "--list-models") args.listModels = true;
    else if (a === "--model") args.model = next();
    else if (a === "--temperature") args.temperature = Number(next());
    else if (a === "--effort") args.effort = next();
    else if (a === "--max-tokens") args.maxTokens = Number(next());
    else if (a === "--timeout") args.timeoutMs = Number(next()) * 1000;
    else if (a === "--runs") args.runs = Number(next());
    else if (a === "--concurrency") args.concurrency = Number(next());
    else if (a === "--only") args.only = next().split(",");
    else if (a === "--judge") args.judge = next();
    else if (a === "--label") args.label = next();
    else if (a === "--no-verify") args.noVerify = true;
    else throw new Error("Unknown argument: " + a);
  }
  return args;
}

// Approximate list prices, USD per 1M tokens [input, output]. Only used for a
// rough cost-per-solve column; check openai.com/api/pricing before relying on it.
const PRICES = {
  "gpt-4o": [2.5, 10], "gpt-4o-mini": [0.15, 0.6], "gpt-4.1": [2, 8], "gpt-4.1-mini": [0.4, 1.6],
  "o3": [2, 8], "o4-mini": [1.1, 4.4], "gpt-5": [1.25, 10], "gpt-5-mini": [0.25, 2], "gpt-5-nano": [0.05, 0.4],
  // 5.4 prices from third-party listings (2026-11-15), unverified against openai.com.
  "gpt-5.4": [2.5, 15], "gpt-5.4-mini": [0.75, 4.5], "gpt-5.4-nano": [0.2, 1.25],
};

// ---- helpers ----------------------------------------------------------------

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}

const pct = (xs, p) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
};

async function solveLive(text) {
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Live mode needs EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env");
  const token = env.QUBE_EVAL_ACCESS_TOKEN || anon;
  const started = Date.now();
  const response = await fetch(`${url}/functions/v1/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": anon, "Authorization": "Bearer " + token },
    body: JSON.stringify({ text, deviceId: "qube-eval-runner" }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "HTTP " + response.status);
  return { result: body, usage: null, ms: Date.now() - started };
}

// ---- main -------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = env.OPENAI_EVAL_KEY;
  if (!apiKey) {
    console.error("OPENAI_EVAL_KEY is not set. Add it to .env.local in the repo root (see README.md).");
    process.exit(1);
  }

  if (args.listModels) {
    const r = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: "Bearer " + apiKey } });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message || r.status);
    const ids = data.data.map((m) => m.id).filter((id) => /^(gpt-|o\d|chatgpt)/.test(id)).sort();
    console.log(ids.join("\n"));
    return;
  }

  const config = args.production || args.live
    ? { ...PRODUCTION_CONFIG }
    : {
        model: args.model ?? "gpt-4o",
        maxTokens: args.maxTokens ?? (/^(o\d|gpt-5)/.test(args.model ?? "") ? 16000 : 2500),
        timeoutMs: args.timeoutMs ?? 90000,
        ...(args.temperature !== undefined && { temperature: args.temperature }),
        ...(args.effort && { effort: args.effort }),
      };
  if (args.timeoutMs && !args.live) config.timeoutMs = args.timeoutMs;

  const label = args.label
    ?? (args.live ? "live" : args.production ? "production-baseline" : [config.model, config.effort && `effort-${config.effort}`, config.temperature !== undefined && `t${config.temperature}`].filter(Boolean).join("-"));

  let cases = JSON.parse(readFileSync(join(HERE, "cases.json"), "utf8"));
  if (args.only) cases = cases.filter((c) => args.only.includes(c.id));

  const jobs = cases.flatMap((c) => Array.from({ length: args.runs }, (_, run) => ({ c, run })));
  console.log(`Eval "${label}": ${cases.length} cases × ${args.runs} runs = ${jobs.length} solves (${args.live ? "live function" : JSON.stringify(config)})\n`);

  let done = 0;
  const records = await pool(jobs, args.concurrency, async ({ c, run }) => {
    const rec = { id: c.id, run };
    try {
      const out = args.live ? await solveLive(c.text) : await runSolve({ apiKey, config, input: { text: c.text }, verify: !args.noVerify });
      Object.assign(rec, { ms: out.ms, usage: out.usage, result: out.result, verification: out.verification });
      const r = out.result;
      if (r?.status === "partial") rec.outcome = "partial";
      else if (r?.hasMath === false) rec.outcome = "wrong";
      else {
        try {
          rec.extracted = await extractAnswer({ apiKey, judgeModel: args.judge, testCase: c, result: r });
          if (rec.extracted.noAnswer) rec.outcome = "non-answer";
          else {
            const verdict = check(c, rec.extracted);
            // Wrong but flagged (verified: false) shows the app's "check it
            // yourself" note: bad, but not the confident-wrong worst case.
            rec.outcome = verdict.ok ? "pass" : r?.verified === false ? "flagged" : "wrong";
            rec.why = verdict.why;
          }
        } catch (e) {
          rec.outcome = "ungradable";
          rec.why = e.message;
        }
      }
    } catch (e) {
      rec.outcome = "error";
      rec.why = e.message;
    }
    done++;
    process.stdout.write(`\r${done}/${jobs.length}`);
    return rec;
  });
  process.stdout.write("\n\n");

  // ---- report -----------------------------------------------------------------
  const OUTCOMES = ["pass", "partial", "flagged", "wrong", "non-answer", "error", "ungradable"];
  const count = (rs, o) => rs.filter((r) => r.outcome === o).length;

  console.log("case".padEnd(26) + OUTCOMES.map((o) => o.padStart(11)).join(""));
  for (const c of cases) {
    const rs = records.filter((r) => r.id === c.id);
    const cells = OUTCOMES.map((o) => String(count(rs, o) || "·").padStart(11));
    console.log(c.id.padEnd(26) + cells.join(""));
  }

  const ms = records.filter((r) => r.ms).map((r) => r.ms);
  const total = records.length;
  const summary = Object.fromEntries(OUTCOMES.map((o) => [o, count(records, o)]));
  const passRate = summary.pass / total;
  const withUsage = records.filter((r) => r.usage);
  const avgIn = withUsage.reduce((s, r) => s + (r.usage.prompt_tokens || 0), 0) / (withUsage.length || 1);
  const avgOut = withUsage.reduce((s, r) => s + (r.usage.completion_tokens || 0), 0) / (withUsage.length || 1);
  const price = PRICES[config.model];
  const costPerSolve = price && withUsage.length ? (avgIn * price[0] + avgOut * price[1]) / 1e6 : null;

  console.log("\n" + [
    `TOTAL ${label}`,
    `pass ${summary.pass}/${total} (${(passRate * 100).toFixed(1)}%)`,
    `partial ${summary.partial}`,
    `flagged-wrong ${summary.flagged}`,
    `confident-wrong ${summary.wrong}`,
    `non-answer ${summary["non-answer"]}`,
    `error ${summary.error}`,
    `ungradable ${summary.ungradable}`,
    `latency p50 ${(pct(ms, 50) / 1000).toFixed(1)}s p90 ${(pct(ms, 90) / 1000).toFixed(1)}s`,
    withUsage.length ? `tokens/solve in ${avgIn.toFixed(0)} out ${avgOut.toFixed(0)}` : null,
    costPerSolve !== null ? `≈ $${costPerSolve.toFixed(4)}/solve` : null,
  ].filter(Boolean).join(" | "));

  const traced = records.filter((r) => r.verification?.first);
  if (traced.length) {
    const first = (st) => traced.filter((r) => r.verification.first.status === st).length;
    const retried = records.filter((r) => r.verification?.attempts === 2).length;
    const passedAfterRetry = records.filter((r) => r.verification?.second?.status === "pass").length;
    const flaggedRight = records.filter((r) => r.result?.verified === false && r.outcome === "pass").length;
    console.log(`verifier: first check pass ${first("pass")} / fail ${first("fail")} / skipped ${first("skipped")} | retried ${retried}, fixed by retry ${passedAfterRetry} | flagged but actually right ${flaggedRight}`);
  }

  const failures = records.filter((r) => r.outcome !== "pass");
  if (failures.length) {
    console.log("\nNot passed (audit these, especially 'ungradable'):");
    for (const r of failures) {
      console.log(`- ${r.id} #${r.run + 1} [${r.outcome}] answer: ${JSON.stringify(r.result?.answer ?? r.result?.message ?? "")}${r.why ? ` — ${r.why}` : ""}`);
    }
  }

  mkdirSync(join(HERE, "results"), { recursive: true });
  const file = join(HERE, "results", `${new Date().toISOString().replace(/[:.]/g, "-")}-${label}.json`);
  writeFileSync(file, JSON.stringify({ label, config: args.live ? "live" : config, judge: args.judge, summary, passRate, p50: pct(ms, 50), p90: pct(ms, 90), avgIn, avgOut, costPerSolve, records }, null, 2));
  console.log(`\nFull results: ${file}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
