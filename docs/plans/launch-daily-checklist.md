# Qube — Daily Launch Checklist

**Start:** Sat, Sep 12, 2026
**Replanned once:** Sat, Sep 19, 2026 — lost the week of Sep 13-18 to illness.
**Replanned again:** Mon, Sep 21, 2026 (morning) — see "Why this got rewritten" below.
**Replanned a third time:** Mon, Sep 21, 2026 (afternoon) — the freemium v2 / Premium subscription feature (KI-R21) landed as a same-day scope addition, on top of an already-tight plan. This is a real 1-2 week addition (payments, App Store Connect + RevenueCat setup, a new native module needing its own build/shakeout — see `docs/plans/freemium-paywall-v2.md`), not a rounding error, so it gets its own line rather than silently eating the buffer like the last two surprises did.
**Target:** Live on the App Store by **Nov 2-5, 2026**, with **Nov 9** as hard outer buffer.
Item numbers `(#N)` reference `docs/plans/beta-launch-countdown.md`.

---

## Why this got rewritten (read once, then ignore)

The Sep 19 version's day labels stopped matching reality almost immediately: the whole Catch-Up Sprint + Phase 2 cleanup (originally spread across Sep 19-27) actually landed in **one day**, Sep 19 — verified against commit timestamps, not against the old checklist's checkmarks. That head start then got absorbed by two things the old plan never budgeted for at all:

1. **The launch-crash saga (Sep 20-21).** The first real EAS build crashed on every launch on a real device. Root-causing it took a full day-plus of device-level debugging (USB crash logs, live Metro tunneling) before finding the actual bug (a missing `fonts` object on the navigation theme) — see `docs/known-issues.md` KI-R14 through KI-R19. Google/Apple sign-in was also broken and got fixed in the same window.
2. **The freemium pivot (Sep 21).** Mid-plan scope change: removed the hard login gate on solving, added a 5-free-solves guest tier with local tracking + a soft paywall, and a one-time welcome prompt. Not in any prior version of this plan.

Net effect: the early finish and the unplanned work roughly cancel out. This version starts the countdown fresh **from today, Sep 21**, carrying forward only what's actually done, verified against code and `docs/known-issues.md` — not against old checkboxes.

---

## Actually done (Phases 0-2, verified against git history)

- [x] Firebase → Supabase-native auth migration (Sep 12)
- [x] OpenAI key moved server-side (`supabase/functions/solve`), per-user rate limiting, EAS secrets fixed (Sep 19)
- [x] `appleAuth.ios.js`/`.js` split fixed, Firebase-era file cleanup, dead `courses_data.js` removed, console.log/dead-code sweep, `known-issues.md` reconciled (Sep 19) — **Phase 2 done**, item #7 (visual consistency pass) deliberately cut pre-launch (decision 2026-09-20)
- [x] First working EAS build (`eas build --profile preview --platform ios`)
- [x] **Launch-crash bug found and fixed** (KI-R17) — confirmed working on real device, all 5 tabs open
- [x] **Google/Apple sign-in fixed** (KI-R19) — confirmed `hasSession: true` live on device for both
- [x] ~~Freemium model — guest solving (5 free, lifetime, client-side)~~ — **superseded same day**, see below
- [x] **Freemium v2 / Premium subscription** (KI-R21/KI-R22) — weekly server-enforced cap (10/week, Monday reset), RevenueCat wrapper, entitlement sync, paywall screen, locked-preview mechanic on flashcards/similar-questions/homework/graphing, flashcard worked examples via live AI + caching. **Fully verified live on the real device**: 10 real scans (camera + upload + practice text) all solved and decremented correctly, 11th correctly triggered the on-device paywall with the exact spec'd copy, Google sign-in still works, no crash regressions. Found and fixed one real bug in the process (a `void`-RPC response-parsing error that mislabeled a successful guest→account merge as a failure). **Still not done**: RevenueCat/App Store Connect product setup (KI-08) — the paywall's trial button correctly shows "Not available yet" until that's configured.
- [x] **Privacy policy drafted and published** — `https://claude.ai/artifact/BJD7cQeJe1ebUFRH9paBPp` (see note under Sep 22 below — this link is private until you change its sharing setting)
- [x] **KI-07 closed** (KI-R23) — password reset deep link fully working live on-device; found and fixed two real bugs along the way (silent sign-in instead of reset screen; silent failure on expired links).
- [x] **KI-09 part 1 done** (KI-R24) — Sentry reinstalled and verified live on-device. Part 2 (`expo-dev-client` removal) deliberately deferred as KI-09b.

- [x] **KI-10 closed** — real Terms of Service drafted and published, wired into `ProfileScreen.js`.

Open items in the Active Issues table: **KI-08** (RevenueCat/App Store Connect not configured), **KI-09b** (`expo-dev-client` removal, deferred).

**Both legal docs are private by default** — before App Store Connect submission, open each and use **Share → "Anyone with the link can view"**: Privacy Policy (`https://claude.ai/artifact/BJD7cQeJe1ebUFRH9paBPp`) and Terms of Service (`https://claude.ai/artifact/YZ2QSANyCGUqDwRo1VsvuS`).

---

## Week A.5 — Subscriptions setup (new, inserted 2026-09-21 afternoon)

Everything here is new scope from KI-R21 and did not exist in any prior version of this plan. Ordered so the native build (the slow, blocking step) starts as early as possible.

- [x] **Mon Sep 21** — `eas build --profile development --platform ios` kicked off and finished (react-native-purchases needs a real native build — every change since KI-R17 had been pure JS/hot-reloadable, this is the first exception).
- [x] **Mon Sep 21** — Full shakeout pass done, on the real device, not just "did it build": splash clears, sign-in works, 10 real scans across all 3 input modes solve correctly, the weekly cap and paywall trigger exactly as designed at solve #11. No KI-R14-R19 regression. See KI-R22.
- [ ] **App Store Connect**: create a subscription group with 2 auto-renewable products (monthly $9.99, annual $79.99) and a 7-day free trial intro offer. **Needs your Apple Developer access — I can't do this step.**
- [ ] **RevenueCat**: create a project, wire it to the App Store Connect products above, get the public iOS API key.
- [ ] Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` via `eas env:set` across all 3 environments (same pattern as KI-R9's fix).
- [ ] Set `REVENUECAT_WEBHOOK_SECRET` as a Supabase function secret; configure the matching webhook URL + Authorization header in the RevenueCat dashboard, pointing at `supabase/functions/revenuecat-webhook`.
- [ ] Apple Sandbox Tester account — test trial start, cancel-before-convert (confirm it reverts to free tier, not a locked-out app), and a renewal.

---

## Week A — Finish Phase 3 (beta-readiness)

- [x] **Mon Sep 21** — Privacy policy drafted and published; freemium v2 + subscriptions (KI-R21) implemented, deployed, and committed. Native build + full on-device shakeout done same day (KI-R22).
- [x] **Tue-Wed Sep 22-23** — **KI-07 closed** (KI-R23): redirect URLs were already registered; testing the real flow on-device surfaced and fixed two actual bugs — a recovery link was silently signing users in instead of showing the reset screen, and an expired link failed with zero feedback. Both fixed, verified live end-to-end (link → reset screen → new password → signed in).
- [ ] **Next** —
  - Open the privacy policy link above → **Share → "Anyone with the link can view"** (it's private by default; App Store Connect and Apple's reviewer both need it to load without a claude.ai login). Keep the URL handy for #11 below and for the App Store Connect "Privacy Policy URL" field.
  - [x] **KI-09 (part 1) done** (KI-R24): Sentry reinstalled, wired into `App.js`, verified live on-device — the privacy policy's crash-reporting claim is now actually true. `expo-dev-client` removal (part 2, KI-09b) deliberately deferred to right before the final production build.
- [ ] Fill out the App Store Connect privacy "nutrition label" (#11), using the published policy as the source of truth for what's declared (email, photos — transient, not stored — device ID, and crash data now that Sentry is reinstalled). **Answers drafted** in `docs/app-store-connect-prep.md` (copy-paste ready); entering them in App Store Connect still needs your account.
- [ ] **Thu Sep 24** — Full manual functional pass, part 1: Home (incl. new welcome prompt), Saved, Solve/Scan (incl. new guest counter + paywall) (#12). *Started early, Sep 23:* Profile done (KI-R25); code-level pass of Saved/Practice/Home done, 9 bugs fixed (KI-R27, `docs/reviews/qa-pass-saved-practice-home.md`). Those fixes still need a device check, and 3 Home copy items are waiting on your decision (stat claims, "Practice Quizzes" card, static "Recent"). Solve/Scan and auth flows are still to do.
- [ ] **Fri Sep 25** — Full manual functional pass, part 2: Practice, Profile, every auth flow end-to-end including the freemium sign-in reset behavior (#12).
- [ ] **Sat Sep 26** — Bump `version`/build number, run `eas build --profile preview`, confirm a clean build (#13).
- [ ] **Sun Sep 27** — Buffer / catch-up day for anything Week A surfaced. **Phase 3 done** if everything above is checked.

## Week B — Internal TestFlight, then open external

- [ ] **Mon Sep 28** — Prepare a reviewer demo account + App Review notes (#19). Note: with the login gate removed, Apple's reviewer can now reach the scan feature *without* your demo account at all — that alone removes the single most common rejection reason for this app category (Guideline 2.1). Still worth having a demo account ready for the Saved/Profile flows.
- [ ] **Tue Sep 29** — Submit an internal TestFlight build (yourself + a couple trusted testers).
- [ ] **Wed Sep 30** — Smoke test the actual TestFlight build (not the dev build) — catches build-specific issues dev builds hide.
- [ ] **Thu Oct 1** — Fix anything the internal round surfaced.
- [ ] **Fri Oct 2** — Invite external TestFlight testers with clear notes on what to test and how to report bugs.
- [ ] **Sat Oct 3** — Start Phase 4 store prep in parallel: plan the screenshot list (#15).
- [ ] **Sun Oct 4** — Buffer.

## Week C — External beta running + store prep in parallel

- [ ] **Mon Oct 5 → Fri Oct 9** — Daily: check Sentry (once reinstalled) + tester feedback, triage, ship a fixed build only if something blocks testing.
- [ ] **Somewhere this week** — Capture final App Store screenshots (#15); write store listing copy — description, subtitle, keywords, support URL (#16); set age rating and finalize App Review notes (#17). **This is also the UI polish window** — 2026-09-21 decision: current UI ships as-is for launch (see #7, cut earlier), but do a visual pass here since screenshots are what Apple/users judge the app by first. Revisit spacing/theme consistency then, not before.
- [ ] **Sat Oct 10 / Sun Oct 11** — Close out the beta window. Final feedback triage (#18) — decide launch-blocker vs. post-launch fix.

**Blocker hiding in this week, flagged 2026-09-21: `support@qube.app` and the `qube.app` domain don't exist yet** — `ProfileScreen.js`'s Contact Us / Delete Account copy and the published privacy policy both already reference this address as if it's live. Register the domain and set up at least email forwarding (Google Workspace, ImprovMX, etc. — doesn't need a full site) *before* App Store submission, ideally before Week C's store listing copy (#16) needs a working support URL too. Not a code task — needs you.

## Week D — Submit + review buffer

- [ ] **Mon Oct 12 / Tue Oct 13** — Ship final fixes from beta triage. Cut the release build.
- [ ] **Wed Oct 14** — Submit to the App Store. Double-check the demo account (#19) and the privacy policy URL (#10) are attached — the two most common first-submission rejection reasons.
- [ ] **Thu Oct 15 → Sun Oct 18** — Apple review window. Respond same-day to any question or rejection — a slow response turns a 2-day review into a 2-week one.

## Week E — Buffer

- [ ] Resubmission buffer if Apple kicked anything back.

**Note on dates below Week A.5**: the day labels in Weeks A-E were written before today's subscriptions scope addition and now run roughly a week-plus later than shown (the header's **Nov 2-5** target / **Nov 9** buffer are the real numbers). Not renumbering every individual day a third time today — that's exactly the kind of low-value busywork that made the Sep 19 version go stale. Treat Weeks A-E as an ordered sequence of steps, not literal dates, until Week A.5 (subscriptions setup) is done and the next real replan can date them properly.

---

## If you fall behind again

Cut in this order, cheapest-to-defer first:
1. ~~Week 2's full visual consistency pass (#7)~~ — already cut on 2026-09-20.
2. Beta window length (Week C) — a few days of real usage beats zero, but don't skip it entirely.
3. Never cut: the privacy policy, or the App Store nutrition label — each either gets the submission rejected outright or ships an inaccurate privacy disclosure.

**This plan has now been rewritten twice** because reality (an illness week, then an unplanned multi-day crash investigation, then a scope pivot) kept outrunning it. Treat "Oct 19-22" as the honest current estimate, not a promise — if another unplanned multi-day item shows up, the right move is another short rewrite like this one, not silently letting the checkboxes drift out of sync with what actually happened again.
