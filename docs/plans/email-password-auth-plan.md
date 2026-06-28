# Qube — Email/Password Auth Plan
**Created:** 2026-06-04  
**Scope:** Supabase email/password sign-up, sign-in, sign-out, forgot-password, persistent session, auth gate  
**Out of scope:** Google login, Apple login, paywall, subscriptions, marketing

---

## Audit Findings

### What currently exists

| File | Status | Notes |
|---|---|---|
| `src/context/AuthContext.js` | Exists — incomplete | Firebase-based; Google + Apple only; no email/password; **not mounted as auth gate** |
| `src/hooks/useAuth.js` | Exists — usable | Simple `useContext` wrapper; works as-is |
| `src/screens/auth/LoginScreen.js` | Exists — incomplete | Google + Apple buttons only; no email/password form; **never shown to users** |
| `src/lib/firebase.js` | Exists — unconfigured | Reads `EXPO_PUBLIC_FIREBASE_*` env vars; `isFirebaseConfigured = false` (no vars set); skip |
| `src/lib/googleSignIn.js` | Exists — stub | Platform stub for web; leave untouched |
| `src/lib/googleSignIn.native.js` | Exists — stub | Native Google Sign-In; leave untouched |
| `src/lib/appleAuth.js` | Exists — stub | Non-iOS stub; leave untouched |
| `src/lib/appleAuth.ios.js` | Exists — stub | iOS Apple Auth; leave untouched |
| `src/lib/supabase.js` | **Missing** | Not yet created |
| `src/screens/auth/SignUpScreen.js` | **Missing** | Not yet created |
| `src/screens/auth/ForgotPasswordScreen.js` | **Missing** | Not yet created |
| `src/navigation/RootNavigator.js` | **Missing** | No auth gate exists |

### Current auth gate status

**`App.js` always renders `AppNavigator` regardless of session state.** There is no conditional logic. Unauthenticated users go straight to the main app. `LoginScreen` is never shown.

```js
// App.js — current (no auth gate)
<AuthProvider>
  <NavigationContainer>
    <AppNavigator />   ← always rendered, no auth check
  </NavigationContainer>
</AuthProvider>
```

### Navigation stack gap

`@react-navigation/native-stack` is not installed. The auth flow requires a stack navigator (Login → SignUp → ForgotPassword). Currently only bottom tabs are installed.

### Supabase status

- `@supabase/supabase-js` **not installed**
- `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` **not in `.env`**
- `docs/debug/api/env-verification.md` already lists these as required
- `docs/debug/api/supabase-debug.md` already exists as a skeleton — confirms Supabase is the planned backend

### Existing skeleton docs (contain no real content — placeholders only)

- `docs/plans/auth-architecture.md` — skeleton headers, no content
- `docs/plans/session-management.md` — skeleton headers, no content
- `docs/reviews/auth-review.md` — test checklist, no results
- `features/auth/apple/` — `.gitkeep` only
- `features/auth/google/` — `.gitkeep` only
- `hooks/auth/` — `.gitkeep` only

---

## Auth Backend Decision: Supabase

**Use Supabase for email/password auth.** Reasons:

1. `docs/debug/api/env-verification.md` already lists `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as required — confirms intent
2. `docs/plans/supabase-openai-server-plan.md` already decided Supabase is the final backend
3. Firebase is installed but has zero configured credentials — would require Firebase project setup before use
4. Supabase email/password requires no native modules — works in Expo Go immediately

**Leave Firebase files completely untouched** — they exist for eventual Google/Apple sign-in and must not be modified.

---

## Auth Flow (after implementation)

```
App opens
  ↓
AuthProvider initializes
  ↓ checks AsyncStorage for Supabase session
  ↓
loading = true (show splash / nothing)
  ↓
loading = false
  ├─ session exists ──→ RootNavigator → MainTabs (AppNavigator)
  └─ no session ──────→ RootNavigator → AuthStack
                              ↓
                        LoginScreen (default)
                          ├─ "Sign In" → validate → signIn() → MainTabs
                          ├─ "Create Account" → navigate to SignUpScreen
                          └─ "Forgot password?" → navigate to ForgotPasswordScreen
                        SignUpScreen
                          └─ "Create Account" → validate → signUp() → MainTabs
                        ForgotPasswordScreen
                          └─ "Send reset email" → resetPassword() → back to Login
```

---

## Navigation Structure (after implementation)

```
RootNavigator  (native-stack — new)
├── AuthStack  (when session = null)
│   ├── LoginScreen       ← email/password form + Google/Apple buttons
│   ├── SignUpScreen       ← new screen
│   └── ForgotPasswordScreen ← new screen
└── MainTabs   (when session exists)
    └── AppNavigator       ← unchanged 5-tab bottom navigator
```

`RootNavigator` replaces the direct `<AppNavigator />` call in `App.js`.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/lib/supabase.js` | Supabase client with AsyncStorage session persistence |
| `src/features/auth/authService.js` | Pure functions: signUp, signIn, signOut, resetPassword, getSession |
| `src/navigation/RootNavigator.js` | Auth gate — AuthStack vs MainTabs based on session |
| `src/screens/auth/SignUpScreen.js` | Email + password + confirm password form |
| `src/screens/auth/ForgotPasswordScreen.js` | Email form → sends Supabase reset email |

---

## Files to Edit

| File | What changes | Risk |
|---|---|---|
| `src/context/AuthContext.js` | Add Supabase session listener + signUpEmail, signInEmail, signOut methods; keep existing Google/Apple structure | Medium — rewriting context |
| `src/screens/auth/LoginScreen.js` | Add email/password form fields below existing Google/Apple buttons | Low — additive only |
| `App.js` | Replace `<AppNavigator />` with `<RootNavigator />` | Low — one-line swap |
| `.env` | Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Low — env vars |

---

## Files to NOT Touch

| File | Reason |
|---|---|
| `src/lib/firebase.js` | Google/Apple auth — out of scope |
| `src/lib/googleSignIn.js` + `.native.js` | Google auth — out of scope |
| `src/lib/appleAuth.js` + `.ios.js` | Apple auth — out of scope |
| `src/navigation/AppNavigator.js` | 5-tab nav — unchanged |
| All screens in `src/screens/` except auth screens | Out of scope |
| `src/components/BottomNav.js` | Out of scope |
| `src/theme.js` | Out of scope |
| `preview.html` | Browser prototype — separate from RN |
| `src/services/solveApi.js` | Out of scope |
| `src/data/practiceData.js` | Out of scope |

---

## Packages to Install

| Package | Version | Why |
|---|---|---|
| `@supabase/supabase-js` | latest (Expo SDK 54 compatible) | Supabase client |
| `@react-navigation/native-stack` | compatible with `@react-navigation/native ^7` | Stack navigator for auth screens |

`AsyncStorage` is already installed (`@react-native-async-storage/async-storage 2.2.0`) — used for Supabase session persistence.

---

## `src/lib/supabase.js` — Client Shape

```js
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

---

## `src/features/auth/authService.js` — Function Signatures

```js
signUpWithEmail(email, password)
  → { data: { user, session }, error }

signInWithEmail(email, password)
  → { data: { user, session }, error }

signOut()
  → { error }

sendPasswordReset(email)
  → { data, error }

getSession()
  → { data: { session }, error }
```

All functions are thin wrappers over `supabase.auth.*`. No business logic lives here — they just call Supabase and return the raw result. Error mapping (Supabase error → user-friendly string) happens in the calling hook/context.

---

## `src/context/AuthContext.js` — New Shape

```js
// Context value shape
{
  user,              // Supabase User | null
  session,           // Supabase Session | null
  loading,           // boolean — true while initial session check runs
  signUpEmail,       // async (email, password) => { error }
  signInEmail,       // async (email, password) => { error }
  signOut,           // async () => void
  sendPasswordReset, // async (email) => { error }
  // Kept for future use (not active yet):
  signInWithGoogle,  // from existing Firebase code
  signInWithApple,   // from existing Firebase code
}
```

The `onAuthStateChanged` listener is replaced by `supabase.auth.onAuthStateChange`. The `isFirebaseConfigured` guard stays on the Firebase code paths so they remain inert.

---

## Validation Rules

### Email field
- Non-empty: "Email is required"
- Valid format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`): "Enter a valid email address"

### Password field (login)
- Non-empty: "Password is required"

### Password field (signup)
- Non-empty: "Password is required"
- Minimum 8 characters: "Password must be at least 8 characters"

### Confirm password field (signup only)
- Matches password: "Passwords do not match"

Validation fires on submit, not on-type (avoids aggressive error flash while user is still typing).

---

## Error Message Mapping

| Supabase error | User-facing message |
|---|---|
| `"Email not confirmed"` | "Please verify your email — check your inbox" |
| `"Invalid login credentials"` | "Wrong email or password" |
| `"User already registered"` | "An account with this email already exists" |
| `"Password should be at least 6 characters"` | "Password must be at least 8 characters" |
| `"Too many requests"` | "Too many attempts — please wait a moment" |
| `"Unable to validate email address"` | "Enter a valid email address" |
| Network failure (fetch error) | "No connection — check your internet and try again" |
| Anything else | "Something went wrong — please try again" |

---

## Loading States

| Action | Loading indicator |
|---|---|
| App startup (session check) | Blank dark screen (no flash) |
| Sign In button tapped | Button shows spinner, text changes to "Signing in…", disabled |
| Sign Up button tapped | Button shows spinner, text changes to "Creating account…", disabled |
| Send reset email tapped | Button shows spinner, text changes to "Sending…", disabled |
| Sign Out | Immediate (sync from Supabase client perspective) |

---

## Screen Layouts

### LoginScreen (updated)
```
┌──────────────────────────────┐
│  [Q logo]  QUBE  BETA        │
│  Math. Every Dimension.      │
│                              │
│  [Email input]               │
│  [Password input 👁]         │
│  [Sign In →]                 │
│                              │
│  Forgot password?            │
│                              │
│  ──────── or ────────        │
│                              │
│  [Continue with Google]      │
│  [Continue with Apple]  iOS  │
│                              │
│  Don't have an account?      │
│  Create one →                │
└──────────────────────────────┘
```

### SignUpScreen (new)
```
┌──────────────────────────────┐
│  ← Back                      │
│  Create Account              │
│  Join Qube today             │
│                              │
│  [Email input]               │
│  [Password input 👁]         │
│  [Confirm password 👁]       │
│  [Create Account →]          │
│                              │
│  Already have an account?    │
│  Sign in →                   │
└──────────────────────────────┘
```

### ForgotPasswordScreen (new)
```
┌──────────────────────────────┐
│  ← Back                      │
│  Reset Password              │
│  Enter your email to receive │
│  a reset link                │
│                              │
│  [Email input]               │
│  [Send Reset Email →]        │
│                              │
│  (success state)             │
│  ✅ Reset email sent!        │
│  Check your inbox            │
└──────────────────────────────┘
```

---

## RootNavigator Auth Gate Logic

```js
function RootNavigator() {
  const { session, loading } = useAuth()

  if (loading) return null  // blank dark screen during session check

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="MainTabs" component={AppNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login"          component={LoginScreen} />
          <Stack.Screen name="SignUp"         component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}
```

When `session` changes (login/logout), React Navigation automatically re-renders and switches between auth and app screens. No manual `.navigate()` calls needed for the auth gate transition.

---

## Environment Variables Required

Add to `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

The user must create a Supabase project and paste in these two values. No other Supabase configuration is needed for email/password auth.

---

## Testing Checklist

- [ ] User can sign up with a new email and password
- [ ] After sign up, user is sent a confirmation email and/or auto-signed in (depends on Supabase project settings)
- [ ] User can sign in with correct credentials → reaches main app
- [ ] Wrong password shows "Wrong email or password"
- [ ] Non-existent email shows "Wrong email or password" (same message — no user enumeration)
- [ ] Invalid email format blocked before API call
- [ ] Duplicate email shows "An account with this email already exists"
- [ ] Password under 8 chars blocked before API call
- [ ] Passwords don't match on signup blocked before API call
- [ ] "Forgot password" sends reset email and shows success state
- [ ] App restart → user stays signed in (session persists)
- [ ] Sign out → returns to LoginScreen
- [ ] Google/Apple buttons in LoginScreen still visible and untouched
- [ ] No Firebase files were modified
- [ ] No non-auth screens were modified
- [ ] Loading spinner shows during all async operations
- [ ] All error messages are user-friendly (no raw Supabase error objects shown)
