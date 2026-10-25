# Review: In-App Account Deletion (B1, KI-15)

> Completed 2026-09-29. Plan: `docs/plans/account-deletion.md` (approved the same day).

## What was built

Signed-in users can delete their account from **Profile → Settings → Delete Account**.

1. A destructive confirm alert appears. It always includes the "doesn't cancel Premium" warning.
2. **Apple users only:** the Apple sheet appears once more, to get a single-use authorization code.
3. The app calls the new `delete-account` Edge Function.
4. The app cleans up locally and signs out.
5. An "Account deleted" alert appears, and the app is back on guest Home.

The function:
- resolves the caller from their access token;
- revokes Sign in with Apple (a best-effort step);
- deletes the user's rows in `saved_problems`, `custom_flashcards`, `weekly_solve_usage`, `solve_rate_limits` and `user_entitlements`;
- deletes the RevenueCat customer (dormant until `REVENUECAT_SECRET_KEY` is set);
- deletes the auth user last.

## Files

**Created**
- `supabase/functions/delete-account/index.js`, `deno.json`

**Modified**
- `supabase/config.toml`: new `[functions.delete-account]`, `verify_jwt = true`
- `src/services/authService.js`: `deleteAccountRemote()`
- `src/context/AuthContext.js`: `deleteAccount()`, exposed on the context. Logged in `docs/shared-changes.md`.
- `src/screens/ProfileScreen.js`: the new flow, a `deleting` state with a spinner, and the Danger Zone is now hidden for guests
- `src/data/legalContent.js`: Privacy "Your rights" and Terms "Termination" now point to Profile → Settings → Delete Account
- `docs/legal/privacy-policy.html` §05, `terms-of-service.html` §09, `support.html`: same wording. **Edited locally but not republished yet** (see below).
- `docs/app-store-connect-prep.md` §3: the review note now says where deletion is, and asks the reviewer to test it on a new account, not the demo account

## Decisions

- **Apple sign-in is detected from `identities` and `app_metadata.providers`.** Checking both means an email account that later linked Apple is still revoked.
- **The Apple revoke never blocks deletion.** If it fails, the account is still deleted, and the function reports `appleRevoked: false`.
  - If Apple re-auth can't run at all (errors out, or isn't available), the user is offered "Delete Anyway".
  - Cancelling the Apple sheet stops everything, and nothing is deleted.
- **The Apple `client_secret` is signed with WebCrypto ES256**, with no new dependency. It was verified once with a throwaway P-256 key:
  - the signature verifies, the header and claims are correct, and it's 64-byte raw r||s;
  - a PEM whose line breaks arrive as literal `\n` loads correctly.
- **Deletes use explicit `user_id` / `key` filters**, not FK cascades, because `saved_problems` and `custom_flashcards` have no migration.
- **The auth user is deleted last.** Any earlier failure returns 500 before it, and every step is safe to retry.
- **Local sign-out uses `scope: 'local'`,** because the server user is already gone. RevenueCat `logOut` happens through `SubscriptionContext`'s existing session-change effect, so it isn't duplicated.
- **The "Account deleted" alert closes Settings from its OK button,** because an Alert raised while an iOS Modal is closing can be dropped.

## Checks run

- `node --check` passes on the function.
- A Babel transform with `babel-preset-expo` passes on the four edited app files.
- The Apple JWT signing check described above passes.
- **Not run:** a real deploy or on-device test. The deploy is blocked in this session (see below).

## Critic review: weaknesses and risks

- **Unverified schema.** The column name `user_id` on `saved_problems` and `custom_flashcards` is inferred from `dbService.js`, not read from the database. If either delete fails, the function returns 500 before touching the auth user, so it fails safe. Still, confirm it on the first test.
- **Apple revoke is untested against Apple.** It can only be tested once the owner creates the Sign in with Apple key. Until the secrets exist, Apple users are deleted but not revoked. That's acceptable for TestFlight, **not** for App Review.
- **Partial failure window.** If the server finishes but the response is lost (network drop), the user sees "Couldn't delete". Their token then refers to a deleted user, and the next request or refresh fails and signs them out. That's confusing but harmless.
- **The reviewer may delete the demo account.** The review notes ask them not to. If they do anyway, recreate it (checklist A3).
- **Hosted legal pages are not republished yet.** They still say "Profile → Contact Us". Publishing now would describe a button users don't have, so republish them with D2/F1.

## Still to do

1. ~~Deploy~~ Done 2026-09-29 (`delete-account` v2, `solve` v11; KI-14 closes after one solve on device).
2. ~~Apple key~~ Done 2026-09-29: key `XY2XK3W779`, primary App ID `com.qube.mathapp`, secrets `APPLE_TEAM_ID`/`APPLE_KEY_ID`/`APPLE_CLIENT_ID`/`APPLE_PRIVATE_KEY` set. `user_id` confirmed on `saved_problems` and `custom_flashcards` (PostgREST column check).
3. **Test on device** with throwaway accounts: email, Apple (including cancel), Google and offline. See the plan's Testing Strategy.
4. **Republish** `docs/legal/privacy-policy.html`, `terms-of-service.html` and `support.html` to their existing URLs when the build ships.
5. **Close KI-15** once 1–3 pass.
