# Backlog: post-launch features

> Deliberately out of scope for v1.0. Items here are **not** shown in the app
> as if they exist. Stubbed ones appear only as clearly locked "coming soon"
> previews. Move an item into `docs/plans/` when it's picked up.

| Feature | Current state in app | Notes | Added |
|---|---|---|---|
| **Graphing** | Locked preview on Solve results ("coming in v1.2") | Deferred post-launch (agent-memory decision 2026-09-21) | 2026-09-21 |
| **Similar-question generation** | Locked preview on Solve results ("coming soon") | Same decision; no prompt or UI exists yet | 2026-09-21 |
| **Homework-set generation** | Locked preview on Practice ("coming soon") | Same decision | 2026-09-21 |
| **Practice quizzes with adaptive difficulty** | Not shown. Home's "Practice Quizzes" feature card was removed 2026-09-23 because it described a feature that doesn't exist and opened the same Practice tab as the card above it | Needs its own design: question source (static bank vs. AI), what "adaptive" means (difficulty stepping on right/wrong streaks?), scoring and history, and whether it's Premium | 2026-09-23 |
| **"Solve This →" from a Recent solve** | Recent's detail view shows the "Try this next" question without the button | Would need Solve to accept a prefill route param. Should prefill only, never auto-solve, because solving costs a free solve | 2026-09-23 |
| **Save from a Recent solve** | Not available; Save exists only on the live Solve result | Small, but needs the Save flow pulled out of `SolveScreen.js` | 2026-09-23 |
