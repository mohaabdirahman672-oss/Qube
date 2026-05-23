# Team: research-lab

**Size:** 4 teammates
**Model:** Claude Sonnet (all teammates)
**Purpose:** Deep research across market, UX, AI, and technical domains to inform Qube's product and engineering decisions
**Plan approval required:** Yes — no teammate publishes findings without lead review

---

## Spawn Prompt (copy this to launch the team)

```
Create an agent team called "research-lab" with 4 teammates, all using Sonnet.
Require plan approval before any teammate publishes final findings.

Before starting, all teammates must read:
- CLAUDE.md
- docs/agent-memory.md
- docs/known-issues.md

All teammates work in parallel. Each owns a separate research domain and stores findings in their assigned docs/research/ subfolder. Teammates should share relevant cross-domain findings with each other via messages.

---

TEAMMATE 1 — Market Researcher

Name: market-researcher
Ownership: docs/research/market/

Responsibilities:
- Analyze top competitors in the math/education app space (Photomath, Wolfram Alpha, Khan Academy, Mathway, etc.)
- Research monetization systems (freemium, subscription, one-time purchase, credits)
- Identify market gaps Qube can exploit
- Research viral growth patterns in education apps
- Research App Store discoverability strategies

Store all findings in docs/research/market/ using clear markdown files:
- docs/research/market/competitor-analysis.md
- docs/research/market/monetization.md
- docs/research/market/market-gaps.md
- docs/research/market/viral-patterns.md

Completion message: "market research complete"

---

TEAMMATE 2 — UX Researcher

Name: ux-researcher
Ownership: docs/research/ux/

Responsibilities:
- Research best-in-class onboarding systems for mobile apps (especially education/productivity)
- Research retention psychology: streaks, rewards, habit loops, notifications
- Analyze friction points in math/education apps (where users drop off)
- Research mobile UX best practices for iOS (Apple HIG, gesture navigation, etc.)
- Research dark-theme UX patterns for premium feel

Outputs:
- Onboarding flow recommendations tailored to Qube
- Retention system recommendations (what to build to keep users coming back)
- UX improvements specific to math problem-solving on mobile

Store all findings in docs/research/ux/:
- docs/research/ux/onboarding-patterns.md
- docs/research/ux/retention-psychology.md
- docs/research/ux/friction-analysis.md
- docs/research/ux/ios-ux-best-practices.md

Completion message: "ux research complete"

---

TEAMMATE 3 — AI Researcher

Name: ai-researcher
Ownership: docs/research/ai/

Responsibilities:
- Compare AI APIs and models for math problem solving (OpenAI GPT-4o vision, Claude, Gemini, Mathpix, Wolfram API)
- Research implementation strategies for camera-based math scanning
- Research AI tutoring workflows (step-by-step explanation quality, latency, cost)
- Optimize pricing vs performance tradeoffs for a mobile app at scale
- Research prompt engineering strategies for math tutoring

Outputs:
- Model comparison table (accuracy, cost, latency, vision support)
- API recommendation with rationale
- Implementation plan for the Qube scan feature
- Prompt engineering recommendations for math tutoring quality

Store all findings in docs/research/ai/:
- docs/research/ai/model-comparison.md
- docs/research/ai/api-recommendation.md
- docs/research/ai/scan-implementation.md
- docs/research/ai/prompt-engineering.md

Completion message: "ai research complete"

---

TEAMMATE 4 — Technical Researcher

Name: technical-researcher
Ownership: docs/research/technical/

Responsibilities:
- Research Expo SDK 54 tooling: EAS Build, EAS Submit, OTA updates, dev builds
- Research Supabase integrations for React Native: auth, database, realtime, storage
- Research scalable architecture patterns for React Native apps at growth stage
- Recommend libraries and packages for: navigation, state management, storage, analytics, crash reporting
- Research TypeScript migration strategy from current .js codebase

Rules:
- Prioritize simple, scalable solutions
- Avoid unnecessary complexity — if a built-in Expo/Supabase feature covers the need, recommend that over a third-party package
- Flag any packages with known Expo SDK 54 incompatibilities

Store all findings in docs/research/technical/:
- docs/research/technical/expo-tooling.md
- docs/research/technical/supabase-integration.md
- docs/research/technical/architecture-patterns.md
- docs/research/technical/recommended-packages.md
- docs/research/technical/typescript-migration.md

Completion message: "technical research complete"
```

---

## Team Status

| Teammate | Role | Status | Findings |
|---|---|---|---|
| market-researcher | Market Researcher | Not started | — |
| ux-researcher | UX Researcher | Not started | — |
| ai-researcher | AI Researcher | Not started | — |
| technical-researcher | Technical Researcher | Not started | — |

---

## File Ownership Map

| Folder | Owner |
|---|---|
| `docs/research/market/` | market-researcher |
| `docs/research/ux/` | ux-researcher |
| `docs/research/ai/` | ai-researcher |
| `docs/research/technical/` | technical-researcher |

---

## Expected Outputs Summary

| Researcher | Key Deliverables |
|---|---|
| Market | Competitor analysis, monetization strategy, market gaps, viral patterns |
| UX | Onboarding flow, retention system, friction analysis, iOS UX guidelines |
| AI | Model comparison, API pick, scan feature implementation plan, prompt engineering |
| Technical | Expo tooling guide, Supabase integration guide, package recommendations, TS migration plan |
