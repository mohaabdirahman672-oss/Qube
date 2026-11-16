# Shared Changes

> Files that multiple teammates need to modify must be documented here BEFORE any edits are made.
> Format: submit your proposed change, wait for lead approval, then proceed.

---

## Pending Approvals

| File | Requested By | Change Description | Status |
|---|---|---|---|
| — | — | — | — |

---

## Approved Changes

| File | Approved For | Change Description | Date |
|---|---|---|---|
| `package.json` | Solve quality (owner approved, `docs/plans/solve-quality.md`) | devDependency `mathjs@15.2.0` (exact pin) so tests and the eval resolve the verifier's import. Not imported by the app, so no bundle change | 2026-11-15 |
| `src/components/SolutionView.js`, `src/screens/SolveScreen.js`, `src/services/solveApi.js` | Solve quality (owner approved) | "Couldn't finish" card for `status: partial`, a "check it yourself" note for `verified: false`, partial save title "Unfinished: …", client timeout 45 → 90 s | 2026-11-15 |
| `package.json` | Math keyboard (owner approved, `docs/plans/math-keyboard.md`) | Adds `react-native-webview@13.13.5` and `expo-haptics@~14.1.4` (both native: need a new dev build), plus `mathlive@0.111.1` as a devDependency (only used by `scripts/build-mathfield-html.js`) | 2026-11-14 |
| `src/context/AuthContext.js` | Math keyboard (owner approved) | `signOut()` and `deleteAccount()` also call `clearTypedHistory()` (the keypad's on-device History tab), same reason as Recent | 2026-11-14 |
| `src/components/BottomNav.js` | Math keyboard (owner approved) | Hides itself when the focused screen sets the option `tabBarVisible: false` (Solve does while its keypad is open) | 2026-11-14 |
| `package.json` | LaTeX rendering (owner approved, `docs/plans/latex-math-rendering.md`) | Adds `react-native-svg@15.11.2` (native, needs a dev rebuild) and `mathjax-full@3.2.2` (exact pin) | 2026-10-25 |
| `supabase/functions/solve/index.js`, `supabase/functions/flashcard-example/index.js` | LaTeX rendering (owner approved) | New response shapes: steps `{ title, explanation, math }` + `answerLatex`; worked examples as `[{ explanation, math }]` under a `v2__` cache key. Both deployed | 2026-10-25 |
| `src/lib/recentSolves.js`, `src/data/practiceData.js` | LaTeX rendering (owner approved) | Recent entries keep `answerLatex`; the title is cleaned with `toPlainMath`. Built-in cards gain `backLatex`/`backNote` (`back` unchanged: it's the worked-example cache key) | 2026-10-25 |
| `src/context/AuthContext.js` | Account deletion (lead approved, `docs/plans/account-deletion.md`) | Adds `deleteAccount()`: Apple re-auth for an authorization code, calls the `delete-account` function, Google revoke, clears Recent, local sign-out. Exposed on the context. | 2026-09-29 |
| `app.json` | Launch splash (owner request, `docs/plans/launch-splash.md`) | `splash` block only: adds `image: ./assets/splash.png`, `resizeMode: contain`, background `#06091A` → `#060D18` to match the JS splash | 2026-09-26 |
| `src/context/AuthContext.js` | Recent solves (lead request, `docs/plans/recent-solves.md`) | `signOut()` also calls `clearRecentSolves()` so on-device solution history doesn't carry over to the next user of a shared device | 2026-09-23 |

---

## Rules

1. If you need to edit a file owned by another teammate, add a row to **Pending Approvals** first
2. Tag the lead with the request — do not proceed until status is **Approved**
3. Once complete, move the row to **Approved Changes** with the date
4. Common shared files: `App.js` / `App.tsx`, `src/theme.js`, `package.json`, `CLAUDE.md`
