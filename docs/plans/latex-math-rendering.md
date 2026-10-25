# Plan: Textbook-style math rendering (LaTeX)

> Status: **approved 2026-10-25** with these decisions:
> 1. MathJax + react-native-svg, dev rebuild OK. **Each equation's space is reserved, so the layout never jumps.** Size is computed synchronously before first paint, and MathJax is warmed up while the solve request is in flight.
> 2. `answer` stays plain text, plus `answerLatex`. **Everywhere plain text shows math (Saved titles, Home Recent, Saved answer chip, problem text), it is cleaned to Unicode** (`a¹⁰ ÷ a⁴`, never `a^10` or `\frac`) by `src/lib/plainMath.js`, at display time so old saved rows are cleaned too.
> 3. Textbook reading by default. The reading is mentioned in step 1 **only when the problem is actually ambiguous**.
> 4. Premium worked examples are included and get the full typeset treatment.

## Feature
Solutions, the Answer box, and flashcards currently show math as plain text (`a^(10-4)`, `4a^6`). After this change, each step shows:
1. a short plain-English sentence (`explanation`), then
2. the math on its own line, typeset properly (`math`, LaTeX): real superscripts, stacked fractions, `÷`/`×`.

The Answer box is typeset the same way. If a LaTeX string fails to render, the raw string is shown as plain text instead.

## Renderer decision (needs approval before install)

**Recommended: MathJax (`mathjax-full@3.2.2`) → SVG string → `react-native-svg` (`SvgXml`), wrapped in our own small `MathView` component.**

| Option | Verdict |
|---|---|
| **mathjax-full + react-native-svg (own wrapper)** ✅ | Fully native drawing, no WebView. Gives exact width/height for each formula, so it sizes to content with no measuring step or flicker. MathJax draws glyphs with `currentColor`, so theme colours (`colors.textPrimary`, `colors.gold`) go straight through `SvgXml`'s `color` prop. `react-native-svg` is an Expo-supported module (SDK 53 pins `15.11.2` via `expo install`). Also works with `expo start --web`. |
| react-native-katex (WebView + KaTeX) | One WebView per formula, and a solve has about 6–10 formulas. That is heavy, the height has to be posted back from JS (layout jump), and the background must be made transparent for dark mode. |
| react-native-math-view / react-native-mathjax-svg | The same MathJax→SVG approach, but neither has been updated since 2022 (pre-New-Architecture). Our wrapper needs about 80 lines, which is less risk than depending on an unmaintained package. |
| One WebView for the whole solution | Gives up the native layout, the theme, and the Save/Try-next interactions. |

**Native rebuild required.** `react-native-svg` is a native module, and the dev build currently on your phone doesn't contain it. Opening a JS bundle that uses it on the old build crashes (`RNSVG… not found`). Every real renderer needs this, because the WebView option is native too. So:
- I can verify everything in the browser first with `expo start --web`.
- Then one `eas build --profile development --platform ios` (~20–40 min) is needed for on-phone testing. The D2 production build picks it up automatically.

## Data shape changes

### `solve` function response
```jsonc
{
  "steps": [
    { "title": "Simplify inside the brackets",
      "explanation": "Divide powers with the same base by subtracting exponents.",
      "math": "4\\left(\\frac{a^{10}}{a^{4}}\\right) = 4a^{6}" }
  ],
  "answer": "2a - 3",          // plain text, kept as-is (see below)
  "answerLatex": "2a - 3",     // NEW: typeset in the Answer box
  "formula": "\\frac{a^m}{a^n} = a^{m-n}"   // now LaTeX (rendered in the formula chip)
}
```
- `title` stays. It is the bold heading of each step and costs nothing to keep.
- **`answer` stays plain text and `answerLatex` is added.** This differs slightly from the request. `answer` is also used where it can't be typeset: the Saved card title (`"Answer: " + answer`, stored in the DB `title` column), Home's Recent list subtitle, and the Saved answer chip. If only LaTeX were returned, those places would show `\frac{...}`. The Answer box itself renders `answerLatex`.
- Prompt rules: explanations are plain English with as few symbols as possible. All math goes in `math`. Use `\div` and `\times` when the problem uses them, `\frac` for fractions, and `\begin{aligned}` for multi-line working inside one step. Only standard LaTeX macros are allowed (base + AMS).

### Backward compatibility
Saved problems (Supabase `saved_problems.steps`) and local Recent solves already hold the old `{ title, body }` steps. `SolutionView` and `SavedScreen` render `body` as plain text when `explanation`/`math` are missing, and fall back from `answerLatex` to `answer`. No migration is needed.

### Flashcards
- **Built-in deck** (`src/data/practiceData.js`, 30 cards): each card gets a `backLatex` field (for example `x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}`). Descriptive lines such as "(c = hypotenuse)" stay as plain-text captions under the formula. I hand-write all 30 conversions.
- **User-made cards**: these stay plain text. Users type them, and asking them to write LaTeX would be a worse experience.
- **Premium worked examples** (`flashcard-example` function): the prompt changes to return `[{ explanation, math }]` lines in the same format as solve steps. Old cached plain-text examples in `flashcard_worked_examples` are left alone. New ones use a `v2:` cache-key prefix, so they regenerate on first view and old ones still display as plain text if read.

## Files to Create
- `src/components/MathView.js`: `<MathView latex="…" color={…} fontSize={…} />`. It converts TeX to SVG with MathJax (lazy-loaded on first use, so there is **no cost at app launch**), memoises by string, and converts MathJax `ex` units to px from `fontSize`. When a formula is wider than the card, it scrolls horizontally instead of wrapping. On a parse error or unknown macro it renders `<Text>{latex}</Text>`.
- `src/lib/mathjax.js`: one-time MathJax setup (TeX input with `base` + `ams` packages only to keep the bundle small, SVG output, lite adaptor with no DOM). `formatError` rethrows, so bad LaTeX throws instead of drawing a red error box.
- `docs/reviews/latex-math-rendering.md` (after implementation).

## Files to Edit
- `supabase/functions/solve/index.js`: prompt and schema (above). Needs a deploy, which also closes B2/KI-14.
- `supabase/functions/flashcard-example/index.js`: prompt, JSON output, `v2:` cache key.
- `src/components/SolutionView.js`: steps (explanation + `MathView`), Answer box, formula chip, old-shape fallback.
- `src/screens/SavedScreen.js`: expanded steps and answer use the same rendering and fallback.
- `src/screens/PracticeScreen.js`: card back and worked example use `MathView` when LaTeX is present.
- `src/data/practiceData.js`: `backLatex` for the 30 built-in cards.
- `package.json`: `react-native-svg` (via `npx expo install`) and `mathjax-full@3.2.2`.
- `docs/shared-changes.md`, `docs/agent-memory.md` (renderer decision).

## Dependencies
- `react-native-svg@15.11.2`: native, Expo SDK 53 pinned, **requires a new dev build**.
- `mathjax-full@3.2.2`: pure JS. Only the TeX/SVG modules are imported, an estimated +1–1.5 MB to the JS bundle. Lazy-loaded.

## Risks
- **Rebuild needed** before testing on the phone (see above).
- **Bundle size / first render**: MathJax setup takes roughly 100–300 ms on the first formula. Mitigation: lazy-load, then memoise. It never runs at launch. Worth checking on the device.
- **Model returns bad LaTeX** (unbalanced braces, unknown macros). Mitigation: the raw-text fallback, plus a strict macro allow-list in the prompt.
- **Metro + mathjax-full**: it's CommonJS and DOM-free with the lite adaptor, and the abandoned RN wrappers used exactly this path. I'll confirm it bundles on web before the native rebuild.

## Edge Cases
- **The test problem is ambiguous.** `4(a^10 ÷ a^4) ÷ 2(a^3 × a^2) − 3a^0` gives **2a − 3** if `÷ 2(…)` means "divide by the whole 2(a^3 × a^2)" (the usual textbook intent), and **2a^11 − 3** if read strictly left to right (`÷ 2`, then `× (a^3 × a^2)`). The prompt will tell the model to say in step 1 which reading it used. My recommendation is the textbook reading.
- `a^0 = 1` with `a ≠ 0`. The model should note this when it matters.
- Very long expressions scroll horizontally inside the step instead of overflowing the card.
- Image solves: same schema. `problem` stays plain text because it's used as a title.
- `hasMath: false` responses are unchanged.
- Empty `math` for a step that is only words: render the explanation alone.

## Testing Strategy
1. **Node script** (scratchpad, before UI work): run every built-in flashcard `backLatex` and a set of sample model outputs through `src/lib/mathjax.js` and assert none throw. Deliberately broken strings must throw, which exercises the fallback.
2. Deploy `solve` and call it with the test problem (curl). Check the JSON shape: every step has `explanation` + `math`, plus `answerLatex` is present.
3. `expo start --web`: visual check of a live solve, an old saved problem (fallback path), flashcards, and a broken-LaTeX string rendering as raw text.
4. New dev build → on-phone check: dark theme colours, sizing, horizontal scroll on a long expression, first-render delay.

## Open Questions
1. Is **mathjax-full + react-native-svg** approved, given the dev rebuild it requires?
2. OK to keep **`answer` as plain text and add `answerLatex`** for the Answer box?
3. For the test problem, should `÷ 2(…)` default to the **textbook reading (2a − 3)**?
4. Should Premium **worked examples** be included in this pass, or only solve and the card backs?
