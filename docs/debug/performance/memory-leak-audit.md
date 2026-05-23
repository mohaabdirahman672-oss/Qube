# Memory Leak Audit

**Owner:** performance-engineer
**Status:** Pending

---

## Common React Native Memory Leak Patterns to Check
- `Animated.loop()` not stopped when component unmounts
- `setInterval` / `setTimeout` not cleared in useEffect cleanup
- Event listeners added but never removed
- Supabase subscriptions not unsubscribed
- Large images not released from memory

## Component-by-Component Audit

| Component | Potential Leak | useEffect Cleanup Present | Status |
|---|---|---|---|
| FloatingSymbols | 14x Animated.loop() | ✅ setTimeout cleared | Verify loop stops on unmount |
| HomeScreen | Multiple Animated.loop() for glow | — | Audit needed |
| BottomNav | Animated.sequence on press | — | Audit needed |

## Findings

| Component | Leak Type | Root Cause | Fix |
|---|---|---|---|
| | | | |
