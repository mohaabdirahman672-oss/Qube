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
