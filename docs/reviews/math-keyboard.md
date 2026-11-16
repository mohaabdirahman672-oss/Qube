# Review: Math keyboard (G2, sessions 1–6)

> Built 2026-11-14 against the approved plan `docs/plans/math-keyboard.md`. Tested in the real app on web (`expo start --web`) with headless Edge: **29/29 checks pass**, with zero paid API calls (every Supabase function call mocked, OpenAI blocked). **Not yet on a phone:** it needs a new dev build, because `react-native-webview` and `expo-haptics` are native modules.

## What was built
- **Math field.** MathLive 0.111.1 runs in a transparent WebView (iOS) or an iframe (web). It's fully offline: the script and the KaTeX fonts are inlined, with no CDN. The iOS keyboard never opens, because MathLive's input element is `inputmode=none`.
- **Keypad.** A native React Native keypad with five tabs:
  - **History:** typed problems, typeset, tap to reuse.
  - **123:** digits, `+ − × ÷ =`, x, y, `( )`, `x²`, `xⁿ`, `√`, fraction, `|x|`, π.
  - **f(x):** the trig functions and their inverses, ln, log, logₙ, eˣ, 10ˣ, ⁿ√, f(x), θ, e, !, °.
  - **∫ d/dx:** d/dx, d²/dx², prime, ∫, definite ∫, lim, lim→∞, Σ, ∞, →, dx, dt.
  - **≤ ≠:** comparisons, %, !, brackets, ±, angle and geometry symbols, variables.
- **Bottom row:** **ABC**, **←**, **→**, **⌫** and a gold **Solve**. The arrows and ⌫ repeat while held.
- **Templates with slots.** Fraction, powers, roots, |x|, functions, integrals, limits and Σ all insert with empty slots. ← and → move through slots, and ⌫ deletes inside structures. Solving with an empty slot shows "Fill in the empty boxes first, or delete them" and makes no request.
- **Long-press alternates.** For example `x²` → `x³ x⁻¹`, `√` → `∛ ⁿ√`, `sin` → `sin⁻¹ sinh`, and `<` → `≤`. A small dot marks keys that have alternates. Haptics are guarded, so a build without `expo-haptics` just stays silent.
- **History.** The last 20 typed problems are stored as LaTeX, on this phone only. They're cleared on sign-out and on account deletion.
- **ABC (Plan B).** Switches to the plain text box with the iOS keyboard, for word problems. **Math keypad** switches back. Plan A (words and math in one field) wasn't attempted, because it can only be judged on a real device. It would mean flipping MathLive's input element to `inputmode=text`, and can be tried on the dev build if wanted.
- **Scan correction (session 6).** Photo solves show a **"We read: …"** card with **Edit**. Edit loads the problem into Type mode: math goes into the keypad field (leading "Solve"/"Simplify" dropped), and word problems go into the text box. It prefers `problemLatex` once the server sends it.
- **"Try this next".** An expression goes into the math field as editable math, and a word problem goes into the text box.
- **Tab bar.** It hides while the keypad is open, the way the iOS keyboard covers it, and comes back on Solve or ↓.
- **Fallback.** On a build without the WebView module, Solve looks and works exactly as before (the plain text box).

## Files
**Created**
- `src/components/mathKeyboard/` → `MathInput.js` (WebView), `MathInput.web.js` (iframe), `useFieldBridge.js` (shared bridge: queue, readiness, height, restore after an iOS WebView crash), `MathKeypad.js`, `keys.js` (every key as data), `mathfieldHtml.js` (**generated**, 1.2 MB)
- `scripts/build-mathfield-html.js` (generates the page; re-run after upgrading mathlive)
- `src/lib/typedHistory.js`, `src/lib/mathFieldText.js`

**Modified**
- `src/screens/SolveScreen.js`: math/text input modes, keypad, empty-slot check, History, scan-correction card, "Try this next" routing
- `src/components/BottomNav.js`: honours the `tabBarVisible: false` screen option
- `src/context/AuthContext.js`: clears typed history on sign-out and deletion (logged in `shared-changes.md`)
- `package.json`: `react-native-webview@13.13.5`, `expo-haptics@~14.1.4`, and `mathlive@0.111.1` (dev only)

## Decisions
- **No server deploy needed.** Solve sends the field's LaTeX with `\div → ÷`, `\times → ×` and `\left( \right) → ( )`. The server's existing `AMBIGUOUS_DIVISION` check therefore still catches `÷ 2(…)` (unit-tested against the real regex). The plan's server regex change isn't needed.
- **The generated page is checked in.** EAS builds don't need a postinstall step. It's lazy-required, so it's evaluated when Solve first mounts, never at launch.
- **The page creates its `<math-field>` after configuring MathLive.** Otherwise it tries to fetch fonts and sounds from relative paths that don't exist. One harmless MathLive load-time console error is filtered.
- **The field stays mounted while Solve is open** (hidden when unused), so the WebView start-up cost is paid once.
- **The keypad opens only on a tap**, not on the field's automatic focus at load. Otherwise landing on Solve would hide the tab bar.
- **The arrows and ⌫ use `onPress` + `onLongPress`**, not `onPressIn`. `onPressIn` didn't fire reliably for clicks on web, which the test caught.

## Tests run
- **Browser E2E (29 checks):** keypad open and close; the tab bar hides and returns; fraction slots; the empty-slot block; ←/→/⌫ inside and out of a fraction; long-press alternates; every tab; what Solve sends; the solution renders and the keypad closes; History; ABC and back; ↓ dismiss; photo solve → "We read" → Edit → keypad; iPhone SE size (320×568) fits with no sideways scroll; no page errors.
- **Unit:** `latexForSolve`, `hasEmptySlot`, `plainToLatex` and `looksLikeWords`, against the server's real regex.
- **The iOS bundle builds:** `expo export --platform ios` gives Hermes, 11.8 MB.

## Critic review: weaknesses and risks
- **Not tested on a real iPhone.** The real risks are a WKWebView showing the iOS keyboard anyway, tap-to-place-cursor accuracy, and fast typing over the bridge. All three need the dev build.
- **Bundle size:** +1.2 MB of JS for the field page.
- **Re-solve free within 2 minutes (owner decision)** isn't enforced yet. Weekly charging happens on the server, so it needs a change to `solve` and a deploy (deferred until you approve one).
- **`problemLatex`** isn't sent by the server yet, so "We read" uses the plain-text restatement and converts it, which is good for most typed-looking math. This comes with G3/Q2.
- **The MathJax typeset key faces** log harmless `data-*` prop warnings on web only. That's existing `MathView` behaviour.
- **VoiceOver:** every key has a spoken label ("squared", "fraction", "definite integral"), but they haven't been checked with VoiceOver on a device.

## Still to do
1. **Dev build** (`eas build --profile development --platform ios`, free tier) → on-device pass: no iOS keyboard, tap to place the cursor, fast typing, long-press feel, VoiceOver.
2. Optionally, try ABC Plan A on that build.
3. Session 7 polish items in Part H (BETA badge, cube logo).
4. Free re-solve within 2 minutes plus `problemLatex`, with the next approved `solve` deploy.
