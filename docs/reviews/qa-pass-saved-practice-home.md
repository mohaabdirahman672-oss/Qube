# QA pass (#12) — Saved, Practice, Home (code-level)

**Date:** 2026-09-23 · **Tracked as:** KI-R27 in `docs/known-issues.md`

Continuation of the manual functional pass (#12). Profile was covered earlier
today (KI-R25). This pass read Saved, Practice, and Home looking for
behavior bugs a tap-through would hit. It was done by reading the code, not on
the device, so the device pass below is still required.

## What was built / fixed

| Screen | Bug | Fix |
|---|---|---|
| Saved | Load failure showed "Nothing saved yet". `fetchSavedProblems()` resolves `{ data: [], error }` and never throws, so the old `.catch()` never ran | Read `error` off the result; new "Couldn't load" state with Retry |
| Saved | Clear All emptied the list even when the server delete failed | Restore the previous list and show an alert |
| Saved | Single delete failure reverted silently | Alert, then reload |
| Saved | "Nothing saved yet" flashed for one frame on first open | `loading` initializes to `!!session` |
| Practice | Switching category showed the new card already flipped, with the **previous card's** AI worked example | `Flashcard` keyed by category + index + card identity, so it remounts fresh |
| Practice | "Show Answer" state leaked across categories | `ProblemCard` keyed by category + index |
| Practice | Failed custom-card insert did nothing visible | Alert |
| Practice | Custom-card delete had no confirm and no failure handling | Confirm dialog; roll back and alert on failure |
| Home | Notification bell did nothing on tap and always showed an unread dot | Removed (no notifications feature exists) |

## Files modified
- `src/screens/SavedScreen.js`
- `src/screens/PracticeScreen.js`
- `src/screens/HomeScreen.js`

## Decisions
- **Remount by key instead of a reset effect** for flashcards. A reset effect
  has to list every trigger (index, category, deletion) and still races with
  in-flight worked-example fetches. A key covers all of those cases.
- **Error copy is generic** ("Check your connection and try again") and
  matches the rest of the app. It doesn't surface raw Supabase errors.
- **Removed the bell instead of making it work.** Notifications aren't in
  launch scope, and a fake unread badge is worse than no bell.

## Verification
- All three files compile with `babel-preset-expo`.
- A full `npx expo export --platform ios` bundle succeeds.
- **Not verified on device.** On the next device session, check:
  1. Saved in airplane mode: the "Couldn't load" state appears and Retry works once you're back online.
  2. Practice: flip a card, switch category. The new card should be unflipped.
  3. Practice (Premium): flip a card, go to the next card, flip it. The worked example should match the new card.
  4. Add a custom card, then delete it. The confirm dialog should appear and the card should be gone after relaunch.
  5. Home: the header shows the logo and BETA tag only.

## Flagged for a product decision (not changed)
These are copy/scope calls, not bugs:
1. **Home stat pills** ("500+ Topics", "10K Problems", "98% Accuracy"). The
   app ships about 30 flashcards and 15 practice problems, and nothing
   measures accuracy. App Review guideline 2.3 (accurate metadata) makes
   unbacked claims like these a rejection risk. They also show up in any
   screenshot of Home. Recommend removing them or replacing them with true
   numbers.
2. **"Practice Quizzes — adaptive difficulty quizzes"** feature card. No quiz
   feature exists; the card opens the same Practice tab as the card above it.
   Recommend removing it or renaming it to describe what's actually there.
3. **"Recent" section** always shows the static "No recent activity yet", even
   for users with saved problems. It could show the last few saved problems,
   or be hidden until there's real data.

## Still to do in #12
- Solve/Scan screen and every auth flow end to end, per the checklist.
- The device checks above.
