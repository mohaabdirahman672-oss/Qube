# Team: critic-panel

**Size:** 5 teammates
**Model:** Claude Sonnet (all teammates)
**Purpose:** Brutally honest, independent review of every aspect of Qube — product, UX, engineering, security, and business
**Run after:** All other teams have completed their work
**Plan approval required:** No — critics review and report, they do not build

---

## Spawn Prompt (copy this to launch the team)

```
Create an agent team called "critic-panel" with 5 teammates, all using Sonnet.
No plan approval required — critics review and write reports only. They do not modify implementation files.

Before starting, all teammates must read:
- CLAUDE.md
- docs/agent-memory.md
- docs/known-issues.md
- docs/strategy/ (all subfolders)
- docs/research/ (all subfolders)
- docs/plans/ (all plans)
- docs/reviews/ (all prior reviews)
- All source files in src/

GLOBAL CRITIC RULES — apply to every teammate:
- Be brutally honest. Do not soften findings to spare feelings.
- Explain WHY each issue exists, not just what it is.
- Suggest practical, actionable fixes for every issue raised.
- Do not praise weak implementations. Acknowledge what works only when it genuinely does.
- Rate every finding by severity: CRITICAL / HIGH / MEDIUM / LOW
- If something is good, say it once and move on. Focus on what needs fixing.

All 5 critics work in parallel and independently. Do not coordinate before writing your review — independent perspectives are the value. After completing individual reviews, share findings with each other to identify patterns.

---

TEAMMATE 1 — Product Critic

Name: product-critic
Ownership: docs/reviews/product/

Responsibilities:
- Identify weak or half-baked features that should be cut or reworked
- Identify unnecessary complexity that adds friction without value
- Review every user flow for logical gaps, dead ends, or confusion
- Evaluate whether the MVP scope is actually minimal or bloated
- Assess whether the core value proposition is clear and defensible

Output files:
- docs/reviews/product/weak-features.md — features that should be cut or redesigned
- docs/reviews/product/user-flow-issues.md — specific flow problems with step-by-step analysis
- docs/reviews/product/mvp-critique.md — is the MVP truly minimal? What should be cut?
- docs/reviews/product/value-prop-critique.md — is the value proposition clear and strong?

Completion message: "product review complete"

---

TEAMMATE 2 — UX Critic

Name: ux-critic
Ownership: docs/reviews/ux/

Responsibilities:
- Review the onboarding flow for friction, confusion, and drop-off risk
- Review usability across all screens — can a student use this without instructions?
- Review responsiveness — does the app feel fast and reactive?
- Review mobile UX quality against Apple HIG standards
- Identify anywhere the dark theme hurts readability or accessibility
- Review the bottom nav — is 5 tabs right? Are icons clear?

Output files:
- docs/reviews/ux/onboarding-critique.md — specific onboarding friction points
- docs/reviews/ux/usability-issues.md — screen-by-screen usability problems
- docs/reviews/ux/responsiveness-critique.md — animation, load time, and feedback issues
- docs/reviews/ux/accessibility-critique.md — contrast, text size, touch targets

Completion message: "ux review complete"

---

TEAMMATE 3 — Engineering Critic

Name: engineering-critic
Ownership: docs/reviews/engineering/

Responsibilities:
- Review the architecture for scalability — what breaks at 100K users?
- Review for technical debt — what will slow down future development?
- Review maintainability — can a new developer understand this codebase in 1 hour?
- Review the current .js codebase — is the lack of TypeScript a real risk?
- Review component structure, state management approach, and navigation setup
- Identify any performance risks (re-renders, large bundles, blocking operations)

Output files:
- docs/reviews/engineering/scalability-critique.md — what breaks at scale
- docs/reviews/engineering/technical-debt.md — debt inventory ranked by cost
- docs/reviews/engineering/maintainability-critique.md — readability, structure, conventions
- docs/reviews/engineering/performance-risks.md — specific performance red flags

Completion message: "engineering review complete"

---

TEAMMATE 4 — Security Critic

Name: security-critic
Ownership: docs/reviews/security/

Responsibilities:
- Review the auth implementation for security vulnerabilities
- Review environment variable handling — are secrets safe?
- Review sensitive data storage — are tokens, user data, and sessions stored correctly?
- Review API security — are endpoints protected? Is there rate limiting?
- Review Supabase Row Level Security configuration
- Check for common mobile security anti-patterns (tokens in AsyncStorage, hardcoded keys, etc.)

Output files:
- docs/reviews/security/auth-security.md — auth vulnerabilities and fixes
- docs/reviews/security/env-handling.md — secrets management issues
- docs/reviews/security/data-storage.md — sensitive data storage risks
- docs/reviews/security/api-security.md — API exposure and rate limiting issues
- docs/reviews/security/rls-review.md — Supabase RLS coverage gaps

Completion message: "security review complete"

---

TEAMMATE 5 — Business Critic

Name: business-critic
Ownership: docs/reviews/business/

Responsibilities:
- Review the monetization strategy — will users actually pay? Is the pricing defensible?
- Challenge retention assumptions — are the retention mechanics realistic or wishful?
- Review the growth strategy — is there a realistic path to first 10K users?
- Assess business viability — can Qube survive long enough to reach scale?
- Identify the single biggest business risk Qube faces right now

Output files:
- docs/reviews/business/monetization-critique.md — will it make money? Why or why not?
- docs/reviews/business/retention-critique.md — are retention assumptions realistic?
- docs/reviews/business/growth-critique.md — is there a real path to 10K users?
- docs/reviews/business/viability-assessment.md — overall business risk assessment
- docs/reviews/business/biggest-risk.md — the #1 thing that could kill Qube

Completion message: "business review complete"
```

---

## Team Status

| Teammate | Role | Status | Key Output |
|---|---|---|---|
| product-critic | Product Critic | Not started | Weak features, flow issues, MVP critique |
| ux-critic | UX Critic | Not started | Onboarding, usability, accessibility |
| engineering-critic | Engineering Critic | Not started | Scalability, debt, performance |
| security-critic | Security Critic | Not started | Auth, secrets, API, RLS |
| business-critic | Business Critic | Not started | Monetization, retention, viability |

---

## File Ownership Map

| Folder | Owner |
|---|---|
| `docs/reviews/product/` | product-critic |
| `docs/reviews/ux/` | ux-critic |
| `docs/reviews/engineering/` | engineering-critic |
| `docs/reviews/security/` | security-critic |
| `docs/reviews/business/` | business-critic |

---

## Recommended Run Order

This team should run **last**, after:
1. `research-lab` completes
2. `strategy-core` completes
3. `auth-system` completes

Critics need real work to review — running them on incomplete implementations produces shallow feedback.
