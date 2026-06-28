# Qube — Guest Mode + Auth Review
**Date:** 2026-06-04  
**Scope:** Guest mode, soft account wall, sign-in/sign-up/sign-out, ProfileScreen auth states

---

## Files Created

| File | Purpose |
|---|---|
| `src/components/SoftAuthWall.js` | Bottom-sheet modal: "Save Your Progress" with Create Account / Login / Continue buttons. Uses gold gradient CTA matching QUBE brand. |

---

## Files Modified

| File | What Changed |
|---|---|
| `src/navigation/RootNavigator.js` | Removed hard auth gate. `MainTabs` is now always the first screen. Auth screens (Login, SignUp, ForgotPassword) remain in the stack when logged out but are never forced — only navigated to explicitly. On login, `onAuthStateChange` fires, screens are removed, React Navigation auto-returns to MainTabs. |
| `src/screens/SolveScreen.js` | Added `{ navigation }` prop. Imported `useAuth` and `SoftAuthWall`. `saveResult()` now checks `session` — shows `SoftAuthWall` if guest, saves normally if logged in. |
| `src/screens/PracticeScreen.js` | Added `{ navigation }` prop. Imported `useAuth` and `SoftAuthWall`. `openAddCard()` gate checks `session` — shows `SoftAuthWall` if guest, opens Add Card modal if logged in. |
| `src/screens/ProfileScreen.js` | Added `{ navigation }` prop. Imported `useAuth`. Full guest vs. logged-in states: guest shows "Guest User" + gold sign-in CTA bar + "Create Free Account" card at bottom; logged-in shows display name + email + Sign Out row. |

---

## Files NOT Touched

- `src/lib/firebase.js` — untouched
- `src/lib/googleSignIn.*` — untouched
- `src/lib/appleAuth.*` — untouched
- `src/context/AuthContext.js` — untouched
- `src/lib/supabase.js` — untouched
- `src/services/authService.js` — untouched
- `src/screens/auth/LoginScreen.js` — untouched
- `src/screens/auth/SignUpScreen.js` — untouched
- `src/screens/auth/ForgotPasswordScreen.js` — untouched
- `src/components/AuthInput.js` — untouched
- `src/theme.js` — untouched
- `src/screens/HomeScreen.js` — untouched
- `src/screens/SavedScreen.js` — untouched

---

## Guest Mode Flow

```
App opens
  ↓ AuthProvider: checks AsyncStorage for Supabase session
  ↓ loading = true → blank dark screen
  ↓ loading = false, session = null
  ↓
MainTabs shown immediately (guest mode)
  ├── Home tab:     fully accessible ✓
  ├── Saved tab:    accessible (shows empty state until saved) ✓
  ├── Solve tab:    fully accessible, solver works ✓
  ├── Practice tab: fully accessible, flashcards + problems work ✓
  └── Profile tab:  shows Guest User + gold sign-in prompt ✓
```

---

## Soft Account Wall Flow

```
Guest taps "Save" in SolveScreen
   OR
Guest taps "+" (Add Card) in PracticeScreen
  ↓
session === null → setShowAuthWall(true)
  ↓
SoftAuthWall bottom sheet slides up:
  ┌──────────────────────────────────┐
  │ 🔖 Save Your Progress            │
  │ Create a free QUBE account …     │
  │ [Create Account →]   (gold)      │
  │ [Login]              (blue text) │
  │  Continue Without Saving         │
  └──────────────────────────────────┘
  ├── "Create Account" → navigate('SignUp')
  ├── "Login"          → navigate('Login')
  └── "Continue" / backdrop → wall closes, save skipped
```

---

## Authentication Flow

```
Guest navigates to Login (from wall or Profile)
  ↓
Fills email + password → Sign In
  ↓
Supabase signInWithPassword succeeds
  ↓
onAuthStateChange → session = non-null in AuthContext
  ↓
RootNavigator re-renders: auth screens removed from stack
  ↓
React Navigation auto-returns to MainTabs
  ↓
User is logged in — save gates open, Profile shows real name + sign-out
```

---

## Sign Out Flow

```
Logged-in user taps "Sign Out" in Profile
  ↓
Alert confirmation → confirmed
  ↓
signOut() → Supabase signOut
  ↓
onAuthStateChange → session = null
  ↓
RootNavigator re-renders: auth screens re-added to stack
  ↓
User stays on Profile (now showing guest state)
  ↓
Save gates re-engaged — next save attempt shows soft wall
```

---

## Testing Instructions

### Guest mode (no Supabase credentials needed)
1. Open the app — confirm it goes directly to the main app (no login screen)
2. Tap all 5 tabs — confirm all are accessible
3. Go to Solve tab, type a math problem, tap "Solve with AI", wait for result
4. Tap "Save" → confirm soft account wall slides up
5. Tap "Continue Without Saving" → wall closes, you stay on solve screen
6. Go to Practice tab, tap "+" button → confirm soft wall slides up again
7. Tap "Create Account" in wall → confirm SignUp screen opens
8. Go back, tap "Login" in wall → confirm Login screen opens
9. Go to Profile tab → confirm "Guest User" + gold sign-in bar + "Create Free Account" card

### Auth flows (requires Supabase credentials in .env)
10. From soft wall, tap "Create Account" → fill form → submit → check email → confirm → sign in
11. After signing in → confirm auto-return to main app
12. Go to Profile → confirm real name + email shown + Sign Out row visible
13. Tap Save in Solve → confirm saves directly (no wall)
14. Tap "+" in Practice → confirm Add Card modal opens (no wall)
15. Tap Sign Out → confirm alert → confirm sign out → confirm guest state returns

### Branding checks
- [ ] Gold QUBE logo unchanged on HomeScreen
- [ ] Gold "Solve with AI" button unchanged
- [ ] Soft account wall uses gold gradient CTA (not blue)
- [ ] Profile "Create Free Account" uses gold gradient
- [ ] No auth screen was redesigned

---

## Known Issues

| ID | Issue | Severity | Notes |
|---|---|---|---|
| KI-01 | Password reset deep link opens web, not app | Medium | Requires `expo-linking` + Supabase redirect URL config |
| KI-02 | Email confirmation link opens web, not app | Medium | Same — deep link handling not yet configured |
| KI-03 | Supabase env vars not in `.env` | High (for auth) | Auth system is guarded — app runs in permanent guest mode without them |
| KI-04 | Guest's locally saved data (if any) is lost on first login | N/A | Guests can't save — no migration needed |
| KI-05 | Google/Apple sign-in buttons visible but inert | Low | `isFirebaseConfigured = false` — shows error message if tapped. Future work. |
