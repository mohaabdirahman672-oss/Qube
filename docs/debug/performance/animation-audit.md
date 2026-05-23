# Animation Performance Audit

**Owner:** performance-engineer
**Status:** Pending

---

## Rule: All animations must use `useNativeDriver: true` unless they animate layout properties

## Layout properties that CANNOT use useNativeDriver
- width, height, padding, margin, flex
- top, left, right, bottom (use transform: translateX/Y instead)

## Animations Inventory

| Component | Animation | useNativeDriver | Layout Property? | Status |
|---|---|---|---|---|
| HomeScreen | logoScale spring | ✅ true | scale — OK | — |
| HomeScreen | greetTranslate spring | ✅ true | translateY — OK | — |
| HomeScreen | glow pulse loop | ✅ true | opacity — OK | — |
| FloatingSymbols | translateY loop | ✅ true | translateY — OK | — |
| BottomNav | scaleAnim spring | ✅ true | scale — OK | — |

## Interruptible Animations
<!-- Are animations properly stoppable? Do they clean up correctly? -->

## Overuse of Animations
<!-- Are there too many simultaneous animations? Can any be simplified? -->

## Findings

| Component | Animation Issue | Root Cause | Fix |
|---|---|---|---|
| | | | |
