# Known Issues

> Log bugs, limitations, and workarounds here. Teammates: check this before starting work.

---

## Active Issues

| ID | Issue | File | Severity | Status | Notes |
|---|---|---|---|---|---|
| — | No issues logged yet | — | — | — | — |

---

## Resolved Issues

| ID | Issue | Resolution | Date |
|---|---|---|---|
| — | — | — | — |

---

## Limitations / Constraints

- **No TypeScript yet** — files are currently `.js`. Migration is planned but not started.
- **No navigation stack** — `App.js` renders `HomeScreen` directly. All screens need a navigator before they can be wired up.
- **No Supabase** — backend not connected. All data is placeholder/static.
- **Expo Go compatibility** — some native modules (e.g. `expo-apple-authentication`) require a dev build, not Expo Go. Flag this in plans.
- **Split-pane agent teams not supported on Windows Terminal** — use in-process mode (`--teammate-mode in-process`)
