# Freemium Pricing + Paywall v2 (weekly cap, Premium subscription)

**Status:** Draft — awaiting lead approval. No code written yet per workflow.
**Supersedes in part:** the lifetime-5-free-solves guest model shipped 2026-09-21 (KI-R20). That model stays live until this is approved and built; nothing here has shipped.

---

## Feature

Replace the current lifetime free-solve cap with a **weekly-resetting** free tier, and introduce a paid **Premium** subscription ($9.99/mo or $79.99/yr, 7-day free trial) that unlocks unlimited solves, worked examples on flashcards, similar-question generation, homework-question generation, and (later, v1.2) graphing. Free users see locked/blurred previews of gated content instead of nothing, so they see "the shape of what they're missing."

---

## Where this lands on top of what exists

- `src/lib/freeSolves.js` / `supabase/functions/solve/index.js` (KI-R20, 2026-09-21): guests get 5 **lifetime** solves, tracked in AsyncStorage; signing in currently removes the cap entirely (no Premium concept exists yet). **This plan changes that**: signing in alone will no longer unlock unlimited solving — see Open Question 2.
- `supabase/migrations/20260921000000_solve_rate_limit.sql`: an existing **rolling-window hourly** rate limiter (20/hr authenticated, 10/hr anon), keyed by `user_id` (which is actually "auth uid OR anon device id" today). This is an **abuse backstop**, not a product limit, and its rolling-window shape doesn't fit a calendar-week reset — recommend a new table alongside it, not reusing it (see below).
- `src/screens/PracticeScreen.js` / `src/data/practiceData.js`: flashcards are **static, hand-authored** `{tag, front, back}` objects (36 cards across 4 categories) — there is no "worked example" field, no AI generation, and "problems" are likewise static `{question, answer, difficulty}` — no similar-question or homework-question generation exists anywhere in the codebase today. This spec's "similar-question generation" and "homework-question generation" are **entirely new AI features**, not extensions of something built. Flagging so the scope is visible up front — see Open Question 4.
- No IAP library is installed (`react-native-purchases`, `expo-in-app-purchases`, etc. — none present in `package.json`).

---

## Recommendation 1 — weekly counter model: **calendar week, not rolling 7-day**

The paywall copy itself decides this: *"or wait until [reset day] for more free solves"* only makes sense if there's a fixed, nameable day of the week to reset on. A rolling 7-day-from-first-use window has no such day — it's different per user based on when they first opened the app, so there's nothing to put in `[reset day]`.

**Recommendation:** reset every **Monday 00:00 UTC**, server-side, via `date_trunc('week', now())` as the window key in Postgres — deterministic, no per-user state to track, no timezone bookkeeping for v1.

**Tradeoff being accepted:** a user who first shows up Sunday night gets almost no free-solve runway before the Monday reset; one who shows up Monday morning gets nearly a full week. This is the same tradeoff every calendar-based limit accepts (Duolingo streaks, etc.) and is implied by the spec's own wording — flagging it rather than hiding it.

**New table**, not a reuse of `solve_rate_limits` (different semantics — that one is a sliding abuse guard and should keep doing only that):

```sql
create table public.weekly_solve_usage (
  key           text primary key,   -- auth uid (as text) or anon device id
  week_start    date not null,      -- date_trunc('week', now())::date
  solve_count   int not null default 0
);
```

A `check_and_increment_weekly_solve(p_key text, p_limit int)` security-definer RPC, same shape as the existing rate-limit function, bumps `solve_count` if `week_start` matches this week, else resets it to 1 for the new week.

---

## Recommendation 2 — IAP: **RevenueCat** (`react-native-purchases`), not raw StoreKit

**Why:** RevenueCat owns receipt validation, trial/renewal/cancellation state, and gives one `getCustomerInfo()` entitlement check instead of us hand-building Apple's App Store Server Notifications v2 webhook + receipt verification. For a solo-dev timeline, that's the difference between a few days of integration and a few weeks of payments-infra work — and payments code is the highest-blast-radius, hardest-to-unwind part of this whole feature.

**Tradeoff being accepted:** a third-party dependency in the purchase path, and a second dashboard (RevenueCat) to configure alongside App Store Connect. Free tier covers up to $2.5k MTR, well above pre-launch volume.

**What only you can do** (App Store Connect / Apple Developer access, and a RevenueCat account — neither of which I can create):
- A subscription group with 2 auto-renewable products (monthly $9.99, annual $79.99)
- A 7-day free trial introductory offer configured on the group (Apple bills/times the trial; RevenueCat and our app only reflect its state)
- A RevenueCat project wired to those product IDs, API key issued for the app

**Server-side verification, not client-trusted:** the `solve` function's premium bypass must check a Supabase-side entitlements table kept in sync by a RevenueCat webhook (`supabase/functions/revenuecat-webhook`) — never a client-supplied "I'm premium" flag. This is the same class of mistake as the original bundled-OpenAI-key issue (KI-R8) if done wrong.

---

## Files to Create

| File | Purpose |
|---|---|
| `supabase/migrations/<ts>_weekly_solve_usage.sql` | Table + RPC above |
| `supabase/migrations/<ts>_entitlements.sql` | `user_entitlements` table, synced from RevenueCat webhook |
| `supabase/functions/revenuecat-webhook/index.js` | Receives `INITIAL_PURCHASE`/`RENEWAL`/`CANCELLATION`/`EXPIRATION` events, upserts entitlement state |
| `src/lib/iap.js` | RevenueCat SDK init, `getEntitlement()`, `purchasePackage()`, `restorePurchases()` |
| `src/lib/weeklyUsage.js` | Server-backed remaining-count fetch (replaces the lifetime-count logic in `freeSolves.js`; device-id minting logic is reused) |
| `src/screens/PaywallScreen.js` | The paywall per spec — headline, "Start 7-day free trial" primary CTA, "or wait until [reset day]" secondary |
| `src/components/LockedPreview.js` | Shared blur + lock-icon wrapper, used by flashcard backs, similar-question list items, graphing stub |
| `supabase/functions/similar-questions/index.js` | New AI endpoint — **scope TBD, see Open Question 4** |
| `supabase/functions/homework-questions/index.js` | New AI endpoint — **scope TBD, see Open Question 4** |

## Files to Edit

| File | Change |
|---|---|
| `src/screens/SolveScreen.js` | Swap lifetime gate for weekly gate; remove "signed-in = unlimited" assumption; bypass only on verified Premium |
| `src/screens/PracticeScreen.js` | Flashcard back: formula always visible, worked example under `LockedPreview` for non-Premium; problem list: titles visible, bodies locked |
| `src/context/AuthContext.js` (or new `SubscriptionContext.js`) | Expose `{ isPremium, entitlementLoading, weeklyRemaining, resetsOn }` app-wide |
| `src/screens/ProfileScreen.js` | Subscription status, "Restore Purchases" (Apple requires this for review), manage/cancel deep link |
| `supabase/functions/solve/index.js` | Weekly-cap check (new), bypassed only when server-verified premium; existing hourly abuse backstop stays as-is |
| `app.json` | RevenueCat config plugin |
| `package.json` | `react-native-purchases` (+ optionally `react-native-purchases-ui`), `expo-blur` |
| `src/lib/freeSolves.js` | Superseded by `weeklyUsage.js` — device-id helper reused, lifetime-counter code removed |

---

## Dependencies

- `react-native-purchases` — **new native module**, unlike every change shipped in the last two sessions (all JS-only, hot-reloaded over the existing dev build). This needs a real `eas build`, not a Metro reload, before it can be tested at all.
- `expo-blur` for the locked-preview blur effect.
- App Store Connect subscription products + trial offer (your action).
- RevenueCat account + API key, stored as an EAS public env var (RevenueCat's public SDK key is safe client-side by design) + a webhook secret stored server-side.

---

## Risks

- **New native module resets the "just reload the app" workflow** this session has relied on for every change so far — budget real time for a first-build shakeout, especially given the recent crash-debugging history (KI-R14–R19).
- **Apple subscription review (Guideline 3.1.2)** is its own scrutiny category — missing "Restore Purchases," unclear pricing before purchase, or a broken subscription-management link is a near-certain rejection.
- **Spoofable entitlement checks** if the solve function ever trusts client state instead of the server-synced entitlements table.
- **Similar-question / homework-question generation are unscoped, net-new AI features** — no existing prompt, UI, or data model to extend. Meaningfully larger than the rest of this plan combined if built in full now.
- **Timeline**: this lands on a launch countdown that currently targets Oct 19-22 (`docs/plans/launch-daily-checklist.md`) with zero slack for a payments system. Full scope here is realistically **1-2 weeks**, not a couple of days — this plan does not yet update that checklist; it should be revised once scope is confirmed.

---

## Edge Cases

- Trial started, canceled before converting → reverts to free tier (weekly cap), never loses app access. Natural consequence of checking "active entitlement," not "ever purchased."
- User already redeemed a trial before (reinstall, new device, same Apple ID) → RevenueCat exposes trial eligibility per product; CTA copy should read "Subscribe" instead of "Start free trial" when ineligible, not assume everyone gets a fresh trial.
- Entitlement check fails to load (network) → fail to **free tier**, never to premium — the inverse of how the existing rate-limit check fails open, and deliberately so (a revenue leak vs. an availability blip).
- Guest hits weekly cap, then signs in mid-week → see Open Question 3 (carry-over vs. reset).
- Week-boundary timing (Monday 00:00 UTC exactly) — accepted minor edge, not solved precisely for v1.

---

## Testing Strategy

- Postgres RPC exercised directly (`select`) for week-boundary logic before wiring into the Edge Function — same approach used for the existing rate limiter.
- Apple Sandbox Tester accounts for trial start / cancel-before-convert / renewal — all three need real sandbox runs, not just code review.
- Real `eas build --profile development` (or `preview`) cycle — this cannot be verified over the existing Metro tunnel alone once the native module is added.
- Manual pass: hit weekly cap as guest → correct paywall copy including the actual reset day name; start trial in sandbox → premium unlocks immediately; cancel in sandbox → reverts at trial end, not immediately.

---

## Open Questions

1. **What is N** (free solves per week)? The spec left it as `[N]` — need an actual number. Starting point for discussion: 5/week (close to the current 5-lifetime, but now renewable).
2. **Does signing in without Premium still remove the cap, or does a signed-in free user get the same weekly N as a guest?** Spec implies the latter (only Premium removes the cap) — this **reverses** what shipped 2 days ago. Confirming before touching it since it's a real behavior regression from a user's point of view if not communicated.
3. **Anonymous → signed-in transition**: merge device usage into the account's weekly count (capped at N, closes an obvious abuse loop), or reset to N on sign-in (matches current behavior, but reopens the loop now that sign-in no longer implies unlimited)? Recommend merge.
4. **Similar-question and homework-question generation — full build now, or a "Coming soon" stub like Graphing, given the launch timeline?** Both are unscoped net-new AI features with no prompt or UI drafted yet.
5. **Flashcard worked examples — statically authored for the existing ~36 cards, or AI-generated live** (needs caching so Premium users aren't waiting on OpenAI every flip)? Static is far less engineering risk; live generation is more scalable as the card library grows.
6. **RevenueCat, confirmed — or do you want raw StoreKit** (zero third-party dependency, materially more code and QA surface)?
7. **Is the Monday-00:00-UTC reset acceptable, or does "[reset day]" need to be personalized per user** (e.g., 7 days from when they joined)? Personalizing is a real complexity jump.
8. **Does the 7-day trial apply to both monthly and annual, or only one** (common pattern: trial only on monthly, to nudge annual upgrades without a trial on top of the discount)?
