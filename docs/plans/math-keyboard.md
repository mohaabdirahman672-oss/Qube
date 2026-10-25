# Plan: Math keyboard on Solve

> Status: **awaiting approval**. Written 2026-10-25. Checklist item G2 (`docs/plans/pre-launch-checklist.md`).
> Reference: the Symbolab keypad screenshots the owner shared on 2026-10-25, used for layout and key behaviour only. Colours are Qube's.

## Feature
Solve's "type a problem" field becomes a **math input** with a **custom tabbed keypad** in place of the iOS keyboard:
- **Tabs:**
  - **History:** recent typed problems; tap one to reuse it.
  - **123:** 0–9, `.`, `+ − × ÷ =`, `x`, `( )`, `x²`, `xⁿ`, `√`, fraction.
  - **Functions:** `sin cos tan`, `sec csc cot`, `log`, `ln`, `eˣ`, `π`, `θ`, `|x|`, `ⁿ√`, `f(x)`.
  - **Calculus:** `∫`, definite `∫`, `d/dx`, `lim`, `Σ`, `∞`.
  - **Symbols:** `< > ≤ ≥ ≠`, `%`, `!`, `,`, `[ ]`, `{ }`, `x y z`.
- **Persistent bottom row:** **ABC** (switches to the iOS keyboard for word problems), **← →**, **⌫**, **Solve**.
- **Templates with empty slots:** fraction, exponent, roots, integrals, limits, Σ, `d/dx`. The arrow keys move between slots.
- **Long-press alternates**, e.g. `sin` → `cos tan sin⁻¹`.

## Recommended approach
**A MathLive math field inside a WebView, driven by our own native React Native keypad.** This is the approach you suggested, and I agree with it.

| Option | Verdict |
|---|---|
| **MathLive in a WebView + native RN keypad** ✅ | MathLive (MIT, v0.111.1) is a complete math editor: cursor, slot navigation, deletion inside structures, tap-to-place-cursor, and LaTeX output. We only send it commands (`insert('\\frac{#@}{#?}')`, `moveToNextChar`, `deleteBackward`). The keypad is native, so it looks and feels like Qube, with long-press, haptics and safe-area handling. Its input element already uses `inputmode=none`, so the iOS keyboard shouldn't appear. Session 1 verifies this first. |
| Native editor on our MathJax renderer | We'd have to write a structured math editor: cursor model, slot navigation, deletion rules, tap hit-testing. That's weeks of work, not about 6 hours. |
| MathLive's own virtual keyboard | It works, but it's web-styled and harder to make match the Symbolab-like layout and Qube's look. Native keys also feel better. |

### How it fits together
```
SolveScreen
 ├─ MathInput  (WebView: offline HTML with MathLive inlined, dark-themed, transparent)
 │    ⇅ postMessage bridge: keypad → {cmd} ; field → {latex, empty, selectionInfo}
 └─ MathKeypad (native: tab bar · key grid · bottom row · long-press popover)
```
- **Offline.** MathLive's script (844 KB) and its fonts (304 KB, as base64) are inlined into one generated HTML module. There's no CDN dependency, so it works on bad Wi-Fi and passes App Review. Session 1 decides between a `postinstall`-generated module and a checked-in asset.
- **What Solve sends.** The field's **LaTeX**, which gpt-4o reads well. Titles and lists already clean it via `toPlainMath`.
- **Ambiguity check on the server.** `AMBIGUOUS_DIVISION` in `solve` is extended to catch the LaTeX form (`\div 2\left(`, `\div 2(`, `\div 2x`).
- **History.** On-device, typed problems only, stored as LaTeX so they reload into the field as editable math. They're shown typeset with our existing `MathView`.
- **ABC.** Swaps the keypad for the iOS keyboard:
  - **Plan A:** MathLive text mode, so one field holds words and math together (e.g. "Solve for x: ½x = 3").
  - **Plan B**, if text mode fights the iOS keyboard: switch to the existing plain `TextInput` for word problems.

  Session 5 decides between them.
- **Theme.** Navy keys (`surface`/`surfaceHigh`), white digits, **orange** operators (`goldDark`), and a **gold** active-tab underline and Solve key. The field gets a transparent background, a gold caret and slots, and a blue selection.

## Files to Create
- `src/components/mathKeyboard/MathInput.js`: the WebView field and bridge. API: `ref.insert()`, `ref.command()`, `ref.setValue()`, plus an `onChange(latex)` callback.
- `src/components/mathKeyboard/MathKeypad.js`: tabs, grid, bottom row, long-press popover.
- `src/components/mathKeyboard/keys.js`: data only, i.e. every key's label, the LaTeX or command it sends, and its alternates. Adding a key is a one-line change.
- `src/components/mathKeyboard/mathfieldHtml.js` (generated, or built by `scripts/build-mathfield-html.js`).
- `src/lib/typedHistory.js`: the last 20 typed problems (LaTeX), on-device, cleared on sign-out like Recent.
- `docs/reviews/math-keyboard.md`.

## Files to Edit
- `src/screens/SolveScreen.js`: Type mode uses `MathInput` + `MathKeypad`, and Solve sends LaTeX.
- `supabase/functions/solve/index.js`: the LaTeX form of the ambiguity regex (deploy needed).
- `src/context/AuthContext.js`: also clear typed history on sign-out (shared file; logged in `shared-changes.md`).
- `package.json`: `react-native-webview@13.13.5` (SDK 53 pin) and `mathlive@0.111.1`.

## Dependencies
- `react-native-webview@13.13.5`: **native**, Expo SDK 53 pinned. **Needs a new dev build** (Session 1) and is included in the next production build. Its import is guarded like `react-native-svg`, so older builds fall back to the plain `TextInput`.
- `mathlive@0.111.1`: pure JS, inlined into the WebView HTML. Adds about 1.2 MB to the bundle.

## Risks
- **The iOS keyboard pops up anyway** if WKWebView ignores `inputmode=none`. This is checked first, in Session 1, in Safari on your phone. Fallbacks: the WebView's `keyboardDisplayRequiresUserAction` and `hideKeyboardAccessoryView` props, or blurring the input and keeping MathLive's own caret.
- **WebView start-up** (about 0.3–0.5 s). Mitigation: mount the field when Solve mounts, not when it's tapped, and show a lightweight placeholder until it's ready, at the same height so nothing jumps.
- **Bridge latency** on fast typing. Commands are tiny one-way messages, and MathLive does the editing locally in the WebView. Test by typing fast.
- **ABC text mode** (Plan A) may behave oddly with autocorrect or predictive text. Plan B is safe.
- **New native module.** One more dev build now, and the production build must come after this is merged (checklist H).

## Edge Cases
- Empty field and Solve: the existing "type a problem first" message.
- Very long expressions: the field scrolls horizontally, and the caret stays visible.
- Backspace into a template: MathLive removes the slot or structure correctly (built in).
- Rotating, or the app going to the background with the keypad open: the keypad stays, and the field keeps its value.
- "Try this next": the practice question is plain Unicode text and goes into the field as math via conversion. Check that `x²` arrives as `x^2`.
- A History item from before the keyboard existed (plain text): insert it as-is and let MathLive parse it.
- VoiceOver: keys get accessibility labels ("x squared", "fraction").
- Guests and the weekly limit: unchanged, because the keypad only changes the input.

## Session plan (~1 hour each, each ends with something testable)

| # | Session | You can test | Build to start | Checklist item while it runs |
|---|---|---|---|---|
| **1** | **Prove the core.** Install `react-native-webview` + MathLive. Build the offline dark-themed math-field page. Check that templates, slots and arrows work and the iOS keyboard stays hidden, served on your Wi-Fi. Add the guarded `MathInput` component. | Open the test page in **Safari on your phone**: type with the on-screen test buttons, insert a fraction, move between slots, confirm no iOS keyboard. | **Dev build** (adds the WebView) | **Restore/check Supabase** (H), then **A3** reviewer account |
| **2** | **Field in Solve + 123 tab.** `MathInput` replaces the type box, plus the bridge, the bottom row (← → ⌫ Solve) and the full 123 tab. Solve sends LaTeX; deploy the `solve` regex update. | On the new dev build: type and solve `4(a^10 ÷ a^4) ÷ 2(a^3 × a^2) − 3a^0` using only the keypad. | none (JS over Metro) | **C1** create both subscriptions |
| **3** | **Templates + Functions tab.** Fraction, `x²`, `xⁿ`, `√`, `ⁿ√`, `|x|`, `eˣ`, `f(x)` with slots; the Functions tab; slot-aware arrows. | Build `√(x²+1)/2`, `log₂ 8`, `sin²θ` from the keypad. | none | **C2** In-App Purchase key |
| **4** | **Calculus + Symbols tabs + long-press.** ∫, definite ∫, d/dx, lim, Σ, ∞; the Symbols tab; the long-press popover with alternates and haptics. | Solve `∫₀¹ x² dx` and `lim x→0 sin x / x`; long-press `sin`, `(`, `x²`. | none | **C3** RevenueCat setup (send me the `appl_` key) |
| **5** | **History + ABC.** The History tab (typeset, tap to reuse), typed history on-device and cleared on sign-out, ABC mode (Plan A, else B). | Solve a word problem with ABC; reuse a History item. | none | **E3** forms (App Privacy, Age Rating) |
| **6** | **Polish + launch prep.** Safe areas and small phones, VoiceOver labels, fast-typing check, the critic review and docs. Also Part H's code items: **remove BETA** and **swap the "Q" placeholder for the cube logo**. Commit. | Full D1-style pass on Solve. | **Production build** (D2), since all native changes are in | **D3** internal TestFlight, then **E1** screenshots on that build (they now show the final keyboard and logo) |

About 6 hours over about 6 working days, so you'll finish around early November with plenty of slack before the Dec 15 submit date. A1 (Apple's entity fix) is the item to watch, not the code.

## Testing Strategy
- **Session 1:** the standalone page in phone Safari (keyboard suppression, slots, theme) before any native work depends on it.
- **Each session:** the "You can test" column on the dev build over Metro, plus `expo export --platform ios` to confirm the bundle builds.
- **Live `solve`** with LaTeX input, for the test expression, an integral, a limit and a word problem via ABC.
- **Session 6:** a full manual pass, a fast-typing check, small-screen layout (iPhone SE size), and VoiceOver on a few keys.

## Open Questions
1. Approve **MathLive in a WebView + native keypad**, including one more dev build in Session 1?
2. **ABC:** is mixed words + math in one field (Plan A) worth trying first, or go straight to the simpler plain text box for word problems (Plan B)?
3. **History:** only problems typed on this phone (on-device, like Recent), or should it sync for signed-in users? I recommend on-device for launch.
4. **Photo modes** (Scan/Upload) are unchanged. Should the keypad also be used to **edit a scanned problem** before solving? I'd leave that until after launch.
