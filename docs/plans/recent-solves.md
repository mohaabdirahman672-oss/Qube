# Recent solves on Home (plus Home stats/feature-card cleanup)

**Requested:** 2026-09-23 by the lead. The request itself set the scope, so it
counts as approval.

## Feature
1. Home's "Recent" section lists the problems the user just solved. Tapping
   one opens the **full solution exactly as Solve showed it**: problem type,
   difficulty, method summary, every step, answer, common mistake, key
   formula, and the "Try this next" question.
2. The stat pills become true claims: **30+ Flashcards / 15 Practice Sets / AI-Powered**.
3. The "Practice Quizzes — adaptive difficulty" feature card comes off Home and
   goes into a new `docs/backlog.md`, next to graphing and the other
   post-launch items.

## Design
- **Storage: on-device only (AsyncStorage), text only.** Recent must work for
  guests, who have no Supabase row. Photos are **not** stored, only the
  text the app returned. This key is separate from Saved: Saved is deliberate,
  synced and account-bound; Recent is automatic, local, and capped at the last 5.
- **Problem text for photo solves.** The `solve` function returns no
  statement of the problem today, so a scanned problem would have no title.
  Add `"problem"` (a plain-text transcription) to the AI's reply format. This
  is additive; older clients ignore it. The client falls back to `problemType`
  when it's missing (for example, entries from before the deploy). Typed solves
  use the typed text.
- **Shared rendering.** Pull Solve's solution markup into
  `src/components/SolutionView.js` so Solve and the Recent detail can't drift
  apart. The locked Similar Questions and Graph previews and the Save/New
  Problem actions stay in `SolveScreen.js`. They are Solve-screen actions, not
  things "the app told them".
- **Shared device privacy:** clear Recent on sign-out.
- **Detail modal** uses the `useSafeAreaInsets()` pattern from KI-R25, not
  `SafeAreaView` inside `<Modal>`.

## Files to Create
- `src/lib/recentSolves.js`: get, add and clear, capped at 5, try/catch-safe.
- `src/components/SolutionView.js`: the extracted solution renderer.
- `src/components/RecentSolveModal.js`: the full-screen detail view.
- `docs/backlog.md`

## Files to Edit
- `src/screens/SolveScreen.js`: use SolutionView; record each successful
  solve; use `problem` as the Saved title when present.
- `src/screens/HomeScreen.js`: stats, drop the quiz card, a live Recent list.
- `src/context/AuthContext.js`: clear Recent on sign-out (shared file, logged in
  `docs/shared-changes.md`).
- `supabase/functions/solve/index.js`: add `problem` to the prompt schema.
- `src/data/legalContent.js`: the privacy policy's Retention section says
  problem text is "not retained". Add that recent solutions stay **on the
  device only** and are cleared on sign-out.

## Dependencies
None new. `@react-native-async-storage/async-storage` is already used by Home.

## Risks
- **The privacy policy wording has to change.** The in-app copy gets updated
  here. The hosted policy (the canonical App Store Connect URL) needs the same
  edit, and that is flagged for the lead. The App Privacy label doesn't change,
  because on-device-only data isn't "collected" under Apple's definition.
- Changing the prompt adds a few output tokens per solve. That's negligible.

## Edge Cases
- Corrupt or missing storage: treated as an empty list, never a crash.
- A solve that returns `hasMath: false` is not recorded; only real solutions are.
- Home stays mounted as a tab, so it reloads on focus to pick up a solve
  that just happened.
- An old entry with no `problem` falls back to the problem type, then "Solved problem".

## Testing Strategy
Compile and bundle checks here. On device: solve by typing, camera and upload,
then check Home → Recent shows each one newest-first. The detail should match
what Solve showed. After a 6th solve, only 5 should remain. After sign-out,
the list should be empty.

## Open Questions
None blocking. See Risks for the hosted-policy update.
