# Known Issues

> Log bugs, limitations, and workarounds here. Teammates: check this before starting work.

---

## Active Issues

| ID | Issue | File | Severity | Status | Notes |
|---|---|---|---|---|---|
| KI-01 | No Sign Out button | `src/screens/ProfileScreen.js` | High | Open | Users have no way to sign out. Add a Sign Out button that calls `signOut()` from `useAuth()`. |
| KI-02 | Password reset link opens web, not app | `src/screens/auth/ForgotPasswordScreen.js` | Medium | Open | `supabase.auth.resetPasswordForEmail` redirects to a web URL. Requires deep link setup (`expo-linking` + Supabase redirect URL config) for in-app handling. |
| KI-03 | Email confirmation link opens web, not app | `src/screens/auth/SignUpScreen.js` | Medium | Open | Same limitation as KI-02. Supabase sends a confirmation email with a web URL. The app cannot intercept it without deep link configuration. |

---

## Resolved Issues

| ID | Issue | Resolution | Date |
|---|---|---|---|
| KI-R6 | `appleAuth.ios.js` shadowed `appleAuth.js` on iOS (Metro resolution), so Apple sign-in error handling never ran on device | Replaced the custom `appleAuth` wrapper with `expo-apple-authentication` directly in `AuthContext.js`; deleted both split files; fixed cancel-path error code to `ERR_REQUEST_CANCELED` | 2026-09-19 |
| KI-R7 | Supabase env vars not configured | `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are present in `.env` and auth works end-to-end | 2026-09-19 |
| KI-R8 | OpenAI API key bundled client-side, extractable from the shipped binary | Moved the OpenAI call into `supabase/functions/solve`, reading a server-only secret; added per-user rate limiting (20/hour); removed the key from `.env` entirely. Verified live. | 2026-09-19/21 |
| KI-R9 | EAS environment variables broken across all 3 environments (production/preview/development): `EXPO_PUBLIC__SUPABASE_ANON_KEY` and `EXPO_PUBLIC__OPENAI_API_KEY` had a double-underscore typo (didn't match what the app code reads), `EXPO_PUBLIC_GOOGLE_CLIENT_ID` didn't match the code's `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and `EXPO_PUBLIC_SENTRY_DSN` was missing entirely. Any real EAS build made before this fix would have shipped with broken Supabase auth and no crash reporting. | Deleted the typo'd/wrong-named/obsolete vars, set the 4 correctly-named ones (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_WEB_CLIENT_ID`, `SENTRY_DSN`) across all 3 environments via `eas env:set`. | 2026-09-22 |
| KI-R1 | No auth gate — unauthenticated users went straight to main app | Created `RootNavigator.js` with session-based auth gate | 2026-06-04 |
| KI-R2 | No email/password auth | Implemented Supabase email/password via `AuthContext`, `authService`, auth screens | 2026-06-04 |
| KI-R3 | `firstName` crash in HomeScreen | Variable referenced but never declared — replaced with static welcome string | Earlier |
| KI-R4 | `BottomNav` content overlap | Added `height: 110` spacer at bottom of ScrollViews to prevent content hiding under tab bar | Earlier |
| KI-R5 | Flashcard face height collapsed | Added `minHeight: 180` to `cardWrap` — both absolute-positioned faces need a container height | Earlier |

---

## Limitations / Constraints

- **No TypeScript yet** — all files are `.js`. Migration planned but not started.
- **Expo Go compatibility** — `expo-apple-authentication` requires a dev build, not Expo Go. Google Sign-In may also require a dev build.
- **`expo start --web` broken** — babel-preset-expo v55/v54 mismatch causes white screen. Always use `npm run preview` instead.
- **Google Sign-In active** — migrated off Firebase to Supabase-native (`signInWithIdToken`) as of 2026-09-12/19. Still requires a dev build, not Expo Go.
- **Apple Sign-In active** — same migration. iOS only, requires a dev build.
- **Deep links not configured** — password reset and email confirmation links open in browser, not the app.
