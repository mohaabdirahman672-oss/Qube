# Plan: In-App Account Deletion (B1, KI-15)

> Status: **Approved 2026-09-29** with all three recommendations (destructive alert, immediate deletion, RevenueCat step included and dormant until its secret is set). Built; see `docs/reviews/account-deletion.md`.
> Written 2026-09-29.

## Feature

App Store guideline 5.1.1(v): an app that lets people create an account must let them delete it from inside the app. Today, Profile → Delete Account only shows an alert telling people to email support, which Apple rejects.

After this change, a signed-in user can go to **Profile → Delete Account**, confirm, and have their account and all data tied to it removed immediately. For Sign in with Apple users, the server also revokes Qube's access with Apple, which Apple requires separately (developer news, June 2022).

## Design

### Flow (client)

1. **Profile → Delete Account** opens a destructive confirm alert:
   > **Delete your account?**
   > This permanently deletes your account, saved problems and flashcards. It can't be undone.
   >
   > Deleting your account doesn't cancel Premium. Cancel it in iPhone Settings → your name → Subscriptions.

   The Premium sentence is always shown, not only to current subscribers. The app's view of subscription state can be stale, and showing it to everyone costs nothing.
   Buttons: **Cancel** / **Delete** (destructive style).
2. **Apple users only:** the app calls `AppleAuthentication.signInAsync()` again to get a fresh `authorizationCode`. The server needs this code to revoke Qube's access with Apple. If the user cancels this sheet, deletion stops and nothing is deleted.
   - An "Apple user" is anyone with an `apple` entry in `user.identities`. This also covers people who signed up by email and later linked Apple.
3. The app calls the `delete-account` Edge Function with the session's JWT (and the Apple code when there is one). The Delete button shows a spinner and all Profile actions are disabled while it runs.
4. **On success:** local cleanup, then `supabase.auth.signOut({ scope: 'local' })`, then an alert "Your account has been deleted." The auth listener then returns the app to the guest Home screen, as with a normal sign-out.
   - Local cleanup: `clearRecentSolves()`, RevenueCat `logOut()`, and for Google users `GoogleSignin.revokeAccess()`, best effort.
5. **On failure:** an alert "We couldn't delete your account. Check your connection and try again. If it keeps happening, email support@qubemath.app." The user stays signed in, and every server step is safe to retry.

### `delete-account` Edge Function (server)

`verify_jwt = true`, POST only. It uses the service role for the deletes.

1. It resolves the user from the bearer token (`auth.getUser(jwt)`) and never trusts a user ID sent in the body.
2. **Apple revoke** (when the user has an Apple identity and the body includes `appleAuthorizationCode`):
   1. It builds a `client_secret` JWT signed ES256 with the Sign in with Apple `.p8` key, using WebCrypto and no library:
      - `iss` = Team ID, `sub` = `com.qube.mathapp`, `aud` = `https://appleid.apple.com`, expiry 5 minutes.
   2. `POST https://appleid.apple.com/auth/token` (`grant_type=authorization_code`) exchanges the code for a `refresh_token`.
   3. `POST https://appleid.apple.com/auth/revoke` with that refresh token (`token_type_hint=refresh_token`).
   4. **If the revoke fails, deletion still goes ahead,** and the failure is logged. We never leave someone unable to delete their account because Apple's endpoint is down; an unrevoked token only means Qube still appears under the user's Apple ID "Sign in with Apple" list until they remove it.
3. **Data deletes**, explicitly by user ID. The function doesn't rely on foreign-key cascades, because `saved_problems` and `custom_flashcards` were created in the dashboard and have no migration, so their FK behaviour isn't recorded in the repo. It deletes:
   - `saved_problems` where `user_id = uid`
   - `custom_flashcards` where `user_id = uid`
   - `weekly_solve_usage` where `key = uid` (the signed-in usage key is the raw user ID; see `weekly-usage/index.js:93`)
   - `solve_rate_limits` where `user_id = uid`
   - `user_entitlements` where `user_id = uid` (it also cascades, but the explicit delete is harmless)
4. **RevenueCat:** if a `REVENUECAT_SECRET_KEY` secret is set, the function calls `DELETE /v1/subscribers/{uid}` to remove the customer record (GDPR-style deletion). This is skipped when the secret isn't set. RevenueCat isn't configured yet (C3), so this activates later without a code change.
5. `auth.admin.deleteUser(uid)` runs **last**. If an earlier step fails, the function returns an error before this point, so the user can retry and isn't left half deleted.
6. It returns `{ ok: true }`, or `{ error }` with a 4xx/5xx status.

**Not deleted:** guest-device rows in `weekly_solve_usage`, keyed by the anonymous device ID. They aren't linked to the account, and the Privacy Policy already says they're kept until the weekly reset. `flashcard_worked_examples` is shared content with no user data.

### Secrets (Supabase, never in the app)

| Secret | Value |
|---|---|
| `APPLE_TEAM_ID` | `GU33M426GC` |
| `APPLE_CLIENT_ID` | `com.qube.mathapp` |
| `APPLE_KEY_ID` | from the owner's new Sign in with Apple key |
| `APPLE_PRIVATE_KEY` | contents of that `.p8` |
| `REVENUECAT_SECRET_KEY` | optional, later |

If the Apple secrets are missing, the function skips the revoke with a logged warning instead of failing. The feature can therefore ship and be tested before the key exists, but it **must** have the key before App Review.

## Files to Create

- `supabase/functions/delete-account/index.js`: the function above
- `supabase/functions/delete-account/deno.json`: same shape as the other functions
- `docs/reviews/account-deletion.md`: completion summary

## Files to Edit

- `supabase/config.toml`: add a `[functions.delete-account]` block with `verify_jwt = true`
- `src/services/authService.js`: `deleteAccountRemote({ appleAuthorizationCode })`, which calls the function
- `src/context/AuthContext.js`: `deleteAccount()` covering Apple re-auth, the function call and local cleanup, exposed on the context. This is an Auth-owned file, so it's logged in `docs/shared-changes.md`.
- `src/screens/ProfileScreen.js`: replace `handleDeleteAccount()` with the confirm → delete → result flow and a loading state
- **Wording that says "email us to delete":**
  - `src/data/legalContent.js` (Privacy "Your rights", Terms "Termination")
  - the hosted Privacy Policy §05 and Terms §09 (`docs/legal/*.html`), republished at the same URLs
  - the Support page's "How do I delete my account?"
- `docs/app-store-connect-prep.md`: App Review note saying where deletion is found
- `docs/known-issues.md`: KI-15 moves to resolved

## Dependencies

- **None new.** `expo-apple-authentication`, `@react-native-google-signin/google-signin` and `react-native-purchases` are already installed.
- The Apple JWT is signed with WebCrypto (`crypto.subtle`, ES256), which Deno has built in.
- **Owner action:** create the Sign in with Apple key (checklist B1 "You do").

## Risks

- **Irreversible.** A bug here deletes real data. Mitigations:
  - The user ID comes only from the verified JWT.
  - Every delete is filtered by that ID.
  - The first test runs on a throwaway account.
- **Unrecorded schema.** `saved_problems` and `custom_flashcards` have no migration. If one has a user column not named `user_id`, that delete fails. Mitigation: the app code queries them by `user_id` today (`dbService.js`); I'll confirm the column names before deploy.
- **Apple revoke fails silently** if the key or secrets are wrong. Deletion still works, but Apple's requirement isn't met. Mitigation: the function returns `appleRevoked: true/false`, and I check it in the test in step 5.
- **The authorization code is single-use and expires in 5 minutes.** It's obtained right before the call, never stored.
- **Session invalid after deletion:** the local sign-out uses `scope: 'local'`, so it doesn't call the server with a token for a user that no longer exists.

## Edge Cases

- **Guest (signed out):** the Delete Account row isn't shown. It's already inside the signed-in section.
- **Apple user cancels the Apple sheet:** nothing happens, and they stay signed in.
- **Apple user whose Apple sheet errors, or who is on a device where Apple sign-in isn't available:** the app offers "Delete without Apple confirmation?" and deletes with the revoke skipped. Nobody is blocked from deleting.
- **Network drops mid-request:** the error alert appears. If the server finished anyway, the next app start finds no valid session and signs out normally.
- **Double tap:** the button is disabled while the request runs.
- **Active Premium:** the warning is always shown. Apple's subscription is unaffected, as the Terms already state.
- **Same email signs up again later:** they get a brand-new account with no old data and no Premium entitlement. Restore Purchases re-links the Apple subscription.

## Testing Strategy

1. **Before deploy:** read `saved_problems` and `custom_flashcards` column names from the database and confirm `user_id`.
2. **Email account:**
   1. Create a throwaway account, save a problem, make a flashcard and do a solve.
   2. Delete it.
   3. Check that the auth user and every row are gone.
   4. Check that signing in with it fails.
   5. Check that the app shows guest Home.
3. **Apple account** (after the key is set up):
   1. Sign in with Apple on a test Apple ID, then delete.
   2. Check that the response has `appleRevoked: true`.
   3. Check that Qube disappears from iPhone Settings → Apple ID → Sign in with Apple.
4. **Apple cancel:** tap Delete, cancel the Apple sheet, and check that the account is still intact.
5. **Offline:** turn on airplane mode, tap Delete, and check for the error alert with the account intact.
6. **Google account:** delete and check that the account is gone and Google access is revoked.

## Open Questions

1. **Stronger confirm?** Should the user have to type `DELETE`, or is the destructive alert enough? I recommend the alert: Apple accepts it, and it matches iOS conventions.
2. **Grace period?** Delete immediately, or schedule it for 30 days with an "undo"? I recommend deleting immediately. It's simpler and it's what the legal docs promise.
3. **RevenueCat customer deletion:** include it now, dormant until the secret exists (as planned), or leave it out? I recommend including it.
