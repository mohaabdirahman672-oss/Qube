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
