# Agent Memory — Architecture Decisions

> Teammates: read this before starting any new work. Add decisions here after completing work.

---

## Project Identity

- App name: **Qube**
- Tagline: *Math. Every Dimension.*
- Target: iOS-first, App Store / TestFlight
- Status: Early development — HomeScreen built, auth and navigation not yet implemented

---

## Design System

- Theme file: `src/theme.js`
- Background: `#06091A` (deep navy)
- Primary brand: Blue `#4F8EF7` + Gold `#F59E0B`
- Accent: Purple `#8B5CF6`
- All screens must use dark theme — no light mode yet
- Typography scale defined in `theme.js` — use it, don't hardcode font sizes
- Spacing scale defined in `theme.js` — use it, don't hardcode margins/padding

## Component Conventions

- Use `SafeAreaView` with `edges` prop for screen-level components
- Use `StatusBar` style `light-content` on all screens
- Animated entrance sequences are standard — match the HomeScreen pattern
- Press animations use `Animated.spring` with `tension: 200, friction: 8`
- All gradients use `expo-linear-gradient`
- Icons use `@expo/vector-icons` (Ionicons)

## File Structure Conventions

```
src/
  screens/       # one file per screen
  components/    # shared UI components
  context/       # React context providers
  hooks/         # custom hooks
  lib/           # third-party client setup (supabase, etc.)
  services/      # API calls and business logic
  navigation/    # navigation config
theme.js         # design tokens
courses_data.js  # static course content
```

## Known Patterns

- Bottom nav state managed in parent (`activeTab` + `onTabPress` props)
- FloatingSymbols renders on top of background, below all content, `pointerEvents="none"`
- Glow effects use absolute-positioned Views with low opacity + border radius

---

## Decisions Log

| Date | Decision | Reason | Made By |
|---|---|---|---|
| 2026-04-27 | Used Expo SDK 54 with blank template | Latest stable SDK | Initial setup |
| 2026-04-27 | Dark navy theme (#06091A) | Premium math app aesthetic | UI design |
| 2026-04-27 | Gold + Blue brand colors | Contrast, premium feel | UI design |
| 2026-05-18 | Enabled CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS | Multi-agent development | Lead |
| 2026-09-21 | Weekly free-solve cap (10/week) enforced server-side, calendar-week (Monday 00:00 UTC), NOT a rolling 7-day window | Paywall copy needs a fixed, nameable reset day ("wait until Monday"); a rolling window has no such day. Table: `weekly_solve_usage`, kept separate from the existing hourly abuse-backstop `solve_rate_limits` (different semantics, don't conflate) | Lead + Claude (docs/plans/freemium-paywall-v2.md) |
| 2026-09-21 | Signing in alone no longer bypasses the solve cap — only a verified Premium entitlement does | Deliberate reversal of the 2026-09-21-morning KI-R20 behavior; closes an abuse loop now that free tier isn't meant to be unlocked by an account alone | Lead |
| 2026-09-21 | RevenueCat (`react-native-purchases`) chosen over hand-rolled StoreKit for subscriptions | Owns receipt validation + trial/renewal/cancellation state; avoids building Apple's App Store Server Notifications v2 handling from scratch on a solo-dev timeline | Lead + Claude |
| 2026-09-21 | Server-side entitlement checks (`public.user_entitlements`, synced via RevenueCat webhook) are the only source of truth `solve`/`flashcard-example` trust — never a client-reported premium flag | Same mistake class as the pre-KI-R8 bundled OpenAI key; a client can always lie | Claude |
| 2026-09-21 | Similar-question generation, homework-question generation, and graphing are UI-stubbed (locked/blurred preview only) for launch, not built | Unscoped net-new AI features with no existing prompt/UI to extend; deferred to post-launch to protect the timeline | Lead |
| 2026-09-21 | Flashcard worked examples are AI-generated live and cached globally (`flashcard_worked_examples`, keyed by card content), not hand-authored | Scales to the full course library automatically instead of covering only the ~36 static cards | Lead |
