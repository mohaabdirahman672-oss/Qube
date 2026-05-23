# Unnecessary Re-render Audit

**Owner:** performance-engineer
**Status:** Pending

---

## Components to Audit
<!-- Every component in src/components/ and src/screens/ -->

## Re-render Causes to Look For
- State updates in parent causing all children to re-render
- Missing `React.memo()` on expensive components
- Inline object/function props creating new references on every render
- Context value changing too frequently
- Missing `useCallback` on handlers passed as props
- Missing `useMemo` on expensive computations

## Findings

| Component | Re-render Cause | Frequency | Fix | Priority |
|---|---|---|---|---|
| FloatingSymbols | 14 animated values — are these isolated? | — | Verify memo | — |
| BottomNav | Re-renders on every tab change? | — | Check memo | — |
| HomeScreen | Large component — any cascading renders? | — | Audit | — |
