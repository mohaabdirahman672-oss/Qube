# Qube — Daily Launch Checklist

**Start:** Sat, Sep 12, 2026
**Replanned:** Sat, Sep 19, 2026 — lost the week of Sep 13-18 to illness (nothing shipped except the Sep 12 auth-migration commit). Compressing the missed Phase 1 work into the next 5 days instead of resetting the whole calendar back a full week.
**Target:** Live on the App Store by **Oct 26-29, 2026**, with **Nov 2** as hard outer buffer. *(2 days earlier than the Sep 19 replan — cutting the UI consistency pass, #7, pre-launch.)*
Item numbers `(#N)` reference `docs/plans/beta-launch-countdown.md`.

Check items off as you go. If a day overflows, use the next weekend day as catch-up rather than letting it push the whole week — the schedule already has a few light/buffer days built in for exactly that.

---

## Week 1 — Land current work (Phase 0) — mostly lost to illness

- [x] **Sat Sep 12** — Commit the in-flight Firebase→Supabase auth migration. *(Commit `b93e5c7`. Smoke test status unverified.)*
- [ ] ~~Sun Sep 13 → Fri Sep 18~~ — **Lost week.** Nothing shipped. Rolled into the Catch-Up Sprint below.

## Catch-Up Sprint — kill the OpenAI key exposure (Phase 1, compressed)

The security-critical item (#1: client-exposed OpenAI key) never got started. This is never cut — compressing it into 5 days starting today rather than pushing it further out.

- [x] **Sat Sep 19** — Quick fix: updated `docs/known-issues.md` — Google/Apple sign-in and Supabase env vars are now correctly marked resolved (KI-R7), OpenAI key exposure tracked as KI-05. Scaffolded the Supabase Edge Function (`supabase functions new solve`) and moved `SYSTEM_PROMPT` + the OpenAI `fetch` call into `supabase/functions/solve/index.ts`, reading a server-only `OPENAI_API_KEY` env var. Set `verify_jwt = true` so only a signed-in session can call it. Commit `4a0fc15`.
  - Not yet done: function isn't deployed, `solveApi.js` still calls OpenAI directly — that's tomorrow.
  - *(Bonus, already done today: appleAuth.ios.js/appleAuth.js split fixed (#4) + Expo/React/RN dependency bump — commit `78c30cd`.)*
- [x] **Sun Sep 20** — Deployed the Edge Function (`supabase functions deploy solve --use-api`, no Docker needed) and set `OPENAI_API_KEY` as a project secret. Updated `solveApi.js` to call `supabase.functions.invoke('solve', ...)` instead of OpenAI directly. Verified live: text problem, non-math input (`hasMath:false`), and unauthenticated requests correctly rejected with 401. Commit `eb71e15`. *(Image path uses the same function/env vars as text — not separately smoke-tested with a real photo yet.)*
- [ ] **Mon Sep 21** — Add basic per-user rate limiting to the Edge Function. Remove `EXPO_PUBLIC_OPENAI_API_KEY` from `.env`, `.env.example`, and any app config.
- [ ] **Tue Sep 22** — Move all `EXPO_PUBLIC_*` secrets into EAS build secrets (`eas secret:create`). Confirm `eas build --profile preview` still succeeds with them.
- [ ] **Wed Sep 23** — End-to-end test the scan feature against the new proxy on a real dev build: camera, upload, type-in, error states, and the rate limit actually triggering. **Phase 1 done.**

## Week 2 — Cleanup (Phase 2)

**2026-09-20 decision: cutting #7 (dark-theme/spacing consistency pass) pre-launch.** Current UI is good enough to ship — polish it iteratively post-launch instead of blocking the timeline on it. This was already the first thing the plan's own "if you fall behind" section said to cut, so applying it proactively.

- [x] **Sat Sep 19** — ~~Fix the `appleAuth.ios.js` / `appleAuth.js` split (#4)~~ — done early, see Catch-Up Sprint above. Commit `78c30cd`.
- [ ] **Thu Sep 24** — Sweep for other Firebase-era leftovers (#5): orphaned imports, `isFirebaseConfigured` references, stale `.env.example` Firebase entries.
- [ ] **Fri Sep 25** — Drop the unused `courses_data.js` (137KB) and its `<script>` tag in `preview.html` (#6).
- [ ] ~~Sat Sep 26 / Sun Sep 27 — Dark-theme/spacing consistency pass (#7)~~ — **cut pre-launch, deferred to post-launch iteration.**
- [ ] **Sat Sep 26** — Remove stray `console.log`s, commented-out code, and dead functions — check `ProfileScreen.js` and `AuthContext.js` first since both had the largest recent diffs (#8).
- [ ] **Sun Sep 27** — Finish reconciling `docs/known-issues.md` (#9). Commit "cleanup complete." **Phase 2 done.**

## Week 3 — Beta-readiness (Phase 3, part 1)

- [ ] **Mon Sep 28** — Draft the privacy policy (data collected: email, photos, OpenAI processing, Sentry usage data) (#10).
- [ ] **Tue Sep 29** — Publish the privacy policy to a real URL (e.g. a simple GitHub Pages page); add the link to `app.json` / App Store Connect.
- [ ] **Wed Sep 30** — Fill out the App Store Connect privacy "nutrition label" (#11).
- [ ] **Thu Oct 1** — Full manual functional pass on a real device: Home, Saved, Solve/Scan (#12, part 1).
- [ ] **Fri Oct 2** — Full manual functional pass: Practice, Profile, and every auth flow end-to-end (#12, part 2).
- [ ] **Sat Oct 3** — Bump `version`/build number, run `eas build --profile preview`, confirm a clean build (#13).
- [ ] **Sun Oct 4** — Deep link setup for password reset / email confirmation: Supabase redirect URL config + `expo-linking` scheme (#14, part 1).

## Week 4 — Finish beta prep, open internal then external TestFlight

- [ ] **Mon Oct 5** — Finish deep link handling; test reset/confirm-email flows end-to-end on device (#14, part 2). **Phase 3 done.**
- [ ] **Tue Oct 6** — Prepare a reviewer demo account and write App Review notes on how to reach the scan feature (#19) — do this now, not the day you submit.
- [ ] **Wed Oct 7** — Submit an internal TestFlight build (yourself + a couple trusted testers). Confirm it installs and runs on a real device.
- [ ] **Thu Oct 8** — Smoke test the actual TestFlight build (not the dev build) — this catches build-specific issues dev builds hide.
- [ ] **Fri Oct 9** — Fix anything the internal round surfaced.
- [ ] **Sat Oct 10** — Invite external TestFlight testers. Send them clear notes on what to test and how to report bugs.
- [ ] **Sun Oct 11** — Start Phase 4 store prep in parallel: plan out the screenshot list (#15).

## Week 5 — External beta running + store prep in parallel

- [ ] **Mon Oct 12 → Fri Oct 16** — Daily: check Sentry + tester feedback, triage anything new, ship a fixed build if something's broken badly enough to block testing. (Five short check-ins, not five full workdays.)
- [ ] **Somewhere this week** — Capture final App Store screenshots (#15).
- [ ] **Somewhere this week** — Write store listing copy: description, subtitle, keywords, support URL (#16).
- [ ] **Somewhere this week** — Set the age rating and finalize App Review notes (#17, alongside #19 from Week 4).
- [ ] **Sat Oct 17 / Sun Oct 18** — Close out the beta window. Final feedback triage pass (#18) — decide what's a launch blocker vs. a post-launch fix.

## Week 6 — Submit + review buffer

- [ ] **Mon Oct 19 / Tue Oct 20** — Ship final fixes from beta triage. Cut the release build.
- [ ] **Wed Oct 21** — Submit to the App Store. Double check the demo account (#19) and privacy policy link (#10) are attached to the submission — these are the two most common first-submission rejection reasons.
- [ ] **Thu Oct 22 → Sun Oct 25** — Apple review window. Check daily; if Apple asks a question or rejects, respond same-day rather than batching it — a slow response here is what turns a 2-day review into a 2-week one.

## Week 7 — Buffer

- [ ] **Mon Oct 26 → Thu Oct 29** — Resubmission buffer if Apple kicked anything back. Target: **live by Oct 26-29**, with **Nov 2** as the hard outer edge if a rejection cycle eats the buffer.

---

## If you fall behind again

Cut in this order, cheapest-to-defer first:
1. ~~Week 2's full visual consistency pass (#7)~~ — already cut on 2026-09-20.
2. Beta window length (Week 5) — 1 week of real usage beats zero, but don't skip it entirely; untested bugs in front of Apple's reviewer are worse than a short beta.
3. Never cut: the OpenAI proxy (Catch-Up Sprint), the privacy policy (#10-11), or the reviewer demo account (#19) — each of those either exposes your API key/billing or gets the submission rejected outright.
