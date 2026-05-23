# Bottleneck Analysis

**Owner:** scaling-strategist
**Status:** Pending

---

## Known Bottlenecks

| Bottleneck | Where | Impact | Risk Level | Mitigation |
|---|---|---|---|---|
| AI API latency | Scan feature | UX degradation | Medium | Streaming responses, loading states |
| AI API cost at scale | Scan feature | Unit economics | High | Rate limiting, caching, tiered access |
| Supabase free tier limits | Backend | Downtime risk | Medium | Monitor, upgrade plan at threshold |
| Cold start / app load time | React Native | First impression | Medium | Lazy loading, bundle optimization |

## Bottlenecks to Research
<!-- Any additional bottlenecks the strategist identifies -->

## Priority Order
<!-- Ranked by: impact × probability × time-to-fix -->
