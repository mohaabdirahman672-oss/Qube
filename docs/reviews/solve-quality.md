# Review: Solve quality (G3, sessions Q1 + Q2)

> Plan: `docs/plans/solve-quality.md` (approved 2026-11-14). Done 2026-11-15.
> Status: **deployed 2026-11-15** with the owner's OK. Live smoke test 2/2 passed (`verified: true` confirms mathjs runs on Supabase; 12–17 s end to end). Phone check pending (KI-18). Q3 (prompt tuning) is a buffer and may not be needed.

## Results
| Config | Pass | Wrong | p50 / p90 | ≈ $/solve |
|---|---|---|---|---|
| Before (production gpt-4o, temperature unset) | 73/75 (97.3%) | 2 confident | 3.3 s / 4.5 s | $0.008 |
| **After (gpt-5.4 low + new prompt + verification)** | **75/75** ¹ | **0** | 7.7 s / 11.1 s | ≈ $0.016 ² |

1. Measured 74/75 plus one "ungradable" that was a correct answer (x = π/2, 7π/6, 11π/6). The grader's extractor returned `\frac{\pi}{2}`, and `grade.js` now handles that.
2. Input grew from about 1,060 to about 1,880 tokens (the longer prompt) and output from about 575 to about 780 (the Check step and `check`). OpenAI caches repeated prompts over 1,024 tokens automatically at a lower rate, so production cost should come in below this list-price figure. That hasn't been measured.

What else was tested:
- **Verifier:** in the eval, 68 of 75 checks passed first time, 0 failed and 7 were skipped. All six "no solution" answers were skipped because there's nothing to substitute, and all six were correct. One solve had no check. **Every `check` the model wrote was parseable.**
- **Scan:** a rendered photo of your x + 1/x problem was read correctly, solved, checked and returned `problemLatex`, in 13 s.
- **Honest failure:** "Solve x⁵ − x + 1 = 0 exactly" gave `status: "partial"` with a correct "not solvable by radicals" explanation, not filler.
- **Offline tests:** `npm test` passes 45/45. That includes 6 new verifier unit tests and 7 new server tests:
  - the production model is set correctly
  - a verified answer is flagged and its `check` is stripped
  - wrong → retry with specific feedback → verified
  - wrong twice → `verified: false`
  - an unparseable check never blocks
  - a partial is returned and **not charged**
  - a retry that turns into a partial is not charged

## What was built
**Q1 (model choice).** Seven configurations were compared (`evals/solve/README.md`). gpt-5.4 at low reasoning effort was the only one with 0 wrong answers: 105/105 including a 30-solve stress test on the hardest cases. Other findings:
- gpt-4o at temperature 0 is wrong *deterministically* on the owner's problem.
- gpt-5.4-mini misfactors 6x² − x − 2.
- gpt-5.5 solves sin x = 1 as 3π/2.
- gpt-5-mini needs OpenAI organization verification.

**Q2:**
- `supabase/functions/solve/verify.js` (new) checks the model's `check` object with mathjs:
  - equations (substitution; division by zero counts as extraneous)
  - systems
  - expressions, derivatives and antiderivatives (numeric equivalence at 10 probe points)
  - definite integrals (Simpson's rule)
  - limits (numeric, from both sides or out to ±∞)
  - numbers
  - inequalities (probe points)

  Anything it can't parse is `skipped`, never blocking.
- `pipeline.js`:
  - production is now `gpt-5.4`, `reasoning_effort: low`, 8,000 max completion tokens, a 60 s per-call timeout and an **80 s total budget** that includes the retry
  - verify → on a provable failure, one retry with specific feedback (e.g. "x = −1 … left side 8, right side 12") → verify again
  - `verified: true / false / absent`
  - `check` is stripped before the response
- `prompt.js`:
  - new fields `status`, `stuckReason`, `problemLatex` and `check` (mathjs syntax, one shape per problem kind)
  - a required final "Check the answer" step
  - filler like "requires further simplification" is banned
  - a `retryMessage()` for the retry
- `index.js`: `partial` results are **not charged** against the free weekly limit (owner decision 3).
- `SolutionView.js`:
  - a partial result shows a neutral "COULDN'T FINISH" card (the answer text, `stuckReason`, and "This one wasn't counted against your free solves") instead of the gold Answer box
  - `verified: false` shows "We couldn't double-check this answer, so check it yourself before you rely on it" above the Answer
- `SolveScreen.js`: a saved partial is titled "Unfinished: …" instead of "Answer: I couldn't finish…". The staged loading text ("Checking the answer…") already existed from G2.
- `solveApi.js`: client timeout 45 → 90 s.
- `mathjs@15.2.0`:
  - in `supabase/functions/solve/deno.json` for Deno
  - an exact-pinned **devDependency** at the repo root, so Node (tests and eval) resolves the same bare `mathjs` import
  - not imported by the app, so **no bundle change and no native build**
- Eval runner:
  - a new `flagged` outcome (wrong but `verified: false`, so the app warns)
  - verifier stats
  - `--no-verify`
  - the 5.4 prices
- `grade.js`: LaTeX `\frac`/`\pi`/braces normalised before grading.

## Decisions
- **No hybrid.** gpt-5.4's p90 of about 11 s is well inside the 25 s target, so the fast-model-then-escalate design isn't needed.
- **Charged once per solve**, not per attempt. A retry is the server's cost, not the user's.
- **"No solution" answers aren't verified.** Substitution can't prove that a solution set is empty.
- **The retry is skipped** if less than 25 s of the 80 s budget is left. The answer is then returned with `verified: false`, so the app always gets a reply before its own 90 s timeout.

## Risks and known gaps
- **Missing roots aren't detected.** The verifier checks the roots the model gave, not whether one was left out. In the eval, every wrong answer also contained a bad root, so it would have been caught, but a pure omission would pass.
- **Cost about 2× per solve** at list price (about $0.016 versus $0.008). At 20 free solves/week that's about $0.32 per active free user per week at most. Premium fair use is 100/hour.
- **Slower:** p50 went from 3 s to 8 s. The loading stages cover it, and it should be checked on the phone.
- **Old app builds** ignore `status` and `verified`. A partial shows its honest sentence inside the gold Answer box, which is acceptable because nothing is released yet. `problemLatex` is already used by G2's scan correction.
- Edge-function `npm:` import of mathjs: ✅ confirmed live.
- Live latency is 12–17 s end to end (the eval's 8–11 s is the model alone), partly the cold start after the deploy. Watch it on the phone.

## Still to do
1. ✅ Deployed and live smoke-tested (2026-11-15).
2. On the phone (the partial card and unverified note need the next dev build; old builds still work):
   - your substitution problem
   - an unsolvable one (`Solve x^5 - x + 1 = 0 exactly`) to see the partial card
   - a scan
3. Q3 (buffer) ideas:
   - for problems with no closed form, give the approximate real roots (x ≈ −1.167) alongside the honest "no exact form"
   - add image cases to the eval
