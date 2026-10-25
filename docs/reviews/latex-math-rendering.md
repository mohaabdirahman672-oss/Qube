# Completion Summary — Textbook-style math rendering (LaTeX)

**Date:** 2026-10-25 · **Plan:** `docs/plans/latex-math-rendering.md` (approved 2026-10-25)

## What was built
- **Solve steps** are now `{ title, explanation, math }`. The explanation is a plain-English sentence, and the math is LaTeX typeset on its own line: real superscripts, stacked fractions, `÷` and `×`.
- The **Answer box** typesets `answerLatex` in gold, and the **Key formula** chip typesets `formula` in blue.
- **Flashcards:** all 30 built-in cards have hand-written `backLatex` (plus a plain `backNote` caption where needed). Premium **worked examples** are typeset lines in the same format as solve steps, with the final line in gold. User-made cards stay plain text, cleaned.
- **Plain text never shows raw math.** `toPlainMath` converts caret notation and stray LaTeX to Unicode (`a¹⁰ ÷ a⁴`, `a¹⁰/a⁴`, `180°`, `√(b²−4ac)`). It's applied at display time to Saved titles and answer chips, Home's Recent list, the problem text, explanations, common mistakes, practice questions, old-format steps, and MathView's own fallback. Old saved rows are cleaned too.
- **Fallback.** If a LaTeX string doesn't parse (unknown macro, unbalanced brace…), MathJax is set to throw and MathView shows the string as cleaned text. This is a deliberate softening of "show the raw text": raw `\frac{a}{b}` would break decision 2's "never show raw LaTeX".
- **No layout jump.** The TeX→SVG conversion is synchronous and returns exact em dimensions from the SVG viewBox, so every formula has its final size on its first frame. MathJax's one-time setup (~0.5 s in Node, similar or more on device) is moved off the render path: Home warms it up 1.5 s after its entrance animation once the app is idle (all Home animations are native-driven, so they can't stutter), and Solve warms it while the request is in flight. Flashcards: the back face is now in normal flow, so the card is always as tall as its answer, and flipping never resizes it. The worked example holds a 150px placeholder while loading.

## Files
- **Created:** `src/components/MathView.js`, `src/lib/mathjax.js`, `src/lib/plainMath.js`, this doc.
- **Modified:**
  - `supabase/functions/solve/index.js`: prompt and schema, JSON mode, LaTeX escape repair, ambiguity detection, max_tokens 2000→2500.
  - `supabase/functions/flashcard-example/index.js`: structured lines, JSON mode, `v2__` cache key.
  - `src/components/SolutionView.js`: also exports `StepContent` and `isTypesetResult`.
  - `src/screens/SolveScreen.js`, `SavedScreen.js`, `HomeScreen.js`, `PracticeScreen.js`.
  - `src/lib/recentSolves.js`, `src/data/practiceData.js`.
  - `package.json`: `react-native-svg@15.11.2`, `mathjax-full@3.2.2` (exact).
- **Deployed:** `solve` (now v14 or later; this also ships the KI-14 Premium-ceiling change) and `flashcard-example`.

## Decisions
- **Renderer: MathJax (`mathjax-full`) → SVG string → `react-native-svg` `SvgXml`, behind our own ~80-line component.**
  - KaTeX would have needed one WebView per formula, with async heights.
  - The existing RN MathJax wrappers haven't been updated since 2022.
  - Only the `base` and `ams` TeX packages are loaded, and `noundefined` is deliberately left out so unknown macros throw.
- **`answer` stays plain text, plus `answerLatex`** (decision 2). `answer` also feeds the DB `title` and list rows.
- **LaTeX-in-JSON repair on the server.** Single-escaped LaTeX either breaks `JSON.parse` (`\div`) or silently parses into control characters (`\frac` → form feed, `\times` → tab). The repair doubles invalid escapes before parsing, then restores control characters to backslash-letters, in the LaTeX fields only. It's covered by 4 unit cases, plus JSON mode (`response_format: json_object`).
- **Ambiguity is detected on the server for typed problems.** The prompt rule alone produced the textbook answer but never said so. `AMBIGUOUS_DIVISION` (`÷`/`/` followed by an implied multiplication such as `÷ 2(`, `/2x`) adds an explicit note to the user message, asking for a one-clause mention of the reading in step 1 and for the grouped divisor to stay together. Unambiguous problems get no mention. Photo solves rely on the prompt rule only.
- **The `react-native-svg` import is guarded** (`TurboModuleRegistry.get('RNSVGSvgViewModule')`), because the package calls `getEnforcing` at import time. The pre-2026-10-25 dev build would otherwise red-screen on reload. On that build every formula shows its plain-text fallback.
- **Worked-example cache:** a `v2__` key prefix, with the JSON stored in the existing `text` column. No migration; old rows are simply no longer read.

## Testing done
- **MathJax (Node, the app's own module):**
  - The test expression, `aligned`, `\sqrt`, `\text`, `^\circ` and the trig cases all convert.
  - 5 malformed strings all throw, which means the fallback triggers.
  - All 30 card formulas compile, and their pixel sizes are sane: widest 250px, tallest SOH-CAH-TOA at 126px.
- **`toPlainMath`:** 22 cases, covering caret notation, `^(10-4)`, subscripts, `\frac`, `\sqrt[3]`, `aligned`, `\circ`, `*`, `>=`, and prose that must stay untouched.
- **Live `solve`, test problem `4(a^10 ÷ a^4) ÷ 2(a^3 × a^2) − 3a^0`:**
  - Returns **2a − 3**.
  - Step 1 opens with "Reading 2(a³ × a²) as one grouped term…".
  - The grouped divisor stays together (`\frac{4a^{6}}{2a^{5}}`), and `\div`/`\times` are used.
  - Plain fields are Unicode.
- **Live `solve`, quadratic `2x^2 + 7x − 15 = 0`:** 5 steps including an `aligned` block, `answerLatex` `x = \frac{3}{2} \quad \text{or} \quad x = -5`, and a typeset formula. No ambiguity mention.
- **Rendered previews:** the MathJax SVG output for both live results and the cards was rasterised and inspected. It reads as textbook typesetting in the dark theme colours.
- **iOS production bundle** (`expo export`) builds. MathJax is ~2.2 MB of source, ~20% of the JS; most of it is SVG font data. It's lazy-required, so there's no launch cost.

## Still to do
1. **Install the new dev build** (EAS build `6bc5ffda-da52-4b21-a280-9884a489f7d6`, queued 2026-10-25) and check on the phone:
   - typeset steps and Answer, in dark theme
   - horizontal scroll on a long expression
   - the pause on the first solution or first card, if any
   - flashcard heights, with no jump on flip
   - an old saved problem rendering as cleaned text
2. **Premium worked examples were not exercised live.** They need a Premium session, so they're blocked on C6 sandbox purchase. The code path is the same parse and repair as `solve`.
3. **Optional:** `expo start --web` visual pass (`react-native-svg` supports web).

## Risks / known issues
- **First-render cost on device is unmeasured.** It's ~470 ms in Node for the first conversion and ~5–15 ms per formula after that. If a user opens Practice within ~2 s of launch, before the Home warm-up, the first card pays the setup cost once.
- **Model variance.** About 1 in 4 runs slipped `^`/LaTeX into an explanation. `toPlainMath` cleans it, so users don't see it, but the contract isn't perfect.
- **`toPlainMath` is best-effort.** Superscripts with letters Unicode lacks (e.g. `q`) stay as `^(…)`, and `/2a` denominators aren't bracketed.
- **Old dev build** (before this change): formulas show as cleaned text, not typeset. Not a crash.
