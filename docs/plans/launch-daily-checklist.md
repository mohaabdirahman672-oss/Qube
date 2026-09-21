# Qube — Daily Launch Checklist

**Start:** Sat, Sep 12, 2026
**Replanned once:** Sat, Sep 19, 2026 — lost the week of Sep 13-18 to illness.
**Replanned again:** Mon, Sep 21, 2026 — see "Why this got rewritten" below. This version replaces all prior day-by-day dates; treat the Sep 19 version as history only.
**Target:** Live on the App Store by **Oct 19-22, 2026**, with **Oct 26** as hard outer buffer.
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
- [x] **Freemium model** — guest solving (5 free, `FREE_SOLVE_LIMIT` in `src/lib/freeSolves.js`), paywall, welcome prompt, anon-caller support in the solve Edge Function, deployed — **pending your on-device verification** (see message above this one)
- [x] **Privacy policy drafted and published** — `https://claude.ai/artifact/BJD7cQeJe1ebUFRH9paBPp` (see note under Sep 22 below — this link is private until you change its sharing setting)

Only one open item remains in the Active Issues table: **KI-07** — a 2-minute manual Supabase Dashboard step (add `qube://reset-password` and `qube://` to the redirect URL allow-list).

---

## Week A — Finish Phase 3 (beta-readiness)

- [x] **Mon Sep 21 (today)** — Privacy policy drafted and published; freemium model implemented, deployed, and committed.
- [ ] **Tue Sep 22** —
  - Open the privacy policy link above → **Share → "Anyone with the link can view"** (it's private by default; App Store Connect and Apple's reviewer both need it to load without a claude.ai login). Keep the URL handy for #11 below and for the App Store Connect "Privacy Policy URL" field.
  - On-device: verify the freemium flows (welcome prompt once, guest solve counter, paywall at 5, sign-in unlocks it) — checklist is in my last message.
  - KI-07: add the two redirect URLs in the Supabase Dashboard (2 min), then test password reset / email confirm end-to-end on-device.
  - **Decide KI-09 now, not later**: the privacy policy states Qube uses crash/diagnostic reporting. Either reinstall `@sentry/react-native` before submission (so the policy is accurate) or strip that clause from the policy if you're shipping without it. Recommend reinstalling — it's a bounded, well-understood task (see KI-09) and you'll want crash visibility once real users hit the store.
- [ ] **Wed Sep 23** — Fill out the App Store Connect privacy "nutrition label" (#11), using the published policy as the source of truth for what's declared (email, photos — transient, not stored — device ID, and crash data if KI-09 lands as reinstalled).
- [ ] **Thu Sep 24** — Full manual functional pass, part 1: Home (incl. new welcome prompt), Saved, Solve/Scan (incl. new guest counter + paywall) (#12).
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
- [ ] **Somewhere this week** — Capture final App Store screenshots (#15); write store listing copy — description, subtitle, keywords, support URL (#16); set age rating and finalize App Review notes (#17).
- [ ] **Sat Oct 10 / Sun Oct 11** — Close out the beta window. Final feedback triage (#18) — decide launch-blocker vs. post-launch fix.

## Week D — Submit + review buffer

- [ ] **Mon Oct 12 / Tue Oct 13** — Ship final fixes from beta triage. Cut the release build.
- [ ] **Wed Oct 14** — Submit to the App Store. Double-check the demo account (#19) and the privacy policy URL (#10) are attached — the two most common first-submission rejection reasons.
- [ ] **Thu Oct 15 → Sun Oct 18** — Apple review window. Respond same-day to any question or rejection — a slow response turns a 2-day review into a 2-week one.

## Week E — Buffer

- [ ] **Mon Oct 19 → Thu Oct 22** — Resubmission buffer if Apple kicked anything back. **Target: live by Oct 19-22**, with **Oct 26** as the hard outer edge.

---

## If you fall behind again

Cut in this order, cheapest-to-defer first:
1. ~~Week 2's full visual consistency pass (#7)~~ — already cut on 2026-09-20.
2. Beta window length (Week C) — a few days of real usage beats zero, but don't skip it entirely.
3. Never cut: the privacy policy, the App Store nutrition label, or KI-07/KI-09 if Sentry ends up declared in the policy — each either gets the submission rejected outright or ships an inaccurate privacy disclosure.

**This plan has now been rewritten twice** because reality (an illness week, then an unplanned multi-day crash investigation, then a scope pivot) kept outrunning it. Treat "Oct 19-22" as the honest current estimate, not a promise — if another unplanned multi-day item shows up, the right move is another short rewrite like this one, not silently letting the checkboxes drift out of sync with what actually happened again.
