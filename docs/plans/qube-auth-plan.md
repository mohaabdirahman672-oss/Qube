# Qube — Guest Mode + Soft Account Wall Plan
**Created:** 2026-06-04  
**Scope:** Guest mode, soft account wall, sign-in/sign-up/sign-out flows, ProfileScreen auth awareness  
**Out of scope:** Google login, Apple login, paywall, subscriptions, cloud sync, Supabase data migration

---

## Current State Audit

### Authentication files
| File | Status | Notes |
|---|---|---|
| `src/context/AuthContext.js` | ✅ Complete | Supabase session listener, `signUpEmail`, `signInEmail`, `signOut`, `sendPasswordReset`, `mapError`. `isFirebaseConfigured = false` guard keeps Google/Apple inert. |
| `src/lib/supabase.js` | ✅ Complete | Supabase client with `isSupabaseConfigured` guard — null-safe when env vars missing |
| `src/services/authService.js` | ✅ Complete | Thin wrappers over `supabase.auth.*` |
| `src/hooks/useAuth.js` | ✅ Complete | `useContext(AuthContext)` wrapper |
| `src/screens/auth/LoginScreen.js` | ✅ Complete | Email/password form + Google/Apple buttons (Google/Apple inert) |
| `src/screens/auth/SignUpScreen.js` | ✅ Complete | Email/password/confirm form, success state |
| `src/screens/auth/ForgotPasswordScreen.js` | ✅ Complete | Email → reset email, success state |
| `src/components/AuthInput.js` | ✅ Complete | Shared styled input with focus/error states |

### Navigation files
| File | Status | Problem |
|---|---|---|
| `src/navigation/RootNavigator.js` | ⚠️ Needs change | **Forces login.** When `session = null`, shows auth screens instead of the main app. This blocks all core functionality for unauthenticated users — violates the guest mode requirement. |
| `src/navigation/AppNavigator.js` | ✅ No change | 5-tab bottom navigator — fine as-is |

### Screen files
| File | Save mechanism | Problem |
|---|---|---|
| `src/screens/SolveScreen.js` | `saveResult()` → `AsyncStorage.setItem('qube_saved_scans', …)` | Saves without any auth check — guests can bypass the wall by saving directly. Must be gated. |
| `src/screens/PracticeScreen.js` | `handleAddCard()` → `AsyncStorage.setItem('@qube/custom_cards', …)` | Same — no auth check. Must be gated. |
| `src/screens/SavedScreen.js` | Reads `qube_saved_scans` from AsyncStorage | No save trigger here — read-only view. Leave as-is. |
| `src/screens/ProfileScreen.js` | No auth awareness | Shows "Qube Student" for everyone. No sign-out button. Needs guest vs. logged-in states. |
| `src/screens/HomeScreen.js` | None | No changes needed |

### Storage systems
- `qube_saved_scans` (AsyncStorage) — solved problems saved by SolveScreen
- `@qube/custom_cards` (AsyncStorage) — user-created flashcards saved by PracticeScreen
- Both are local only; no Supabase sync yet

### Branding + theme
- `src/theme.js` — colors, spacing, radius, typography — **do not touch**
- Colors used in auth screens: `colors.blue`, `colors.gold`, `colors.bg`, `colors.surface`, etc.
- The soft account wall must use the same design language

---

## Core Problem

The current `RootNavigator.js` logic:

```js
{session ? (
  <Stack.Screen name="MainTabs" component={AppNavigator} />
) : (
  <>auth screens</>
)}
```

This is a hard gate: no session → no app. It must change to:

```js
// MainTabs is always first — everyone gets the app
<Stack.Screen name="MainTabs" component={AppNavigator} />
// Auth screens are in the stack but not forced
{!session && (
  <>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </>
)}
```

**Why this works:** React Navigation renders the first screen by default (`MainTabs`). When session is null, auth screens exist in the stack but aren't shown unless explicitly navigated to. When `onAuthStateChange` fires on login, `session` becomes non-null, auth screens are removed from the stack, and React Navigation automatically pops the user back to `MainTabs`. No manual `.navigate()` needed for the auth gate transition.

---

## Guest Mode Flow

```
App opens
  ↓
AuthProvider: checks AsyncStorage for Supabase session
  ↓
loading = true → blank dark screen (no flash of auth screen)
  ↓
loading = false
  ├─ session exists → MainTabs (logged-in user)
  └─ no session    → MainTabs (guest user)
                        ↓
                    All 5 tabs accessible
                    Solve / Camera / Upload → works
                    Practice tab → works
                    Flashcard browsing → works
                    Saved tab → works (shows empty or locally cached)
```

---

## Authentication Flow

```
Guest user is in MainTabs
  ↓
Taps "Sign In" on ProfileScreen  — OR —  soft wall "Create Account" / "Login"
  ↓
navigation.navigate('Login') or 'SignUp'   ← pushed on top of MainTabs
  ↓
User fills form → submit
  ↓
Supabase login/signup succeeds
  ↓
onAuthStateChange fires → session = non-null
  ↓
Auth screens removed from RootNavigator stack
  ↓
React Navigation auto-pops back to MainTabs
  ↓
User is now logged in — save gates open
```

---

## Save Protection Flow (Soft Account Wall)

```
User (guest) taps "Save" in SolveScreen
                    OR
User (guest) taps "Add Card" in PracticeScreen
  ↓
Check: useAuth().session === null?
  ↓ YES (guest)
Show SoftAuthWall modal
  ┌─────────────────────────────────┐
  │ 🔖 Save Your Progress           │
  │                                  │
  │ Create a free QUBE account to    │
  │ save your work, sync across      │
  │ devices, and never lose your     │
  │ progress.                        │
  │                                  │
  │ [Create Account]  ← primary btn  │
  │ [Login]           ← secondary    │
  │ [Continue Without Saving]        │
  └─────────────────────────────────┘
  ↓
User taps "Create Account" → navigation.navigate('SignUp')
User taps "Login"          → navigation.navigate('Login')
User taps "Continue"       → modal closes, save is skipped silently
  ↓ NO (logged in)
Save proceeds normally (AsyncStorage)
```

---

## ProfileScreen Auth Awareness

**Guest state:**
```
[Q avatar]
Guest User
[BETA tag]

[Sign in to save your progress →]  ← taps → navigation.navigate('Login')

[APP STATS section — unchanged]
[DATA section — clear saved, etc.]
```

**Logged-in state:**
```
[Q avatar (initials from email)]
user@example.com
[BETA tag]

[0 problems saved]

[APP STATS section — unchanged]
[DATA section — unchanged]
[Sign Out button — red, in DATA section]
```

---

## Files to Create

| File | Purpose |
|---|---|
| `src/components/SoftAuthWall.js` | Reusable modal: "Save Your Progress" with Create Account / Login / Continue buttons |

---

## Files to Edit

| File | What changes | Risk |
|---|---|---|
| `src/navigation/RootNavigator.js` | Remove hard auth gate. Always show `MainTabs` first. Auth screens remain in stack but not forced. | Low — well-understood React Navigation pattern |
| `src/screens/SolveScreen.js` | Add `{ navigation }` prop. Check `session` before `saveResult()`. Show `SoftAuthWall` if guest. | Low — additive only |
| `src/screens/PracticeScreen.js` | Add `{ navigation }` prop. Check `session` before `handleAddCard()`. Show `SoftAuthWall` if guest. | Low — additive only |
| `src/screens/ProfileScreen.js` | Add `{ navigation }` prop. Use `useAuth()` for guest vs logged-in state. Add sign-out button. | Low — additive only |

---

## Files to NOT Touch

| File | Reason |
|---|---|
| `src/lib/firebase.js` | Google/Apple auth — out of scope |
| `src/lib/googleSignIn.js` + `.native.js` | Google auth — out of scope |
| `src/lib/appleAuth.js` + `.ios.js` | Apple auth — out of scope |
| `src/context/AuthContext.js` | Already correct — no changes needed |
| `src/lib/supabase.js` | Already correct |
| `src/services/authService.js` | Already correct |
| `src/screens/auth/LoginScreen.js` | Already correct — navigation.navigate('SignUp') and 'ForgotPassword' still work |
| `src/screens/auth/SignUpScreen.js` | Already correct |
| `src/screens/auth/ForgotPasswordScreen.js` | Already correct |
| `src/components/AuthInput.js` | Already correct |
| `src/screens/HomeScreen.js` | No save triggers |
| `src/screens/SavedScreen.js` | Read-only view — no changes needed |
| `src/navigation/AppNavigator.js` | No changes needed |
| `src/theme.js` | Design system — do not touch |
| `src/components/BottomNav.js` | No changes needed |

---

## SoftAuthWall Component Design

```
┌─────────────────────────────────────────┐
│                                          │  ← dark overlay
│  ┌───────────────────────────────────┐  │
│  │ ████████████████████████████████ │  │  ← drag handle
│  │                                   │  │
│  │  🔖                               │  │  ← gold bookmark icon badge
│  │                                   │  │
│  │  Save Your Progress               │  │  ← h2, textPrimary
│  │                                   │  │
│  │  Create a free QUBE account to    │  │  ← body, textSub
│  │  save your work, sync across      │  │
│  │  devices, and never lose your     │  │
│  │  progress.                        │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │    Create Account  →        │  │  │  ← gold gradient button
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │    Login                    │  │  │  ← surface button, blue text
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  Continue Without Saving          │  │  ← text link, textMuted
│  │                                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

Props: `visible`, `onClose`, `onCreateAccount`, `onLogin`

Usage pattern in screens:
```js
const { session } = useAuth();
const [showWall, setShowWall] = useState(false);

async function saveResult() {
  if (!session) { setShowWall(true); return; }
  // ... existing save logic
}

<SoftAuthWall
  visible={showWall}
  onClose={() => setShowWall(false)}
  onCreateAccount={() => { setShowWall(false); navigation.navigate('SignUp'); }}
  onLogin={() => { setShowWall(false); navigation.navigate('Login'); }}
/>
```

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| React Navigation stack inconsistency when auth screens removed mid-view | Low | React Navigation handles conditional screen removal gracefully — this is the official pattern |
| Guest taps "Save" → soft wall → creates account → comes back and still sees "Save" button | None | After login `session` is set — `saveResult()` proceeds normally on next tap |
| `navigation.navigate('SignUp')` fails if called from a tab screen | Low | Tab screens receive the root stack's `navigation` prop — `.navigate()` traverses the full stack hierarchy |
| ProfileScreen sign-out crashes if `signOut` throws | Low | Wrap in try/catch, show Alert on error |
| Supabase not configured (no env vars) — guest mode still works? | None | `isSupabaseConfigured = false` → session is always null → app runs in permanent guest mode until credentials are added |
| Losing locally saved data when switching from guest to account | Not applicable | Guests can't save — no migration needed |

---

## Edge Cases

- **App restart as guest:** `loading` is true briefly → blank screen → `session = null` → MainTabs (guest). ✓
- **App restart as logged-in user:** `session` restored from AsyncStorage → MainTabs (logged-in). ✓
- **Guest with no Supabase credentials:** `isSupabaseConfigured = false` → soft wall shows but Create Account / Login fail gracefully with ".env" message. ✓
- **User logs out from ProfileScreen:** `signOut()` → `onAuthStateChange` → `session = null` → auth screens re-added to stack, but user stays on MainTabs (they are already there). ✓
- **Session expires mid-session:** `onAuthStateChange` fires → `session = null` → next save attempt hits soft wall. ✓
- **Guest navigates to Saved tab:** Shows "Nothing saved yet" empty state — no wall needed. ✓
- **Logged-in user saves:** Proceeds to AsyncStorage directly — soft wall never appears. ✓

---

## Testing Checklist (Part 3)

- [ ] App opens to main app without login prompt
- [ ] All 5 tabs accessible as guest
- [ ] Solver works without login
- [ ] Camera mode works without login
- [ ] Upload mode works without login  
- [ ] Practice tab + flashcards work without login
- [ ] Tapping Save in SolveScreen shows soft wall (guest)
- [ ] Tapping Add Card in PracticeScreen shows soft wall (guest)
- [ ] "Create Account" in wall → SignUpScreen
- [ ] "Login" in wall → LoginScreen
- [ ] "Continue Without Saving" → wall closes, save skipped
- [ ] After creating account → auto-returns to main app
- [ ] After logging in → auto-returns to main app
- [ ] After login, Save works without wall
- [ ] After login, Add Card works without wall
- [ ] Sign Out in ProfileScreen → guest mode restored
- [ ] Session persists across app restarts
- [ ] Forgot password flow works
- [ ] Gold branding unchanged
- [ ] Cube logo unchanged
- [ ] No Google/Apple files modified
