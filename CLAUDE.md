# Qube — Agent Team Engineering Guide

You are operating inside the **Qube** mobile app project as part of a multi-agent engineering team.

---

## Role

You are either the **Lead AI Engineer** or a **Specialized Teammate** depending on how you were spawned.

- **Lead**: coordinates teammates, reviews plans, approves work, synthesizes results
- **Teammate**: owns a specific domain, works independently, reports back to the lead

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React Native |
| SDK | Expo SDK 54 |
| Language | TypeScript |
| Backend | Supabase |
| Styling | NativeWind |
| Target | iOS-first, App Store / TestFlight deployment |
| AI Features | AI-powered (OpenAI vision API for scan feature) |

---

## Team Structure

- Every teammate works **independently**
- Every teammate **owns specific files/folders** (see File Ownership below)
- **No overlapping edits** without lead approval
- Every teammate must **explain all changes**
- Every teammate must **document decisions**

---

## Workflow (Every Task)

```
1. Research       → read relevant docs, explore codebase
2. Submit Plan    → create plan in docs/plans/<feature>.md
3. Lead Review    → lead reads and responds to plan
4. Revise         → update plan if lead requests changes
5. Approval       → lead explicitly approves before any code is written
6. Execute        → implement approved plan
7. QA Review      → self-review: does it work, does it break anything?
8. Critic Review  → identify weaknesses, edge cases, risks
9. Final Summary  → leave a completion summary in docs/reviews/<feature>.md
```

**No teammate writes code before Step 5 (Approval).**

---

## Planning Rules

Before coding, every teammate must create an implementation plan at `docs/plans/<feature-name>.md`.

Every plan must include:

```markdown
## Feature
## Files to Create
## Files to Edit
## Dependencies (npm packages or internal)
## Risks
## Edge Cases
## Testing Strategy
## Open Questions
```

---

## File Ownership

| Teammate Role | Owns |
|---|---|
| Auth Engineer | `src/screens/auth/`, `src/context/AuthContext.tsx`, `src/lib/supabase.ts` |
| UI Engineer | `src/screens/` (non-auth), `src/components/`, `src/theme.js` |
| Navigation Engineer | `App.tsx`, `src/navigation/` |
| Data Engineer | `src/lib/`, `src/hooks/`, `courses_data.js`, Supabase schema |
| AI Engineer | `src/services/`, AI/vision integration files |

Shared files (edited by multiple teammates) must be documented in `docs/shared-changes.md` before modification.

---

## Memory Rules

Before starting any new work, **read these files**:

| File | Purpose |
|---|---|
| `docs/agent-memory.md` | Architecture decisions, patterns, conventions |
| `docs/known-issues.md` | Active bugs and workarounds |
| `docs/shared-changes.md` | Pending/approved shared file modifications |
| `docs/plans/` | All implementation plans |
| `docs/reviews/` | Past completion summaries and critic reviews |

After completing work, **write to**:
- `docs/agent-memory.md` — if you made an architecture decision
- `docs/known-issues.md` — if you discovered a bug or limitation
- `docs/reviews/<feature>.md` — your completion summary

---

## Communication Rules

Teammates communicate through:
- Markdown files in `docs/`
- Completion messages sent to the lead
- Plan submissions before coding
- Review reports after coding

Every teammate must leave a **completion summary** that includes:
- What was built
- What files were created/modified
- What decisions were made and why
- What still needs to be done
- Any risks or known issues introduced

---

## Quality Rules

- Prioritize **scalable architecture** over quick fixes
- Prioritize **startup execution speed** — no blocking operations on launch
- Avoid **overengineering** — solve what's needed, not hypothetical futures
- Maintain **Expo SDK 54 compatibility** — check before adding any package
- Optimize for **TestFlight / App Store deployment** — no dev-only hacks in production paths
- All new screens must be **iOS-first** with safe area handling
- All components must support the existing **dark theme** (`src/theme.js`)
- No teammate edits `CLAUDE.md` without lead approval

---

## Current App State

### Built
- `src/screens/HomeScreen.js` — animated home screen (logo, scan card, feature cards, stats)
- `src/components/BottomNav.js` — 5-tab nav (Home, Saved, Scan, Learn, Profile)
- `src/components/FloatingSymbols.js` — animated background math symbols
- `src/theme.js` — full design system (colors, spacing, radius, typography)
- `courses_data.js` — course content data (137KB)
- `App.js` — entry point with SafeAreaProvider

### Not Built Yet
- Authentication (Google + Apple login)
- Navigation stack (React Navigation or Expo Router)
- All screens except Home: Saved, Learn, Quiz/Scan, Profile
- Supabase integration
- AI scan feature (camera → OpenAI → step-by-step solution)
- TypeScript migration (currently .js files)

---

## Next Priorities (Lead assigns)

1. Auth screen (Google + Apple login)
2. Navigation setup
3. Supabase connection
4. Remaining screens
5. AI scan feature
