# Plan: Solve quality (correct answers, honest failures, verified results)

> Status: **approved 2026-11-14**. Written 2026-10-25. Checklist item G3, done **before** the math keyboard (G2).
> Owner decisions (2026-11-14):
> 1. **qube-eval key:** yes. The owner creates it and puts it in `.env.local` before Q1, so the model comparison runs in full.
> 2. **Hybrid:** acceptable if a reasoning model alone is too slow.
> 3. **`partial` results don't count** against the free weekly limit.

## Feature
Make `solve` reliably right on multi-step problems, and honest when it isn't:
1. Measure accuracy with a **repeatable test set** (~22 problems, algebra through calculus) that runs after every prompt or model change.
2. **Never return a non-answer.** If the model can't finish, it says so plainly and shows how far it got.
3. **Check final answers by substituting them back** before returning, with code on the server, not just the model's word.
4. Pick the **model** with the numbers from (1), not by guesswork.

## What's wrong today (evidence)
- **Settings:** `gpt-4o`, temperature not set (so the API default of 1.0, the most random), `max_tokens` 2500, JSON mode, a 20 s timeout with one retry, and **no answer checking**.
- **Reproduced 2026-10-25:** `2(x + 1/x)² = 10 − x − 1/x`, 3 runs on the live function:
  - Runs 1–2: correct (`x = 1, −2, −1/2`, via u = x + 1/x).
  - Run 3: **confidently wrong** (`x = −1 or x = −2`). Step 4 expanded incorrectly and step 7 is nonsense. x = −1 gives a left side of 8 and a right side of 12, so substituting back would have caught it.
  - Your run gave the other failure mode: a wrong step (2/x for 1/x), then the non-answer "Requires further simplification and solving".
- **Root causes:**
  1. **Randomness** (temperature 1.0): the same problem gets different answers.
  2. **A non-reasoning model:** gpt-4o writes the solution in one pass, so a single slip carries through to the answer.
  3. **No way out:** the prompt never allows "I couldn't finish", so the model writes filler.
  4. **Nothing verifies the result.**
- **Scans:** a misread scan can't be corrected today, and the screen doesn't even show what the AI read (see G2 Session 6).

## Approach

### 1. Test set and eval runner (first, before touching the prompt)
- `evals/solve/cases.json`: ~22 problems, each with an expected answer and a **grading rule**:

  | Grading rule | How it's checked | Examples |
  |---|---|---|
  | `solutions` | The solution set compared numerically (order-free, ±1e-6) | linear, quadratic (rational and irrational roots), **your substitution problem**, rational equation with an extraneous root, radical equation with an extraneous root, absolute value, cubic `x³−6x²+11x−6=0`, logs `log₂x + log₂(x−2) = 3`, exponential, 2×2 system, trig equation on [0, 2π) |
  | `expression` | Equivalent to the expected expression at random points | the `÷ 2(…)` exponent problem, rational expression simplification, trig identity simplification |
  | `derivative` | Equivalent to the expected derivative at random points | product + chain `x²·sin 3x`, quotient rule |
  | `antiderivative` | Its derivative matches the integrand (so any `+ C` passes) | `∫ x eˣ dx` |
  | `number` | Numeric, ±1e-6 | `∫₀^π sin x dx = 2`, `lim x→0 sin 5x / x = 5`, a limit at ∞, a percentage word problem |
  | `interval` | Test points inside and outside the set | `x² − 5x + 6 < 0` → `2 < x < 3` |

- `evals/solve/run.js`: runs every case **3 times** (to catch randomness) and prints, per case and in total:
  - pass rate
  - "partial" count (honest failures)
  - wrong-and-confident count (the worst outcome)
  - p50 and p90 latency
  - tokens, for an estimated cost per solve
- **It runs two ways:**
  - **Live:** against the deployed `solve` function, end to end.
  - **Candidate:** directly against OpenAI with a given model, using the **same prompt module** as the function. This lets models be compared before anything is deployed.
- **Needs** a separate low-limit OpenAI "qube-eval" key in `.env.local` (already gitignored). The runner never prints it. A full run of 22 × 3 per model costs cents, or roughly a dollar or two with a reasoning model.

### 2. Honest answers (schema and prompt)
- New field **`status`: `"solved"` | `"partial"`**.
  - `partial` = the model couldn't finish. `answer` says so honestly (e.g. "I couldn't finish this one. Here's how far I got."), the steps show the work so far, and `stuckReason` says where it got stuck.
  - The prompt bans filler like "requires further simplification".
- New **`check`** field: machine-readable data for the server to verify, in plain ASCII math (mathjs syntax):
  - `{ kind: "equation", variable: "x", equation: "2*(x+1/x)^2 = 10 - x - 1/x", solutions: ["1", "-2", "-1/2"] }`
  - `{ kind: "expression", original, result }`, `{ kind: "derivative", fn, variable, result }`, `{ kind: "integral", ... }`, `{ kind: "number", ... }`
  - `{ kind: "none" }` for word problems and proofs.
- The prompt asks for a visible **final "Check" step** that substitutes the answer back in. Textbooks do this and it teaches the habit, and reasoning models do it well.
- **`problemLatex`**: the problem as LaTeX. Free to add now, and it lets a misread scan be loaded into the keyboard field later (G2 Session 6).
- **Temperature 0** for gpt-4o (reasoning models don't take a temperature).

### 3. Server-side verification (code, not trust)
- `supabase/functions/solve/verify.js` uses **mathjs** (`npm:mathjs@15.2.0`; Supabase Edge Functions support `npm:` imports). Session Q2 confirms this on the first deploy. Checks:
  - **equation:** substitute each solution; |LHS − RHS| must be within tolerance; division by zero means extraneous, which is a fail.
  - **expression / derivative / integral:** numeric equivalence at random points (integrals via their derivative).
  - **number:** recompute where possible.
  - If `check` can't be parsed, verification is **skipped**, never blocking.
- **On failure:** one retry, with specific feedback to the model, e.g. "x = −1 does not satisfy the equation (left side 8, right side 12). Find the error and redo it."
  - If the retry passes, return it.
  - If it still fails, return it with **`verified: false`**, and the app shows a gentle "We couldn't double-check this answer, so check it yourself" note above the Answer.
- **Weekly charge:** unchanged (charged only when a result is returned). Open question 3 is whether a `partial` result should count.

### 4. Model choice (decided by the eval)
- Candidates: **gpt-4o at temperature 0** (baseline), versus OpenAI's **reasoning models** that your key can access. Session Q1 lists them from `/v1/models` rather than me guessing names. The model must also accept **images** (scans).
- **Decision rule:**
  - highest pass rate (target ≥ 95% across all 3 runs, and **0** confident-wrong answers)
  - p90 latency ≤ ~25 s
  - then cost per solve
- **Likely outcome:** either a reasoning model for everything, or a **hybrid**: the fast model first, escalating to the reasoning model only when verification fails or the problem looks multi-step. The hybrid keeps most solves fast and cheap.
- **Timeouts:** server per-call timeout 20 s → up to 60 s for reasoning models, client 45 s → 90 s. The loading text moves through stages ("Solving…", then "Checking the answer…") so a longer wait doesn't feel stuck.

## Files to Create
- `evals/solve/cases.json`, `evals/solve/run.js`, `evals/solve/README.md` (how to run it, and the latest results table)
- `supabase/functions/solve/prompt.js`: the system prompt, user-message builder and JSON repair, shared by the function and the eval runner
- `supabase/functions/solve/verify.js`
- `docs/reviews/solve-quality.md`

## Files to Edit
- `supabase/functions/solve/index.js`: model and settings, `status`/`check`/`problemLatex`, the verify-and-retry loop, timeouts (deploy needed)
- `src/components/SolutionView.js`: the partial state (no gold Answer box; an honest "Couldn't finish" card) and the unverified note
- `src/services/solveApi.js`: client timeout 45 → 90 s
- `src/screens/SolveScreen.js`: the staged loading text
- `.env.example`: document the optional eval key (placeholder only)

## Dependencies
- `mathjs@15.2.0`: server only, via Deno `npm:` import, plus as a devDependency for the eval runner's graders. **No app bundle change and no native build.**

## Risks
- **Reasoning models are slower** (often 10–40 s) and cost more per solve. That's why latency and cost are part of the decision rule, and why the hybrid exists.
- **The model writes `check` in a form mathjs can't parse.** Verification is skipped (never blocks), and the eval tracks how often this happens.
- **A retry doubles the cost and latency** on failures, but only on failures.
- **Supabase edge limits:** the request time limit is comfortably above 60 s, but this gets watched in the eval.

## Edge Cases
- Problems with no real solution: `solutions: []` with an honest answer ("no real solutions"), checked by the eval.
- Extraneous roots (radical and rational equations): verification rejects them, and the model must list them as rejected.
- Identities and expressions with no `=`: the expression check, not the equation check.
- Approximate answers (π, √2, decimals): numeric tolerance.
- Word problems and proofs: `check: none`. The model's own Check step still appears.
- Image solves: same pipeline, with `problemLatex` showing what was read.

## Testing Strategy
The eval runner **is** the test strategy:
1. A baseline (live, today's prompt) before any change.
2. Candidate models compared directly.
3. Re-run after every prompt change. Results are recorded in `evals/solve/README.md`, so regressions are visible.
4. On the phone: your substitution problem, a deliberately unsolvable one (to see the honest partial card), and a scan.

## Sessions (~1 hour each)

| # | Session | You can test | Build | Checklist item meanwhile |
|---|---|---|---|---|
| **Q1** | Test set, eval runner, **baseline report** (live), model list from your key, candidate comparison | Read the results table: pass rates, latency and cost per model, plus my model recommendation | none | **C1** create the subscriptions |
| **Q2** | `status`/`check`/`problemLatex`, mathjs verification and retry, honest partial + unverified UI, chosen model, timeouts; deploy; re-run the eval | Your substitution problem on the phone, plus an unsolvable one (partial card) | none (JS + server) | **C2** In-App Purchase key |
| **Q3** *(buffer)* | Prompt tuning against eval failures until the target is met | The final eval table | none | **E3** forms |

## Open Questions
1. OK to create a separate low-limit **"qube-eval" OpenAI key** and put it in `.env.local` for the eval runner? I'd use it only for evals, never print it, and never commit it.
2. Is a **hybrid** acceptable (fast model, escalating to the reasoning model) if a reasoning model alone is too slow, or do you prefer one model even if it's slower?
3. Should a **`partial`** (couldn't finish) result **count** against the free weekly limit? I'd say **no**, since it's honest and keeps trust.
