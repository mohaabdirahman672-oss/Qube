# Known Issues

> Log bugs, limitations, and workarounds here. Teammates: check this before starting work.

---

## Active Issues

| ID | Issue | File | Severity | Status | Notes |
|---|---|---|---|---|---|
| KI-01 | No Sign Out button | `src/screens/ProfileScreen.js` | High | Open | Users have no way to sign out. Add a Sign Out button that calls `signOut()` from `useAuth()`. |
| KI-07 | Deep link redirect URLs not registered on the live Supabase project | Supabase Dashboard | High | **Blocks KI-R12 from working** | Code is done (KI-R12), but `qube://reset-password` and `qube://` must be added by hand at Authentication > URL Configuration > Redirect URLs in the Supabase Dashboard for the project (`fvwainyumiunpdjhapto`). Not done via CLI/`supabase config push` on purpose — that command would also silently overwrite live Apple/Google sign-in, MFA, and SMS settings that differ from the local `config.toml` defaults. |

---

## Resolved Issues

| ID | Issue | Resolution | Date |
|---|---|---|---|
| KI-R6 | `appleAuth.ios.js` shadowed `appleAuth.js` on iOS (Metro resolution), so Apple sign-in error handling never ran on device | Replaced the custom `appleAuth` wrapper with `expo-apple-authentication` directly in `AuthContext.js`; deleted both split files; fixed cancel-path error code to `ERR_REQUEST_CANCELED` | 2026-09-19 |
| KI-R7 | Supabase env vars not configured | `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are present in `.env` and auth works end-to-end | 2026-09-19 |
| KI-R8 | OpenAI API key bundled client-side, extractable from the shipped binary | Moved the OpenAI call into `supabase/functions/solve`, reading a server-only secret; added per-user rate limiting (20/hour); removed the key from `.env` entirely. Verified live. | 2026-09-19/21 |
| KI-R9 | EAS environment variables broken across all 3 environments (production/preview/development): `EXPO_PUBLIC__SUPABASE_ANON_KEY` and `EXPO_PUBLIC__OPENAI_API_KEY` had a double-underscore typo (didn't match what the app code reads), `EXPO_PUBLIC_GOOGLE_CLIENT_ID` didn't match the code's `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and `EXPO_PUBLIC_SENTRY_DSN` was missing entirely. Any real EAS build made before this fix would have shipped with broken Supabase auth and no crash reporting. | Deleted the typo'd/wrong-named/obsolete vars, set the 4 correctly-named ones (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_WEB_CLIENT_ID`, `SENTRY_DSN`) across all 3 environments via `eas env:set`. | 2026-09-22 |
| KI-R10 | `app.json`'s `expo-build-properties` had `ios.useModularHeaders: true` — not a real option in `expo-build-properties@1.0.10` (verified against its actual type definitions), so it silently did nothing. First real `eas build --profile preview` failed at Install Pods: `AppCheckCore` depends on `GoogleUtilities`/`RecaptchaInterop`, which don't define modules, breaking static-library integration. | Replaced with `ios.extraPods` declaring `modular_headers: true` for `GoogleUtilities` and `RecaptchaInterop` — the documented per-pod alternative CocoaPods' own error message pointed to. | 2026-09-22 |
| KI-R11 | No EAS build had ever succeeded before today — KI-R9, KI-R10, and KI-06 were all discovered via this process. | 3rd `eas build --profile preview --platform ios` attempt succeeded end-to-end with all three fixes applied. First working build artifact this project has ever produced. Installable via https://expo.dev/accounts/its.muhammad/projects/qube/builds/3cf10f93-1371-45cf-95ea-ebd9bfa070d2 | 2026-09-22 |
| KI-R12 | Password reset and email confirmation links opened a browser, not the app (formerly KI-02/KI-03). There was also no screen for a user to actually enter a new password after tapping the reset link. | Added `qube://` deep link handling: `resetPasswordForEmail`/`signUp` now pass `redirectTo`/`emailRedirectTo`; `AuthContext` listens for the incoming URL (`Linking`), extracts tokens by hand (`src/lib/authDeepLink.js` — Supabase's JS client only auto-detects sessions in URLs on web) and calls `setSession`; new `ResetPasswordScreen.js` + a `passwordRecovery` flag in `RootNavigator` intercepts navigation until a new password is set. **Not fully live yet — see KI-07.** | 2026-09-22 |
| KI-R1 | No auth gate — unauthenticated users went straight to main app | Created `RootNavigator.js` with session-based auth gate | 2026-06-04 |
| KI-R2 | No email/password auth | Implemented Supabase email/password via `AuthContext`, `authService`, auth screens | 2026-06-04 |
| KI-R3 | `firstName` crash in HomeScreen | Variable referenced but never declared — replaced with static welcome string | Earlier |
| KI-R4 | `BottomNav` content overlap | Added `height: 110` spacer at bottom of ScrollViews to prevent content hiding under tab bar | Earlier |
| KI-R5 | Flashcard face height collapsed | Added `minHeight: 180` to `cardWrap` — both absolute-positioned faces need a container height | Earlier |

---

## Active Issues (post-build-fix, non-blocking)

| ID | Issue | File | Severity | Status | Notes |
|---|---|---|---|---|---|
| KI-06 | Sentry source-map upload never configured — no `SENTRY_AUTH_TOKEN`, org, or project set anywhere. 2nd `eas build` attempt failed the Xcode "Upload Debug Symbols to Sentry" phase because of this. | `sentry.properties` (auto-generated, all placeholders) | Low | Mitigated | Set `SENTRY_DISABLE_AUTO_UPLOAD=true` as an EAS env var (all 3 environments) to unblock builds. Sentry crash reporting itself still works — crashes are still captured — but stack traces will be unsymbolicated (minified) until a real Sentry auth token + org/project are configured. Not a launch blocker; worth doing post-launch for readable crash reports. |

## Limitations / Constraints

- **No TypeScript yet** — all files are `.js`. Migration planned but not started.
- **Expo Go compatibility** — `expo-apple-authentication` requires a dev build, not Expo Go. Google Sign-In may also require a dev build.
- **`expo start --web` broken** — babel-preset-expo v55/v54 mismatch causes white screen. Always use `npm run preview` instead.
- **Google Sign-In active** — migrated off Firebase to Supabase-native (`signInWithIdToken`) as of 2026-09-12/19. Still requires a dev build, not Expo Go.
- **Apple Sign-In active** — same migration. iOS only, requires a dev build.
