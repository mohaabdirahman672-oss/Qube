# Freemium v2 + Premium Subscription — Completion Summary

**Completed:** 2026-09-21
**Plan:** `docs/plans/freemium-paywall-v2.md` (approved same day)
**Known issues:** KI-R21 (resolved/shipped), KI-08, KI-10, KI-11 (open)

---

## What Was Built

A weekly-resetting free tier (10 solves/week, server-enforced) plus a paid Premium
subscription ($9.99/mo or $79.99/yr via RevenueCat, 7-day trial) that unlocks
unlimited solves, AI-generated flashcard worked examples, and — once built —
similar-question generation, homework-question generation, and graphing. Free
users see a blurred/locked preview of gated content rather than nothing, per the
"feature preview mechanic" in the spec, and a paywall that always keeps a visible,
non-paying path back into the app (`or wait until Monday`).

This supersedes the same-day KI-R20 (lifetime, client-side 5-free-solve guest
model) — that model shipped this morning and was replaced this afternoon once the
full freemium spec came in.

## Files Created

- `supabase/migrations/20260921120000_weekly_solve_usage.sql` — weekly cap table + RPCs
- `supabase/migrations/20260921120100_entitlements.sql` — `user_entitlements` table, `is_user_premium()`
- `supabase/migrations/20260921120200_flashcard_worked_examples.sql` — global cache table
- `supabase/functions/weekly-usage/` — read remaining count + reset date; one-time guest→account merge
- `supabase/functions/revenuecat-webhook/` — syncs RevenueCat entitlement events into Supabase
- `supabase/functions/flashcard-example/` — live-generates + caches a worked example per card
- `src/lib/iap.js` — RevenueCat wrapper (configure/login/purchase/restore)
- `src/lib/weeklyUsage.js` — device id + server-backed usage fetch (replaces `freeSolves.js`)
- `src/context/SubscriptionContext.js` — app-wide `isPremium`/`weeklyRemaining`/`resetsOn`
- `src/components/LockedPreview.js` — shared blur+lock mechanic
- `src/screens/PaywallScreen.js` — the paywall screen
- `src/services/flashcardApi.js` — client wrapper for `flashcard-example`

## Files Edited

- `supabase/functions/solve/index.js` — weekly cap check (new), bypassed only for server-verified Premium; existing hourly abuse backstop untouched
- `src/screens/SolveScreen.js` — gate now checks `isPremium`/`weeklyRemaining` instead of `session`/lifetime count; added locked "Similar Questions" and "Graph" stub sections; paywall swapped from `SoftAuthWall` to `PaywallScreen`
- `src/screens/PracticeScreen.js` — flashcard back face now shows a live AI worked example (Premium) or a locked preview (free); added a locked "Homework Set" stub section
- `src/screens/ProfileScreen.js` — new Premium section (status, Manage Subscription, Restore Purchases); fixed Privacy Policy link (see below)
- `App.js` — wrapped the tree in `SubscriptionProvider`
- `src/services/solveApi.js` — carries an error `code` through so the client can distinguish `WEEKLY_LIMIT_REACHED` from other failures
- `supabase/config.toml` — registered the 3 new functions (`weekly-usage`, `flashcard-example` verify_jwt=true; `revenuecat-webhook` verify_jwt=false, its own shared-secret check)
- `.env.example` — documented `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- `package.json` — added `react-native-purchases`, `expo-blur`

## Files Deleted

- `src/lib/freeSolves.js` — fully superseded, no remaining references

## Decisions Made (and why)

See `docs/agent-memory.md` for the full log; summarized:

1. **Calendar-week (Monday 00:00 UTC) reset, not rolling 7-day** — the paywall copy needs a fixed, nameable reset day, which only a calendar model provides.
2. **Signing in no longer bypasses the cap** — only verified Premium does, for guests and signed-in users alike. Deliberate reversal of what KI-R20 shipped hours earlier, confirmed explicitly by the lead.
3. **Anonymous→account usage merges** (capped at 10), not resets — closes the "use 10 as guest, sign in, get 10 more" loop now that sign-in alone no longer unlocks anything.
4. **Similar-question/homework-question generation are UI-stubbed only** — locked-preview mechanic ships, real AI generation is post-launch scope. No prompt, endpoint, or data model existed for either before today.
5. **Flashcard worked examples generate live via AI**, cached globally by card content — scales to the full library instead of covering only the ~36 static cards.
6. **RevenueCat**, not hand-rolled StoreKit — owns receipt validation and trial/renewal state, which matters a lot on a solo-dev timeline.
7. **Server-side entitlement checks only** — `solve`/`flashcard-example` check `public.user_entitlements` (synced by the RevenueCat webhook), never a client-reported flag.

## What Was Verified

Live, against the real Supabase project (not just code review):
- `weekly-usage` returns `{remaining: 10, limit: 10, isPremium: false, resetsOn: <next Monday>}` for a fresh device id
- 10 consecutive real `solve` calls succeed and decrement the count; the 11th returns `402` with `{"code":"WEEKLY_LIMIT_REACHED"}`
- `weekly-usage` reflects `remaining: 0` afterward
- `flashcard-example` correctly rejects an anonymous caller with 401
- `revenuecat-webhook` correctly runs without a Supabase JWT (confirms `verify_jwt = false` took effect) and fails safely with a clear error when its secret isn't configured yet
- All touched/created JS files pass a `babel-preset-expo` parse check; `expo-doctor` reports 18/18 checks passing after the new native dependencies were added
- `supabase db push --linked` applied all 3 new migrations cleanly to the live database

**Not verified** (can't be, yet): an actual purchase, trial start, or cancellation — RevenueCat/App Store Connect aren't configured (KI-08), and `react-native-purchases` is a native module that needs a real build to exercise at all (KI-11, in progress as of this summary).

## Found in Passing (not part of the plan, fixed anyway)

`ProfileScreen.js`'s "Privacy Policy" and "Terms of Service" both linked to the same Notion page, which turned out to be an empty placeholder (title only, no content) — predates this session. Privacy Policy now points at the real policy published earlier today; Terms of Service is still on the broken link (KI-10) since a real ToS document wasn't in scope for this feature, but now matters more given paid subscriptions exist.

## What Still Needs To Be Done

1. **KI-11** — first native build since RevenueCat was added (`eas build --profile development --platform ios`, kicked off same day) — needs a full shakeout pass, not just a successful build, given the KI-R14-R19 crash history.
2. **KI-08** — App Store Connect subscription products + trial offer, RevenueCat project, `EXPO_PUBLIC_REVENUECAT_IOS_KEY` + `REVENUECAT_WEBHOOK_SECRET` set. All need the lead's account access.
3. Apple Sandbox testing: trial start, cancel-before-convert (confirm reverts to free tier, not lockout), renewal.
4. **KI-10** — a real Terms of Service document.
5. Post-launch (explicitly deferred, not forgotten): real similar-question and homework-question generation behind the stubbed locked previews.

## Risks / Known Issues Introduced

- The whole feature is inert until KI-08 is resolved — `initPurchases()` no-ops without a key, and the paywall's trial button will show "Not available yet."
- `react-native-purchases` breaks the "just reload over the dev tunnel" workflow every prior change in this session relied on — any further JS-only iteration still hot-reloads fine, but a purchase flow specifically can only be tested on a real build.
- Weekly cap and entitlement checks fail closed to the free tier on any server error (never fail open to Premium) — intentional, documented inline in `solve/index.js` and `weekly-usage/index.js`, but worth knowing this is a deliberate asymmetry with the existing hourly rate limiter (which fails open).
