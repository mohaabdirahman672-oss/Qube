# Team: strategy-core

**Size:** 4 teammates
**Model:** Claude Sonnet (all teammates)
**Purpose:** Define Qube's product strategy, growth loops, monetization model, and scaling plan
**Plan approval required:** Yes — no teammate publishes final strategy without lead review

---

## Spawn Prompt (copy this to launch the team)

```
Create an agent team called "strategy-core" with 4 teammates, all using Sonnet.
Require plan approval before any teammate publishes final strategy documents.

Before starting, all teammates must read:
- CLAUDE.md
- docs/agent-memory.md
- docs/known-issues.md
- docs/research/ (all subfolders — use research-lab findings to inform strategy)

Global rules for this team:
- Prioritize launch speed over perfection
- Prioritize retention over acquisition
- Avoid overengineering — recommend the simplest thing that works at scale

All 4 teammates work in parallel. Cross-domain findings should be shared via messages.

---

TEAMMATE 1 — Product Strategist

Name: product-strategist
Ownership: docs/strategy/product/

Responsibilities:
- Define the Qube MVP scope — what is the minimum set of features needed to launch on the App Store
- Ruthlessly prevent feature bloat — flag anything that should be cut from v1
- Prioritize the feature backlog (must-have vs. nice-to-have vs. post-launch)
- Create a realistic launch roadmap with phases (MVP → v1.1 → v2)
- Define Qube's core value proposition in one sentence

Output files:
- docs/strategy/product/mvp-scope.md — exactly what ships in v1
- docs/strategy/product/feature-backlog.md — full prioritized list
- docs/strategy/product/launch-roadmap.md — phased timeline
- docs/strategy/product/value-proposition.md — the core "why Qube" statement

Completion message: "product strategy complete"

---

TEAMMATE 2 — Growth Strategist

Name: growth-strategist
Ownership: docs/strategy/growth/

Responsibilities:
- Design viral loops specific to Qube (share solution, challenge a friend, classroom sharing)
- Design a retention system: what brings users back daily/weekly
- Design a referral system: how users invite others
- Optimize engagement touchpoints: push notifications, streaks, milestones, social proof
- Identify Qube's primary growth channel (organic App Store, TikTok/social, school partnerships)

Output files:
- docs/strategy/growth/viral-loops.md — specific viral mechanics to build
- docs/strategy/growth/retention-system.md — day 1/7/30 retention plan
- docs/strategy/growth/referral-system.md — referral mechanics and incentives
- docs/strategy/growth/engagement-touchpoints.md — notification strategy, streak design, milestones
- docs/strategy/growth/growth-channels.md — ranked primary and secondary growth channels

Completion message: "growth strategy complete"

---

TEAMMATE 3 — Monetization Strategist

Name: monetization-strategist
Ownership: docs/strategy/monetization/

Responsibilities:
- Design the subscription model (tiers, pricing, what's free vs. paid)
- Optimize pricing for the education market (student pricing, family plans, annual vs. monthly)
- Design the paywall experience (where it appears, how it converts without annoying)
- Design the free trial system (length, what's included, conversion triggers)
- Define the long-term monetization roadmap (v1 → institutional/school sales)

Output files:
- docs/strategy/monetization/subscription-model.md — tiers, features per tier, pricing
- docs/strategy/monetization/pricing-strategy.md — price points with rationale
- docs/strategy/monetization/paywall-design.md — where paywalls appear, UX approach
- docs/strategy/monetization/free-trial.md — trial design and conversion strategy
- docs/strategy/monetization/revenue-roadmap.md — monetization evolution over time

Completion message: "monetization strategy complete"

---

TEAMMATE 4 — Scaling Strategist

Name: scaling-strategist
Ownership: docs/strategy/scaling/

Responsibilities:
- Identify scaling bottlenecks in the current architecture before they become problems
- Review Supabase backend limitations (free tier, connection limits, row limits, storage)
- Review long-term architecture concerns (AI API costs at scale, session management at 100K users)
- Predict infrastructure risks at 10K / 100K / 1M users
- Recommend the minimum infrastructure investments needed before launch

Rules:
- Prioritize launch speed — do not recommend anything that blocks shipping
- Prioritize solutions that are cheap now and scalable later
- Avoid overengineering — flag complexity vs. necessity for each recommendation

Output files:
- docs/strategy/scaling/bottleneck-analysis.md — known bottlenecks ranked by risk
- docs/strategy/scaling/backend-limits.md — Supabase and API limits with mitigation plans
- docs/strategy/scaling/infrastructure-risks.md — risk register at 10K/100K/1M users
- docs/strategy/scaling/pre-launch-checklist.md — minimum infra work needed before App Store launch

Completion message: "scaling review complete"
```

---

## Team Status

| Teammate | Role | Status | Key Output |
|---|---|---|---|
| product-strategist | Product Strategist | Not started | MVP scope, launch roadmap |
| growth-strategist | Growth Strategist | Not started | Viral loops, retention system |
| monetization-strategist | Monetization Strategist | Not started | Subscription model, paywall design |
| scaling-strategist | Scaling Strategist | Not started | Bottleneck analysis, pre-launch checklist |

---

## File Ownership Map

| Folder | Owner |
|---|---|
| `docs/strategy/product/` | product-strategist |
| `docs/strategy/growth/` | growth-strategist |
| `docs/strategy/monetization/` | monetization-strategist |
| `docs/strategy/scaling/` | scaling-strategist |

---

## Expected Outputs Summary

| Strategist | Key Deliverables |
|---|---|
| Product | MVP scope, feature backlog, launch roadmap, value proposition |
| Growth | Viral loops, retention plan, referral system, growth channels |
| Monetization | Subscription tiers, pricing, paywall UX, free trial design |
| Scaling | Bottleneck analysis, backend limits, risk register, pre-launch checklist |
