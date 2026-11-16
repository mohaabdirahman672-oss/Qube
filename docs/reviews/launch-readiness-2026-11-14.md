# Launch readiness: 2026-11-14

> No paid API calls, no deploys, no production data touched. Everything below was built or verified with local tools, mocks and free services. Submit target: **Dec 15** (31 days).

## 1. Work done today (in the order you asked)

| # | Task | Result |
|---|---|---|
| 1 | **Math keyboard** | Sessions 1–6 built: keypad, templates with slots, all 5 tabs, long-press, History, ABC (Plan B), scan correction. **29/29 browser checks.** `docs/reviews/math-keyboard.md` |
| 2 | **UI/UX** | Screenshot review of every screen at iPhone 15 and iPhone SE sizes. 4 fixes (below). The established design is unchanged. |
| 3 | **Account deletion** | Server function tested offline (**10/10**): auth, deletion order, never half-deleted, Apple revoke JWT, can't target another user, Apple and RevenueCat outages don't block deletion. The app flow was reviewed. |
| 4 | **Authentication** | **16/16** mocked browser checks: validation, wrong password, unconfirmed email, offline, sign-in, session survives reload, sign-up (validation, existing account, check-your-email), password reset. Deep-link parser unit-tested. |
| 5 | **Free-tier limits** | Already built. Now tested: server **11/11** (20/week, hourly ceilings 10/20/100, Premium bypass, charge only after success, a guest can't skip the cap) and app **3/3** (paywall at 0 before any request; a stale count corrected by the server's 402). |
| 6 | **Offline tests** | `npm test` (32 unit + server tests), `npm run test:web` (48 browser checks), expo-doctor 14/15 (a metadata warning only), and the iOS bundle builds. `tests/README.md` |
| 7 | **Launch readiness** | This document. |

### Bugs found and fixed today
1. **Home's welcome prompt popped up over other tabs.** It was a global modal, so it appeared over Solve or Saved if you switched tabs during Home's opening animation. It now waits until Home is on screen.
2. **Saved was a dead end for guests.** "Sign in to save problems" had no button. Added **Create free account** and **I already have an account**, plus **Solve a problem** on the empty list. The header now matches the other screens.
3. **The blue "Q" placeholder** is replaced by the real cube logo on Home, Login and the Profile footer (Part H).
4. **Solve's loading text** now moves through stages ("Reading your problem…" → "Working through the steps…" → "Checking the answer…"), so slow solves don't look frozen.
5. Keyboard bugs caught by the tests before shipping: ← → ⌫ did nothing on web (fixed with `onPress`/`onLongPress`), a MathLive font-path error, the opaque white field background, and a double space in converted problems.

## 2. Still open before submission

### Needs your phone (can't be tested on web)
- [ ] **Dev build** with the keyboard's new native modules (`react-native-webview`, `expo-haptics`). Free EAS tier. **Needs your go-ahead.**
- [ ] Keyboard on device: the iOS keyboard stays hidden, tap to place the cursor, fast typing, long-press, haptics, VoiceOver.
- [ ] Account deletion with throwaway accounts: email, Apple (including Cancel on the Apple sheet), Google. Then close KI-15.
- [ ] Sign Out button (it's a native confirm dialog), Google and Apple sign-in, and the email confirm and reset links opening the app.
- [ ] The full D1 pass on the production build.

### Code waiting on a deploy you approve (deploying is free)
- [ ] **Re-solve free within 2 minutes** after editing a misread scan (your decision). Charging is on the server, so `solve` needs a small change and a deploy.
- [ ] **`problemLatex`** from `solve`, for exact scan correction. The app already uses it when it arrives.
- Neither blocks launch. Scan correction works today using the plain-text restatement.

### Final-build items (Part H and F1)
- [ ] Remove the BETA badges (Home, Profile ×2, "Version 1.0.0 · Beta"). Kept for now because TestFlight builds are betas.
- [ ] Remove `expo-dev-client` (KI-09b).
- [ ] Restore Supabase if it has auto-paused, right before testing and submitting.
- [ ] Republish the three hosted legal pages with the "Profile → Settings → Delete Account" wording, and set them to "Anyone with the link".
- [ ] Production build **after** the keyboard is merged (D2), then TestFlight (D3).

### App Store Connect (you)
- [ ] **A1 Paid Apps Agreement:** blocked on Apple's entity-name fix. Check weekly. **The biggest schedule risk.**
- [ ] C1 subscriptions, C2 IAP key, C3 RevenueCat, then C4–C6 (sandbox needs A1).
- [ ] E1 screenshots (6.9", after the production build so they show the keyboard and logo), E2 listing text, E3 privacy, age rating and review notes.

### App Store requirements check
| Requirement | Status |
|---|---|
| Account deletion in the app (5.1.1(v)) | ✅ Built and deployed, server tested. Needs the on-device test |
| Sign in with Apple, since Google is offered (4.8) | ✅ |
| Subscription disclosure, Terms/Privacy links, restore (3.1.2) | ✅ Paywall reviewed today |
| Camera and photo usage strings | ✅ `app.json` |
| Export compliance (`ITSAppUsesNonExemptEncryption: false`) | ✅ |
| No dead UI or placeholder content (2.1) | ✅ Saved dead end fixed today. Locked features say "coming soon" |
| Privacy Policy and Support URLs | ✅ Exist. ⚠️ must be set to public before E2 |
| Demo account for review | ✅ A3 |
| Privacy manifest (required-reason APIs) | ⚠️ Expo SDK 53 and the libraries ship their own. Check for an ITMS-91053 email after the first upload |
| iPhone only (`supportsTablet: false`) | ✅ No iPad screenshots needed |

## 3. Deferred-cost checklist (paused until you approve)
| Item | Why it costs | Rough cost | Blocks launch? |
|---|---|---|---|
| **G3 model comparison** (solve-quality Q1) | OpenAI calls on the eval key | ~$2–5 | No, but it's the fix for the 2/75 confident-wrong answers |
| **G3 Q2 verification + model change**, then deploy | A reasoning model or the retry raises OpenAI cost per solve | Decided by the comparison | No |
| **On-device testing that solves problems** (D1, keyboard pass) | Each real solve uses the production OpenAI key | ~$0.01 per solve | No |
| **Supabase Pro** during review week and launch | The free tier pauses after ~7 days idle | $25/month (or a free weekly ping) | Risky if it pauses during review |
| EAS builds | **Free tier** covers our dev and production builds. Paid only for priority queueing | $0 | No |
| RevenueCat, Sentry | Free tiers at our size | $0 | No |

## 4. Recommended next steps
1. **You:** say go for the **dev build** (free EAS tier). While it builds (~20–40 min), do C1 (create the subscriptions; possible before A1).
2. **On the build:** the keyboard pass and the three throwaway-account deletion tests, about 20 minutes. Each solve costs about a cent.
3. **Me:** session 7 polish from your on-device notes, then the final-build items.
4. **When you're ready to spend about $5:** the G3 model comparison.
