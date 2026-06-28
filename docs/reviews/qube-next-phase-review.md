# Qube — Next Phase Review
**Completed:** 2026-06-04  
**Parts:** 1 (Audit), 2 (Navigation Stack), 3 (Complete Screens), 4 (Supabase + Proxy Plan)

---

## What Changed

### Part 1 — Audit

Produced a full inventory of the app at the start of this phase. Key findings documented in `docs/plans/qube-next-phase-audit.md`:

- `@react-navigation/*` was not installed — tab presses updated visual state only
- `HomeScreen.js` had a crash bug (`firstName` referenced but never declared)
- `AuthContext.js` + `LoginScreen.js` were complete but not mounted anywhere
- 4 of 5 tab screens (Solve, Practice, Saved, Profile) had no React Native implementations
- All working features lived exclusively in `preview.html`

---

### Part 2 — Navigation Stack

**Installed:**
- `@react-navigation/native` ^7.2.5
- `@react-navigation/bottom-tabs` ^7.16.2

**Created:**
- `src/navigation/AppNavigator.js` — `createBottomTabNavigator` with custom `BottomNav` as the tab bar; 5 routes: `home`, `saved`, `scan`, `practice`, `profile`

**Updated:**

| File | Change |
|---|---|
| `App.js` | Replaced `<HomeScreen />` with `AuthProvider` → `NavigationContainer` (dark theme) → `AppNavigator` |
| `src/components/BottomNav.js` | Dual-mode: accepts React Navigation `state`/`navigation` tabBar props OR legacy `activeTab`/`onTabPress`; removed unused `Platform` import |
| `src/screens/HomeScreen.js` | Removed self-managed `activeTab` state + `BottomNav` render; accepts `navigation` prop; ScanCard + all 3 feature cards + "See all →" wired to navigate correct routes; `firstName` crash bug fixed; removed unused `Dimensions`/`useState` imports |

**Bugs fixed:**

| Bug | Fix |
|---|---|
| Tapping any tab did nothing (only visual highlight changed) | Replaced `setActiveTab` with `navigation.navigate()` via React Navigation |
| `firstName` ReferenceError crash | Replaced with static `'Welcome to Qube'` string |
| `Platform` unused import in `BottomNav` | Removed |
| `Dimensions`/`useState` unused imports in `HomeScreen` | Removed |

---

### Part 3 — Complete Screens

**Installed:**
- `expo-image-picker ~17.0.11`

**Created:**

| File | What it contains |
|---|---|
| `src/services/solveApi.js` | `solveMathProblem({ text, imageBase64, imageMimeType })` — direct OpenAI GPT-4o call with 20s AbortController timeout + 1 automatic retry; reads key from `EXPO_PUBLIC_OPENAI_API_KEY` |
| `src/data/practiceData.js` | `PRACTICE_DATA` (30 flashcards + 15 problems, 5 categories); `getCards(category)` + `getProblems(category)` helpers |
| `src/screens/SolveScreen.js` | Full solve screen — Camera / Upload / Type input modes; image picker with permissions; auto-solves on image pick; renders all 8 solver fields; "Try This Next" loop; saves to AsyncStorage |
| `src/screens/PracticeScreen.js` | Category pills (All/Algebra/Geometry/Trig/Calculus/Stats); flashcard deck (tap-to-flip with fade animation, ← → nav, position counter); practice problems with animated reveal |
| `src/screens/SavedScreen.js` | `useFocusEffect` reload on tab focus; expandable saved-problem cards with full steps; individual delete + clear all; AsyncStorage-backed |
| `src/screens/ProfileScreen.js` | Avatar, live saved count, app stats grid (4 tiles), clear-saves action, info menu rows |

**Updated:**
- `app.json` — Added iOS `infoPlist` camera + photo permissions; added `expo-image-picker` plugin with permission strings for Android

---

### Part 4 — Supabase + OpenAI Server Plan

Documents only — no code written.

**Created:**
- `docs/plans/supabase-openai-server-plan.md` — full implementation plan including:
  - Decision to replace Firebase Auth with Supabase Auth
  - `saved_problems` + `practice_progress` table schemas with RLS policies
  - Complete `solve` Edge Function code (Deno/TypeScript) that holds the OpenAI key server-side
  - Client changes: `src/lib/supabase.js`, updated `solveApi.js` (proxy via Edge Function), `AuthContext.js` rewrite
  - Auth gate wiring in `App.js`
  - Files to remove (Firebase SDK, `courses_data.js`)
  - Environment variable plan (`EXPO_PUBLIC_SUPABASE_*` client-safe, `OPENAI_API_KEY` Supabase secret)
  - 10-step implementation order + full testing strategy

---

## Files Created This Phase

| File | Purpose |
|---|---|
| `src/navigation/AppNavigator.js` | Bottom tab navigator |
| `src/services/solveApi.js` | OpenAI API service |
| `src/data/practiceData.js` | Practice flashcards + problems data |
| `src/screens/SolveScreen.js` | Solve/scan tab screen |
| `src/screens/PracticeScreen.js` | Practice tab screen |
| `src/screens/SavedScreen.js` | Saved problems tab screen |
| `src/screens/ProfileScreen.js` | Profile tab screen |
| `docs/plans/qube-next-phase-audit.md` | Part 1 audit findings |
| `docs/plans/supabase-openai-server-plan.md` | Part 4 server plan |
| `docs/reviews/qube-next-phase-review.md` | This file |

## Files Modified This Phase

| File | What changed |
|---|---|
| `App.js` | AuthProvider + NavigationContainer + AppNavigator |
| `src/components/BottomNav.js` | React Navigation tabBar prop support |
| `src/screens/HomeScreen.js` | Navigation wiring, firstName fix, import cleanup |
| `app.json` | Camera/photo permissions, expo-image-picker plugin |
| `package.json` | Added `@react-navigation/native`, `@react-navigation/bottom-tabs`, `expo-image-picker` |

---

## How to Test

1. Open `http://192.168.1.177:3000/preview.html` — confirm browser prototype still works
2. Run `npm start` → scan QR with Expo Go — confirm app loads without crashing
3. **Home tab** — confirm ScanCard tap navigates to Scan tab; feature card taps navigate correctly
4. **Scan tab** — Type `2x + 5 = 13`, tap Solve → verify 8-field solution renders
5. **Scan tab** — Upload mode → pick an image → verify auto-solve fires
6. **Scan tab** — Solve a problem, tap "Save" → confirm "Saved!" state
7. **Saved tab** — confirm saved problem appears; tap to expand steps; delete it
8. **Practice tab** — tap each category pill; tap a flashcard to flip; tap prev/next; tap "Show Answer" on a problem
9. **Profile tab** — confirm saved count matches Saved tab; tap "Clear Saved Problems"
10. **Bottom nav** — tap all 5 tabs; confirm active highlight follows correctly

---

## Known Issues

| Issue | Severity | Notes |
|---|---|---|
| OpenAI key in `EXPO_PUBLIC_OPENAI_API_KEY` | High | Client-visible in any Expo bundle. Fix: implement the Edge Function from Part 4 plan before any public release. |
| `courses_data.js` (137 KB) still loaded in `preview.html` `<head>` | Low | Unused. Safe to remove the `<script>` tag at any time. |
| `AuthContext.js` + `LoginScreen.js` are not mounted | Medium | Auth exists but never shows. Fix: implement auth gate from Part 4 plan (LoginScreen vs AppNavigator). |
| Camera mode requires EAS dev build | Medium | `expo-image-picker` launchCameraAsync works in EAS dev build; limited in Expo Go. |
| `SolveScreen` camera permission denied has no retry path | Low | Shows Alert. User must go to device Settings to re-enable. |
| Firebase SDK still in `package.json` | Low | Unused by active code (no Firebase env vars set). Remove when Supabase auth is implemented. |

---

## Next Recommended Steps

1. **Implement Supabase + Edge Function proxy** — follow `docs/plans/supabase-openai-server-plan.md` exactly. This is the most important next step as it removes the client-exposed API key.

2. **Auth gate** — wire `LoginScreen` vs `AppNavigator` based on Supabase session state. `LoginScreen.js` UI is complete; only handler logic needs updating.

3. **EAS dev build** — required to test Google + Apple Sign-In and camera on a real device. Run `eas build --profile development --platform ios` after adding Supabase credentials.

4. **Migrate saves** — after Supabase is live, migrate `AsyncStorage` saves to `saved_problems` table (one-time migration on first sign-in).

5. **Practice expansion** — add more cards/problems per category; consider pulling from a Supabase table for dynamic content.
