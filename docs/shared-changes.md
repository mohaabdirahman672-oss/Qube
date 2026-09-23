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
| `src/context/AuthContext.js` | Recent solves (lead request, `docs/plans/recent-solves.md`) | `signOut()` also calls `clearRecentSolves()` so on-device solution history doesn't carry over to the next user of a shared device | 2026-09-23 |

---

## Rules

1. If you need to edit a file owned by another teammate, add a row to **Pending Approvals** first
2. Tag the lead with the request — do not proceed until status is **Approved**
3. Once complete, move the row to **Approved Changes** with the date
4. Common shared files: `App.js` / `App.tsx`, `src/theme.js`, `package.json`, `CLAUDE.md`
