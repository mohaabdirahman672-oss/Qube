# Solve eval

A repeatable accuracy test for the `solve` edge function (`docs/plans/solve-quality.md`, checklist G3).
Run it after **every** prompt, model or settings change, and record the result in the table below.

## Setup (once)
1. Create a low-limit OpenAI key named `qube-eval` (platform.openai.com → API keys, ideally with a small monthly budget).
2. Put it in `.env.local` in the **repo root** (gitignored): `OPENAI_EVAL_KEY=sk-...`
3. `cd evals/solve && npm install`

The runner never prints the key. It isn't the production key, and it never reaches the app.

## Run
```
npm run eval -- --production                      # exactly what production runs today (baseline)
npm run eval -- --model gpt-4o --temperature 0    # a candidate config
npm run eval -- --model o4-mini --effort low      # a reasoning model (no temperature)
npm run eval -- --only owner-substitution --runs 5
npm run eval -- --live --runs 1 --only linear     # the deployed function, end to end
npm run eval -- --list-models                     # models this key can use
```
Options: `--runs N` (default 3), `--concurrency N` (default 4), `--timeout SECONDS`, `--max-tokens N`, `--judge MODEL` (answer extractor, default gpt-4o-mini), `--label NAME`.

**Candidate mode** imports the server's own `supabase/functions/solve/pipeline.js` and `prompt.js`, so it measures the same prompt and request the function sends, without deploying.
**Live mode** calls the deployed function as an anonymous guest, so it's limited to **10 solves/hour** and counts against that device's weekly limit. Use it for small smoke tests after a deploy. Set `QUBE_EVAL_ACCESS_TOKEN` to a signed-in user's access token to use that account's limits instead.

## How grading works
- `cases.json` has 25 problems, algebra through calculus, each with a hand-checked answer and a grading rule (`solutions`, `system`, `expression`, `antiderivative`, `number`, `interval`).
- A small model (gpt-4o-mini, temperature 0) only **extracts** the final answer into mathjs syntax. It's told to copy exactly what the answer claims, wrong or not.
- **mathjs** decides correctness numerically: solution sets compared order-free, expressions compared at 10 probe points, antiderivatives by differentiating, inequalities at probe values. No model judges correctness.
- Outcomes:
  - `pass`
  - `partial`: an honest "couldn't finish" (after Q2)
  - `flagged`: wrong, but verification flagged it (`verified: false`), so the app shows a "check it yourself" note
  - `wrong`: confidently wrong, **the worst outcome**
  - `non-answer`: presented as solved, but no actual result
  - `error`: timeout, API or parse failure
  - `ungradable`: the extraction couldn't be parsed. **Audit these by hand.**
- Every non-pass is listed with the answer text. Full records go to `results/` (gitignored).

**Target:** ≥ 95% pass over all runs, **0 wrong**, **0 non-answer**, p90 latency ≤ ~25 s.

## Results
| Date | Config | Pass | Partial | Wrong | Non-answer | Error | p50 / p90 | ≈ $/solve |
|---|---|---|---|---|---|---|---|---|
| 2026-11-14 | **Production baseline**: gpt-4o, temperature unset (1.0), 2500 tokens, today's prompt | 73/75 (97.3%) | 0 | **2** | 0 | 0 | 3.3 s / 4.5 s | $0.0079 |

| 2026-11-15 | gpt-4o, temperature 0 | 73/75 (97.3%) | 0 | **2** | 0 | 0 | 2.5 s / 3.5 s | $0.0079 |
| 2026-11-15 | gpt-4.1, temperature 0 | 74/75 (98.7%)¹ | 0 | 0 | 0 | 1 | 2.8 s / 3.5 s | $0.0063 |
| 2026-11-15 | gpt-5.4-mini, effort low | 72/75 (96.0%) | 0 | **3** | 0 | 0 | 2.4 s / 3.5 s | ≈$0.0032² |
| 2026-11-15 | gpt-5.4-mini, effort medium | 73/75 (97.3%) | 0 | **2** | 0 | 0 | 3.4 s / 5.0 s³ | ≈$0.0041² |
| 2026-11-15 | gpt-5.5, effort low | 73/75 (97.3%) | 0 | **2** | 0 | 0 | 6.0 s / 7.4 s³ | n/a |
| 2026-11-15 | **gpt-5.4, effort low** | **75/75 (100%)** | 0 | **0** | 0 | 0 | 6.1 s / 8.3 s³ | ≈$0.0117² |
| 2026-11-15 | gpt-5-mini | blocked: needs OpenAI organization verification | | | | | | |
| 2026-11-15 | **Q2 production**: gpt-5.4 low + new prompt (`status`, `check`, Check step) + server verification and retry | **75/75**⁴ | 0 | **0** | 0 | 0 | 7.7 s / 11.1 s | ≈$0.0164 |

**Stress test** (6 hardest cases × 5 runs: owner-substitution, rational-extraneous, radical-extraneous, quad-rational, trig-equation, limit-zero):
- gpt-5.4, effort low: **30/30**, 0 wrong, p90 10.4 s
- gpt-4.1, temperature 0: 27/30. 2 wrong (rational-extraneous kept the extraneous root), 1 error (limit-zero runaway output, truncated JSON)

Notes:
1. One gpt-4.1 result was originally "ungradable" (the extractor returned `x^{2}`). It's correct, and `grade.js` now converts LaTeX braces. The error is a runaway output on `limit-zero` (truncated JSON), which repeated in the stress test.
2. Prices for the 5.4 models come from third-party listings (gpt-5.4: $2.50 / $15 per 1M; mini: $0.75 / $4.50). Confirm them on openai.com/api/pricing.
3. Three solves in each of these runs stalled for about 18 minutes at the same wall-clock moment across parallel runs (a local or network pause, not the model). They're excluded from the latency figures shown.

4. 74 passed, plus one "ungradable" that was a correct answer (the extractor returned LaTeX `\frac{\pi}{2}`, which `grade.js` now handles). Verifier: 68 passed first time, 0 failed, 7 skipped (six "no solution" answers, which substitution can't check, all correct; one with no check). Cost is higher because the prompt is longer (about 1,880 input tokens) and the Check step adds output (about 780).

Real failures, audited by hand:
- gpt-4o at temperature 0 is **deterministically** wrong on `owner-substitution` (x = −1 instead of −2), so temperature 0 alone doesn't fix it.
- gpt-5.4-mini factors 6x² − x − 2 as (3x+2)(2x−1), even at medium effort.
- gpt-5.5 solves sin x = 1 as 3π/2.

**Recommendation (Q1):** use `gpt-5.4` at `reasoning_effort: "low"` for all solves.
- It's the only candidate that meets the target: 105/105 across both runs, 0 wrong, 0 errors.
- p90 is about 10 s, well under 25 s, so a hybrid isn't needed.
- It costs about 1.5× today's price per solve.
- Its low effort uses only about 20 reasoning tokens. The gain is the model itself, not long reasoning.
- No image cases are in the set yet. Q2 must smoke-test a scan on gpt-5.4 before deploying.

Baseline failures (both audited by hand, both real):
- `owner-substitution` run 1: "x = 1 or x = −1.5 or x = −0.5". −1.5 isn't a root, and −2 is missing.
- `rational-extraneous` run 1: "x = 2". It divides by zero in the original equation (the extraneous root), and the correct answer is no solution.
