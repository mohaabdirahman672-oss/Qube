# Qube — Next Phase Audit
**Created:** 2026-06-04  
**Scope:** Full inventory of current app state — what works, what is incomplete, what files own each feature, active bugs, and what comes next

---

## 1. Project Layout

```
Qube/
├── App.js                          ← Entry point
├── preview.html                    ← Browser prototype (all features complete)
├── courses_data.js                 ← 137 KB course data (loaded but unused)
├── app.json                        ← Expo config
├── package.json                    ← Dependencies
├── .env                            ← EXPO_PUBLIC_OPENAI_API_KEY
│
└── src/
    ├── theme.js                    ← Design system (colors, spacing, radius, typography)
    ├── context/AuthContext.js      ← Firebase auth (Google + Apple), NOT mounted in App.js
    ├── hooks/useAuth.js            ← useContext wrapper for AuthContext
    ├── components/
    │   ├── BottomNav.js            ← 5-tab bottom nav (visual only — no screen routing)
    │   └── FloatingSymbols.js      ← Animated math symbols background
    ├── screens/
    │   ├── HomeScreen.js           ← Only complete app screen
    │   └── auth/LoginScreen.js     ← Login UI (built, NOT mounted anywhere)
    └── lib/
        ├── firebase.js             ← Firebase init with isFirebaseConfigured guard
        ├── googleSignIn.js         ← Web stub
        ├── googleSignIn.native.js  ← Native Google Sign-In
        ├── appleAuth.js            ← Non-iOS stub
        └── appleAuth.ios.js        ← iOS Apple Sign-In
```

---

## 2. What Is Fully Working

### preview.html (HTML Prototype)
The browser prototype is the complete reference implementation of all features. All 5 tabs are functional:

| Tab | Status | Key Features |
|---|---|---|
| Home | ✅ Complete | Feature cards, scan card, stats pills, links to Practice + Solve |
| Saved | ✅ Complete | localStorage persistence, view/delete saved problems |
| Scan/Solve | ✅ Complete | Camera / upload / type modes, OpenAI GPT-4o auto-solve, 8-field results |
| Practice | ✅ Complete | 5 category pills, 30 flashcards (tap-to-flip), 15 practice problems (tap-to-reveal) |
| Profile | ✅ Complete | Static profile layout |

**Solver engine (preview.html):**
- `OPENAI_KEY` hardcoded at top of file
- `callOpenAI(messages, attempt)` — AbortController 20s timeout + 1 automatic retry
- `solveProblem()` — builds messages, handles camera/upload/type, calls callOpenAI, parses JSON
- 8-field response schema: `hasMath`, `problemType`, `difficulty`, `steps[]`, `answer`, `explanation`, `commonMistake`, `formula`, `practiceQuestion`
- `renderSolution(result)` — renders all 8 fields in solution card
- `tryPracticeQuestion()` — loads practiceQuestion into type mode and auto-solves (learning loop)
- `PRACTICE_DATA` — 30 flashcards + 15 problems across Algebra/Geometry/Trig/Calculus/Statistics

### React Native (src/)

| File | Status | Notes |
|---|---|---|
| `src/theme.js` | ✅ Complete | Full design system — all screens use this |
| `src/components/FloatingSymbols.js` | ✅ Complete | 14 animated math symbols, loop + delay offsets |
| `src/components/BottomNav.js` | ✅ Complete (visually) | 5 tabs, gold scan button, press animation — but only updates `activeTab` state |
| `src/screens/HomeScreen.js` | ✅ Complete (layout) | Animated entrance, scan card, feature cards, stats, recent activity |
| `src/screens/auth/LoginScreen.js` | ✅ Complete (UI) | Google + Apple buttons, error handling, legal text — but NOT mounted |
| `src/context/AuthContext.js` | ✅ Complete | Full Google + Apple + Firebase auth, graceful no-firebase degradation |
| `src/hooks/useAuth.js` | ✅ Complete | Clean context hook |
| `src/lib/firebase.js` | ✅ Complete | isFirebaseConfigured guard — safe to run without Firebase env vars |
| `src/lib/googleSignIn.*` | ✅ Complete | Platform stubs (.js = web, .native.js = native) |
| `src/lib/appleAuth.*` | ✅ Complete | Platform stubs (.js = non-iOS, .ios.js = iOS) |

---

## 3. What Is Incomplete

### Critical — Navigation Stack (Blocks Everything)

**Problem:** `@react-navigation/native` and `@react-navigation/bottom-tabs` (or `expo-router`) are **not installed**. Only `react-native-screens` and `react-native-safe-area-context` exist (which are navigation peer deps), but there is no actual navigator.

**Current behavior:** `BottomNav.onTabPress` calls `setActiveTab(key)` in `HomeScreen`. This updates the visual highlight on the bottom bar only. **No other screen ever renders.** Tapping Saved, Scan, Practice, or Profile shows nothing.

**Required packages (none yet installed):**
```
@react-navigation/native
@react-navigation/bottom-tabs
```
Or alternatively: `expo-router` (file-based, Expo-native, recommended for new Expo projects)

### Missing React Native Screens

| Screen | Status | Prototype Equivalent |
|---|---|---|
| `SolveScreen` | ❌ Not built | `panel-scan` in preview.html |
| `PracticeScreen` | ❌ Not built | `panel-practice` in preview.html |
| `SavedScreen` | ❌ Not built | `panel-saved` in preview.html |
| `ProfileScreen` | ❌ Not built | `panel-profile` in preview.html |

### AuthProvider Not Mounted

`App.js` wraps only `HomeScreen` inside `SafeAreaProvider`. `AuthProvider` is defined in `AuthContext.js` and `LoginScreen` is built, but **neither is referenced in App.js**. The app always shows HomeScreen directly regardless of auth state.

```js
// App.js — current (no auth)
function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" translucent />
        <HomeScreen />           // ← always, no auth gate
      </View>
    </SafeAreaProvider>
  );
}
```

---

## 4. Active Bugs

| # | File | Line | Bug | Severity |
|---|---|---|---|---|
| 1 | `src/screens/HomeScreen.js` | ~65 | `firstName` referenced in greeting (`Welcome back, ${firstName}`) but never declared — will throw ReferenceError on render | High |
| 2 | `src/screens/HomeScreen.js` | ~412 | `BottomNav onTabPress={setActiveTab}` updates visual state only — no navigation actually happens for 4/5 tabs | High |
| 3 | `src/screens/HomeScreen.js` | FEATURE_CARDS | Feature cards (`ai`, `practice`, `quiz`) have no `onPress` handler wired to navigation — tapping does nothing | Medium |
| 4 | `src/screens/HomeScreen.js` | ~371 | ScanCard has no `onPress` wired to navigation — tapping does nothing | Medium |
| 5 | `src/screens/HomeScreen.js` | ~348 | "See all →" link has no `onPress` | Low |
| 6 | `preview.html` | head | `courses_data.js` (137 KB) loaded in `<head>` — unused by any active UI, costs parse time | Low |
| 7 | `preview.html` | OPENAI_KEY | OpenAI API key hardcoded in client-side HTML — security risk before any public deployment | High |
| 8 | `CLAUDE.md` | Stack table | CLAUDE.md lists TypeScript as the language, but all files are `.js` — mismatch in documentation | Low |

---

## 5. Dependency Status

### Installed (package.json)
```json
"react-native-screens": "~4.4.0"         ← navigation peer dep ✅
"react-native-safe-area-context": "~4.14.0"  ← navigation peer dep ✅
"expo-linear-gradient": "~15.0.8"        ✅
"expo-crypto": "~15.0.9"                 ✅ (used for Apple Sign In nonce)
"@react-native-google-signin/google-signin": "^16.1.2"  ✅
"@invertase/react-native-apple-authentication": "^2.5.1" ✅
"firebase": "^12.13.0"                   ✅
"@react-native-async-storage/async-storage": "2.2.0"    ✅
```

### Not Installed — Required for Navigation
```
@react-navigation/native          ← MISSING
@react-navigation/bottom-tabs     ← MISSING
```
Or alternatively:
```
expo-router                       ← MISSING (Expo Router v4 preferred for Expo SDK 54)
```

### Not Installed — Required for Solve Screen
```
expo-image-picker                 ← MISSING (camera + library access)
expo-camera                       ← MISSING (or replaced by image-picker)
```

### Not Installed — Required for Future Supabase
```
@supabase/supabase-js             ← MISSING (planned for later phase)
```

---

## 6. Feature Responsibility Map

| Feature | preview.html | React Native (src/) | Status |
|---|---|---|---|
| Design system / theme | CSS variables | `src/theme.js` | ✅ Both done |
| Animated background symbols | `.floating-symbols` CSS | `FloatingSymbols.js` | ✅ Both done |
| Bottom navigation | `switchTab()` JS | `BottomNav.js` | ⚠️ HTML works; RN visuals only |
| Home screen layout | `panel-home` | `HomeScreen.js` | ⚠️ HTML works; RN has `firstName` bug |
| Auth (Google + Apple) | Not in prototype | `AuthContext.js` + `LoginScreen.js` | ⚠️ Built, not mounted |
| Math solver / scan | `panel-scan` + `solveProblem()` | ❌ `SolveScreen` not built | HTML only |
| Practice tab | `panel-practice` + `PRACTICE_DATA` | ❌ `PracticeScreen` not built | HTML only |
| Saved problems | `panel-saved` + localStorage | ❌ `SavedScreen` not built | HTML only |
| Profile tab | `panel-profile` | ❌ `ProfileScreen` not built | HTML only |
| OpenAI integration | `callOpenAI()` in HTML | ❌ No `src/services/` yet | HTML only |
| Data persistence | localStorage | ❌ No AsyncStorage/Supabase yet | HTML only |

---

## 7. Architecture Decisions to Make Before Part 2

### Navigation: React Navigation vs Expo Router

| Option | Pros | Cons |
|---|---|---|
| `@react-navigation/bottom-tabs` | Mature, flexible, familiar | More boilerplate, manual setup |
| `expo-router` | File-based, URL-aware, Expo-native | Requires file restructure, newer |

**Recommendation:** `@react-navigation/native` + `@react-navigation/bottom-tabs`. It's the straightforward match for the existing TABS structure in BottomNav.js, requires minimal restructuring, and is compatible with Expo SDK 54 without issues.

---

## 8. What Part 2 Should Do

1. **Install** `@react-navigation/native` + `@react-navigation/bottom-tabs`
2. **Create** `src/navigation/AppNavigator.js` — bottom tab navigator wrapping all 5 screens
3. **Fix** `App.js` — wrap in `AuthProvider`, mount navigator (not HomeScreen directly)
4. **Fix** `firstName` bug in `HomeScreen.js` — remove or declare with default `null`
5. **Wire** ScanCard and feature card `onPress` to navigate to correct tabs
6. **Create** stub screens for `SolveScreen`, `PracticeScreen`, `SavedScreen`, `ProfileScreen` (placeholder "coming soon" content so navigation works end-to-end)

---

## 9. What Parts 3–4 Should Do

**Part 3 — Complete remaining screens (porting from preview.html)**
- `SolveScreen` — camera/upload/type input + OpenAI solver + results card (port solver logic from preview.html to `src/services/solveApi.js`)
- `PracticeScreen` — category pills, flashcard deck, practice problems (port `PRACTICE_DATA` to `src/data/practiceData.js`)
- `SavedScreen` — list of saved problems (AsyncStorage-backed)
- `ProfileScreen` — static layout

**Part 4 — Supabase + server-side OpenAI plan documents**
- Design Supabase schema (users, saved_problems, progress)
- Plan migration from localStorage → Supabase
- Plan OpenAI proxy (edge function to avoid key exposure)
- Create `docs/plans/supabase-openai-server-plan.md`

---

## 10. Known Risks

| Risk | Impact | Mitigation |
|---|---|---|
| OpenAI key in preview.html | Security — key exposed in browser source | Move to server-side proxy in Part 4 |
| `EAS dev build required` for Google/Apple Sign In | Auth cannot be tested on device without a dev build | Auth flow works in no-Firebase mode for development |
| `courses_data.js` loaded in `<head>` | 137 KB parse overhead on every page load | Remove `<script>` tag whenever convenient |
| `firstName` crash in HomeScreen | App crashes on render in native build | Fix before writing navigation (Part 2 Day 1) |
| `@invertase/react-native-apple-authentication` needs native module | Won't compile without EAS dev build or bare workflow | Already handled with `appleAuth.ios.js` / `.js` stubs |
