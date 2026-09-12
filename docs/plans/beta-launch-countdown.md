# Qube — Beta & Launch Countdown

**Created:** 2026-09-12
**Owner:** Lead (mohaa)
**Scope:** What has to happen between now and (a) TestFlight beta, (b) public App Store launch.

---

## Where we actually are (verified against code, not the June audit)

`docs/plans/qube-next-phase-audit.md` (2026-06-04) is stale — treat it as history, not status. Current reality:

- ✅ Navigation mounted (`App.js` → `AuthProvider` → `NavigationContainer` → `RootNavigator`)
- ✅ All 5 screens built (Home, Saved, Solve, Practice, Profile)
- ✅ Supabase email/password + Google + Apple sign-in implemented
- ✅ Sign-out button exists (KI-01 resolved)
- ✅ `firstName` crash bug gone
- ✅ Sentry wired in `App.js`
- 🔄 **In progress, uncommitted right now**: Firebase → Supabase-native migration for Apple/Google sign-in (`AuthContext.js`, `appleAuth.js`, `firebase.js` deleted, `GoogleService-Info.plist` / `google-services.json` added)
- ❌ **OpenAI key is bundled client-side** (`EXPO_PUBLIC_OPENAI_API_KEY` in `src/services/solveApi.js`) — extractable from the shipped binary via `strings`/decompile. No Supabase Edge Function proxy exists.
- ❌ No privacy policy or terms found in the repo
- ❌ No App Store screenshots found
- ⚠️ KI-02/KI-03 still open: password reset & email confirmation links open the browser, not the app (no deep link handling)
- EAS submit config already has `appleTeamId` and `ascAppId` — App Store Connect record likely already exists

---

## Phase 0 — Land what's in flight (today)

Nothing else should proceed until the current diff is committed and smoke-tested — it touches the entire auth surface.

1. Finish + commit the Firebase→Supabase auth migration currently sitting uncommitted.
2. Manual smoke test on a dev build (not Expo Go — Apple/Google sign-in need a native build):
   - Email/password sign up, sign in, sign out
   - Google sign-in
   - Apple sign-in (including cancel path — the `code === '1001'` branch)
   - Password reset request
3. Update `docs/known-issues.md` — it still says "Google/Apple Sign-In not active," which is no longer true.

---

## Phase 1 — Launch blockers (must fix before *any* tester, including internal TestFlight)

| # | Item | Why it blocks | Est. |
|---|---|---|---|
| 1 | **OpenAI key exposure** — build a Supabase Edge Function that proxies `/solve`, move `SYSTEM_PROMPT` + OpenAI call server-side, strip `EXPO_PUBLIC_OPENAI_API_KEY` from the client bundle | A shipped binary (even to 5 TestFlight testers) makes the key extractable and billable by anyone who pulls it apart. You already decided this gates beta. | 2-4 days |
| 2 | **Production secrets in EAS**, not just local `.env` | `EXPO_PUBLIC_*` vars must be set as EAS build secrets or they won't exist in the built binary at all — right now they only live in your local `.env`. | 0.5 day |
| 3 | **Rate limiting / abuse guard on the proxy** | Once OpenAI calls go through your own server (Phase 1.1), an unauthenticated or unlimited endpoint is a fresh way to burn your API budget. Tie it to the Supabase session. | folded into #1 |

## Phase 2 — UI & Code Cleanup

Its own phase, run after the security/auth blockers are done and before you hand a build to anyone outside your own devices. Goal: nothing embarrassing or confusing in front of testers, no dead code left over from the Firebase→Supabase migration.

| # | Item | Why | Est. |
|---|---|---|---|
| 4 | **Fix `appleAuth.ios.js` / `appleAuth.js` split** | `appleAuth.ios.js` unconditionally re-exports the native module, and Metro picks `.ios.js` over `.js` on iOS — so the new conditional/error-handling logic you just added in `appleAuth.js` never actually runs on a real iPhone. Reconcile the two (either move the logic into `.ios.js` or delete the split and keep one file with the `Platform.OS` check). | 0.5 day |
| 5 | **Sweep for other Firebase-era leftovers** | `firebase.js` is deleted but check for orphaned imports, `isFirebaseConfigured` references, or `.env.example` entries (`EXPO_PUBLIC_FIREBASE_*`) that no longer apply now that auth is fully Supabase-native. | 0.5 day |
| 6 | **Drop unused `courses_data.js`** (137KB) | Confirmed unused by any `src/` screen — only `preview.html` still references it. Remove the `<script>` tag from `preview.html`, and delete the file if the HTML prototype no longer needs it either. | 0.5 day |
| 7 | **Dark-theme / spacing consistency pass across all 5 screens** | Screens were built across several sessions/commits (HomeScreen → Practice → Solve/Saved/Profile) — check they actually share `theme.js` tokens consistently and nothing regressed visually. | 1 day |
| 8 | **Remove stray console.logs / commented-out code / dead functions** | Standard pre-beta hygiene; also worth a quick check of `ProfileScreen.js` and `AuthContext.js` since both had large recent diffs. | 0.5 day |
| 9 | **Reconcile `docs/known-issues.md`** | Still says Google/Apple sign-in is inactive — false as of the current migration. Update resolved/open status so it's trustworthy again. | 0.25 day |

## Phase 3 — Beta-readiness (needed before external TestFlight, not before internal dev testing)

| # | Item | Why | Est. |
|---|---|---|---|
| 10 | **Privacy policy URL** | Apple requires this for any app in TestFlight external testing, and Qube collects email (auth), photos (camera scan), and sends problem images to OpenAI — all need disclosure. | 0.5-1 day |
| 11 | **App privacy "nutrition label" in App Store Connect** | Declare data types collected (email, photos, usage data via Sentry) — required before you can even invite external testers. | 0.5 day |
| 12 | **Full manual pass over all 5 tabs on a real device** | Type-check/tests don't verify UX; camera scan, save, practice flip, profile edit all need eyes-on. This is a functional pass — the cosmetic pass already happened in Phase 2. | 1 day |
| 13 | **Bump `version`/build number and confirm `eas build --profile preview` succeeds** | Sanity-check the actual build pipeline before depending on it for testers. | 0.5 day |
| 14 | KI-02/KI-03 (deep links for reset/confirm email) | Not a hard blocker — browser fallback works — but a bad first impression for beta testers. Recommend fixing before external (not internal) beta. | 1-2 days |

## Phase 4 — Launch-readiness (App Store submission, beyond beta)

| # | Item | Why | Est. |
|---|---|---|---|
| 15 | **App Store screenshots** (6.7", 6.5" minimum) | None exist yet; required for submission. | 1 day |
| 16 | **Store listing copy** — description, subtitle, keywords, support URL | Required metadata. | 0.5 day |
| 17 | **Age rating + App Review notes** | Camera use + AI content generation both get review scrutiny; a short reviewer note on how the scan feature works avoids a rejection round-trip. | 0.5 day |
| 18 | **Beta feedback triage window** | Budget real time to fix what TestFlight testers surface before submitting — don't submit same-day as beta close. | 3-7 days (parallel with testing) |
| 19 | **Reviewer demo account + login note** | App is auth-gated (Supabase sign-in required to reach the scan feature). Apple reviewers need working demo credentials and a note on how to reach the AI scan flow, or first submission gets bounced on Guideline 2.1 — this is the single most common rejection reason for login-gated apps. | 0.5 day, must be ready *before* submitting |

---

## Target: launch within October 2026

Today is 2026-09-12, so there's ~7 weeks of runway to Oct 31 — enough for the **solid** path plus a real beta window and buffer for at least one Apple review round-trip (very common on a first submission). Suggested calendar:

| Week of | Work |
|---|---|
| Sep 12 | Phase 0 (land + smoke test current diff) + start Phase 1 |
| Sep 15-19 | Finish Phase 1 (OpenAI proxy, EAS secrets, rate limit) |
| Sep 22-26 | Phase 2 in full (cleanup) + start Phase 3 (privacy policy, nutrition label can run in parallel) |
| Sep 29 | Internal TestFlight build out; item 19 (reviewer demo account) prepped now too |
| Sep 29 - Oct 10 | External TestFlight beta window (~1.5-2 weeks of real usage, not just "build works") |
| Oct 6-10 | Phase 4 store prep (screenshots, listing, review notes) in parallel with the tail of beta |
| Oct 10-13 | Triage beta feedback, ship fixes |
| Oct 14 | Submit to App Store |
| Oct 14-21 | Apple review + buffer for one rejection/resubmit cycle |
| By Oct 24-28 | Live on the App Store, with a week of slack before Oct 31 |

**Biggest risk to this date isn't the code — it's Apple review.** A first submission for an auth-gated, AI-camera app has a real chance of at least one rejection round (missing demo account, privacy label mismatch, or reviewer can't reach the scan feature). Budget for that round-trip rather than assuming same-week approval, which is why item 19 and the Oct 14-21 buffer are in the plan explicitly.

---

## Two countdown shapes

### Aggressive (~1.5 weeks to internal TestFlight)
Fix Phase 1 in full, do a *reduced* Phase 2 (items 4-5-6 only — the concrete bugs/dead code, skip the full visual consistency pass), skip Phase 3 item 14 (deep links). Ship internal TestFlight to a small trusted group who won't be thrown by a browser-fallback email link.

- Day 1: Phase 0 (land + smoke test current diff)
- Day 2-4: Phase 1 (OpenAI proxy, EAS secrets, rate limit)
- Day 5-6: Phase 2 items 4, 5, 6 (appleAuth split, Firebase leftovers, dead courses_data.js)
- Day 7: Phase 3 items 12-13 (manual functional pass, build bump)
- Day 8-9: Phase 3 items 10-11 (privacy policy + nutrition label), submit internal TestFlight build

### Solid (~3 weeks to external TestFlight)
Every item in Phase 1, 2, and 3 — including the full visual consistency pass and deep links — before any tester outside your own devices sees a build.

- Week 1: Phase 0 + Phase 1
- Week 2: Phase 2 in full (all 6 items) + Phase 3 items 10-11 (privacy policy/labels, can run in parallel)
- Week 3: Phase 3 items 12-14 (manual pass, build bump, deep links), buffer for whatever the manual pass turns up, then open external TestFlight

**Launch (App Store submission)** follows either path by roughly 1-2 weeks: Phase 4 prep (screenshots, listing, review notes) can happen *during* the TestFlight window since none of it blocks beta — then submit once beta feedback is triaged and Phase 1/2/3 fixes are validated in the wild.

---

## Open questions for you

- Internal-only TestFlight first (yourself + a couple people), or straight to external testers?
- Who writes the privacy policy — template + you fill in specifics, or is there existing legal copy to reuse?
- Any target date driving this (event, semester start, etc.) that should set the countdown's actual calendar dates rather than "day N" offsets?
