# Recent solves + Home cleanup — completion summary

**Date:** 2026-09-23 · **Plan:** `docs/plans/recent-solves.md` · **Tracked as:** KI-R28 (done), KI-12 and KI-13 (open)

## What was built
- **Home → Recent** lists the last 5 solves, newest first. Each row shows an
  icon for how it was solved (camera, upload or typed), the problem, the
  answer, and how long ago. Tapping a row opens a full-screen replay with
  everything Solve showed: problem, type, difficulty, method, every step,
  answer, common mistake, formula, and "Try this next".
- **Stat pills** now read "30+ Flashcards / 15 Practice Sets / AI-Powered".
- **"Practice Quizzes" card** removed from Home and added to `docs/backlog.md`.

## Files
- **Created:** `src/lib/recentSolves.js`, `src/components/SolutionView.js`,
  `src/components/RecentSolveModal.js`, `docs/backlog.md`,
  `docs/plans/recent-solves.md`
- **Modified:** `src/screens/HomeScreen.js`, `src/screens/SolveScreen.js`
  (net −120 lines; the markup moved into `SolutionView`),
  `src/context/AuthContext.js` (shared; logged), `src/data/legalContent.js`,
  `supabase/functions/solve/index.js`

## Decisions
- **On-device and text-only.** Recent works for guests, adds nothing to the
  server, and never keeps photos. It's cleared on sign-out.
- **One renderer.** `SolutionView` is used by both Solve and the Recent
  replay, so "everything the app told them" can't fall out of sync with what
  Solve actually shows.
- **Typed text beats the AI transcription** for the title. That's what the
  user actually wrote.
- **The Recent replay has no "Solve This →" or Save.** Both went to the
  backlog to keep this change small. The "Try this next" question still shows.
- **I left Saved's title format ("Answer: …") alone** on purpose. Using the new
  `problem` field there would put more problem text into the database, which
  the privacy policy has to cover first (KI-13).

## Critic review / risks
- **KI-12:** the prompt change isn't deployed (blocked as a production
  action). Until it is, photo solves are titled by problem type.
- **KI-13:** the hosted privacy policy is now behind the in-app copy. While
  writing this I found a gap that predates it: the policy said problem text is
  never stored, but Saved problems and custom flashcards always were. The
  in-app copy is fixed; the hosted policy must be updated before submission.
- The stats label reads "Practice **Sets**", as requested, but the 15 are
  individual problems spread across 5 topic sets. "15 Practice Problems"
  would be more literal if App Review ever questions it.
- Five entries is a hard cap. Older solves drop off silently. That's fine
  for "recent"; Saved is the long-term store.

## Verification
All changed files compile, no Solve styles went missing in the extraction,
and a full `expo export --platform ios` bundle succeeds. **Not yet on device.**
Checklist for the next device session:
1. Solve one typed, one camera and one upload problem. Home → Recent should
   show all three, newest first, each with the right icon.
2. Tap each one. The replay should match what Solve showed, and the close
   button should clear the notch.
3. Solve a 6th problem. Only 5 should remain.
4. Sign out. Recent should be empty.
5. On a small iPhone (SE-size), the stat pills should fit on one line.
