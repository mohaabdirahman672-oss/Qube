# Qube — Daily Launch Checklist

**Start:** Sat, Sep 12, 2026
**Target:** Live on the App Store by **Oct 24-27, 2026** (~6-6.5 weeks — inside the 1-1.5 month window), with Oct 31 as hard outer buffer.
Item numbers `(#N)` reference `docs/plans/beta-launch-countdown.md`.

Check items off as you go. If a day overflows, use the next weekend day as catch-up rather than letting it push the whole week — the schedule already has a few light/buffer days built in for exactly that.

---

## Week 1 — Land current work + kill the OpenAI key exposure (Phase 0 + 1)

- [ ] **Sat Sep 12** — Commit the in-flight Firebase→Supabase auth migration. Manual smoke test on a dev build: email sign up/in, Google sign-in, Apple sign-in (including the cancel path), password reset request.
- [ ] **Sun Sep 13** — Fix anything Saturday's smoke test surfaced. Update `docs/known-issues.md` — it still says Google/Apple sign-in is inactive, which is now false.
- [ ] **Mon Sep 14** — Scaffold a Supabase Edge Function (`supabase functions new solve`). Move `SYSTEM_PROMPT` and the OpenAI `fetch` call from `src/services/solveApi.js` into it, using a server-only env var (no `EXPO_PUBLIC_` prefix).
- [ ] **Tue Sep 15** — Deploy the Edge Function. Update `solveApi.js` to call it instead of OpenAI directly, for both the text path and the image (base64) path.
- [ ] **Wed Sep 16** — Add basic per-user rate limiting to the Edge Function. Remove `EXPO_PUBLIC_OPENAI_API_KEY` from `.env`, `.env.example`, and any app config.
- [ ] **Thu Sep 17** — Move all `EXPO_PUBLIC_*` secrets into EAS build secrets (`eas secret:create`). Confirm `eas build --profile preview` still succeeds with them.
- [ ] **Fri Sep 18** — End-to-end test the scan feature against the new proxy on a real dev build: camera, upload, type-in, error states, and the rate limit actually triggering. **Phase 1 done.**

## Week 2 — Cleanup (Phase 2)

- [ ] **Sat Sep 19** — Fix the `appleAuth.ios.js` / `appleAuth.js` split (#4) — Metro picks `.ios.js` on iOS, so the new conditional logic never runs there today. Reconcile into one consistent implementation.
- [ ] **Sun Sep 20** — Sweep for other Firebase-era leftovers (#5): orphaned imports, `isFirebaseConfigured` references, stale `.env.example` Firebase entries.
- [ ] **Mon Sep 21** — Drop the unused `courses_data.js` (137KB) and its `<script>` tag in `preview.html` (#6).
- [ ] **Tue Sep 22** — Dark-theme/spacing consistency pass: Home + Saved screens (#7, part 1).
- [ ] **Wed Sep 23** — Dark-theme/spacing consistency pass: Solve + Practice + Profile screens (#7, part 2).
- [ ] **Thu Sep 24** — Remove stray `console.log`s, commented-out code, and dead functions — check `ProfileScreen.js` and `AuthContext.js` first since both had the largest recent diffs (#8).
- [ ] **Fri Sep 25** — Finish reconciling `docs/known-issues.md` (#9). Commit "cleanup complete." **Phase 2 done.**

## Week 3 — Beta-readiness (Phase 3, part 1)

- [ ] **Sat Sep 26** — Draft the privacy policy (data collected: email, photos, OpenAI processing, Sentry usage data) (#10).
- [ ] **Sun Sep 27** — Publish the privacy policy to a real URL (e.g. a simple GitHub Pages page); add the link to `app.json` / App Store Connect.
- [ ] **Mon Sep 28** — Fill out the App Store Connect privacy "nutrition label" (#11).
- [ ] **Tue Sep 29** — Full manual functional pass on a real device: Home, Saved, Solve/Scan (#12, part 1).
- [ ] **Wed Sep 30** — Full manual functional pass: Practice, Profile, and every auth flow end-to-end (#12, part 2).
- [ ] **Thu Oct 1** — Bump `version`/build number, run `eas build --profile preview`, confirm a clean build (#13).
- [ ] **Fri Oct 2** — Deep link setup for password reset / email confirmation: Supabase redirect URL config + `expo-linking` scheme (#14, part 1).

## Week 4 — Finish beta prep, open internal then external TestFlight

- [ ] **Sat Oct 3** — Finish deep link handling; test reset/confirm-email flows end-to-end on device (#14, part 2). **Phase 3 done.**
- [ ] **Sun Oct 4** — Prepare a reviewer demo account and write App Review notes on how to reach the scan feature (#19) — do this now, not the day you submit.
- [ ] **Mon Oct 5** — Submit an internal TestFlight build (yourself + a couple trusted testers). Confirm it installs and runs on a real device.
- [ ] **Tue Oct 6** — Smoke test the actual TestFlight build (not the dev build) — this catches build-specific issues dev builds hide.
- [ ] **Wed Oct 7** — Fix anything the internal round surfaced.
- [ ] **Thu Oct 8** — Invite external TestFlight testers. Send them clear notes on what to test and how to report bugs.
- [ ] **Fri Oct 9** — Start Phase 4 store prep in parallel: plan out the screenshot list (#15).

## Week 5 — External beta running + store prep in parallel

- [ ] **Sat Oct 10 → Wed Oct 14** — Daily: check Sentry + tester feedback, triage anything new, ship a fixed build if something's broken badly enough to block testing. (Five short check-ins, not five full workdays.)
- [ ] **Somewhere this week** — Capture final App Store screenshots (#15).
- [ ] **Somewhere this week** — Write store listing copy: description, subtitle, keywords, support URL (#16).
- [ ] **Somewhere this week** — Set the age rating and finalize App Review notes (#17, alongside #19 from Week 4).
- [ ] **Thu Oct 15 / Fri Oct 16** — Close out the beta window. Final feedback triage pass (#18) — decide what's a launch blocker vs. a post-launch fix.

## Week 6 — Submit + review buffer

- [ ] **Sat Oct 17 / Sun Oct 18** — Ship final fixes from beta triage. Cut the release build.
- [ ] **Mon Oct 19** — Submit to the App Store. Double check the demo account (#19) and privacy policy link (#10) are attached to the submission — these are the two most common first-submission rejection reasons.
- [ ] **Tue Oct 20 → Fri Oct 23** — Apple review window. Check daily; if Apple asks a question or rejects, respond same-day rather than batching it — a slow response here is what turns a 2-day review into a 2-week one.

## Week 7 — Buffer

- [ ] **Sat Oct 24 → Tue Oct 27** — Resubmission buffer if Apple kicked anything back. Target: **live by Oct 24-27**, with Oct 31 as the hard outer edge if a rejection cycle eats the buffer.

---

## If you fall behind

Cut in this order, cheapest-to-defer first:
1. Week 2's full visual consistency pass (#7) — do the concrete bugs (#4-6, #8-9), defer polish.
2. Beta window length (Week 5) — 1 week of real usage beats zero, but don't skip it entirely; untested bugs in front of Apple's reviewer are worse than a short beta.
3. Never cut: the OpenAI proxy (Week 1), the privacy policy (#10-11), or the reviewer demo account (#19) — each of those either exposes your API key/billing or gets the submission rejected outright.
