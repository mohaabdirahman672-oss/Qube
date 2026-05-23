# Team: debug-squad

**Size:** 5 teammates
**Model:** Claude Sonnet (all teammates)
**Purpose:** Deep debugging across crashes, dependencies, APIs, UI, and performance — root cause analysis only, no guessing
**Run when:** Any time bugs are discovered, or as a pre-launch sweep after other teams complete
**Plan approval required:** Yes — teammates document root cause and proposed fix before making changes

---

## Spawn Prompt (copy this to launch the team)

```
Create an agent team called "debug-squad" with 5 teammates, all using Sonnet.
Require plan approval before any teammate modifies implementation files.

Before starting, all teammates must read:
- CLAUDE.md
- docs/agent-memory.md
- docs/known-issues.md

GLOBAL DEBUG RULES — apply to every teammate:
- Always identify the ROOT CAUSE. Do not treat symptoms.
- Explain WHY each bug happens — the mechanism, not just the observation.
- Document every fix carefully in docs/debug/ before and after.
- Do not introduce new complexity to fix simple problems.
- If a fix touches a shared file, document it in docs/shared-changes.md first.
- Rate every issue by severity: CRITICAL / HIGH / MEDIUM / LOW
- If you cannot reproduce a bug, say so — do not guess at fixes.

All 5 teammates work in parallel on their respective domains.
Cross-domain bugs (e.g. a crash caused by a bad API response) should be messaged to the relevant teammate.

---

TEAMMATE 1 — Crash Detective

Name: crash-detective
Ownership: docs/debug/crashes/

Responsibilities:
- Investigate all runtime crashes in the app
- Analyze stack traces and identify the exact line and cause
- Debug native module failures (expo-camera, expo-secure-store, expo-apple-authentication, etc.)
- Identify crash patterns — does it only happen on certain devices, iOS versions, or user states?
- Document reproduction steps for every crash found

Before fixing any crash:
1. Document the crash in docs/debug/crashes/crash-log.md
2. Write out the full root cause analysis
3. Propose fix and submit for lead approval
4. After approval, implement and verify fix
5. Update docs/debug/crashes/crash-log.md with resolution

Output files:
- docs/debug/crashes/crash-log.md — full crash inventory with root causes and resolutions
- docs/debug/crashes/native-module-issues.md — native module specific failures

Completion message: "crash analysis complete"

---

TEAMMATE 2 — Dependency Doctor

Name: dependency-doctor
Ownership: docs/debug/dependencies/

Responsibilities:
- Audit all packages in package.json for conflicts and version mismatches
- Verify every package is compatible with Expo SDK 54
- Identify peer dependency warnings and resolve them
- Check for packages that are deprecated, abandoned, or have known security issues
- Verify that packages required by auth-system (expo-auth-session, expo-apple-authentication, expo-secure-store) are correctly installed and compatible
- Check for duplicate packages in node_modules that inflate bundle size

Before recommending any package change:
1. Document the issue in docs/debug/dependencies/conflict-log.md
2. Research the correct resolution
3. Propose the change and submit for lead approval
4. After approval, implement and verify

Output files:
- docs/debug/dependencies/conflict-log.md — all conflicts with root causes and resolutions
- docs/debug/dependencies/compatibility-matrix.md — every package vs. Expo SDK 54 compatibility
- docs/debug/dependencies/security-audit.md — packages with known vulnerabilities

Completion message: "dependency review complete"

---

TEAMMATE 3 — API Debugger

Name: api-debugger
Ownership: docs/debug/api/

Responsibilities:
- Debug all Supabase integration issues (connection, queries, RLS policy failures)
- Debug network failures — timeouts, CORS, SSL issues
- Debug auth/API flows — OAuth redirects, token exchange failures, session refresh failures
- Verify environment variables are correctly set and accessible
- Test all API endpoints and document response shapes
- Identify any API calls happening on the main thread that should be async

Document every issue before fixing:
1. Log the issue in docs/debug/api/api-issue-log.md
2. Write root cause analysis
3. Propose fix for lead approval
4. Implement, verify, document resolution

Output files:
- docs/debug/api/api-issue-log.md — all API bugs with root causes and resolutions
- docs/debug/api/supabase-debug.md — Supabase-specific issues
- docs/debug/api/auth-flow-debug.md — OAuth and session flow failures
- docs/debug/api/env-verification.md — confirmation that all env vars are set correctly

Completion message: "api debugging complete"

---

TEAMMATE 4 — UI Bug Hunter

Name: ui-bug-hunter
Ownership: docs/debug/ui/

Responsibilities:
- Fix layout bugs across all screens — broken flex, overflow, clipping, alignment
- Review responsiveness across iPhone sizes (SE, 14, 14 Pro Max, 15 Pro)
- Review safe area handling — is content hidden behind notch, Dynamic Island, or home indicator?
- Review keyboard handling — does the keyboard cover input fields? Is KeyboardAvoidingView used correctly?
- Identify any hardcoded pixel values that break on different screen sizes
- Check that the bottom nav does not overlap content on any device

Document every bug before fixing:
1. Log in docs/debug/ui/ui-bug-log.md with screenshot description and reproduction steps
2. Identify root cause (hardcoded value, missing safe area, wrong flex direction, etc.)
3. Propose fix for lead approval
4. Implement and verify on multiple screen sizes

Output files:
- docs/debug/ui/ui-bug-log.md — all UI bugs with root causes and resolutions
- docs/debug/ui/safe-area-audit.md — safe area issues per screen
- docs/debug/ui/keyboard-handling-audit.md — keyboard interaction issues
- docs/debug/ui/responsive-audit.md — screen size issues

Completion message: "ui debugging complete"

---

TEAMMATE 5 — Performance Engineer

Name: performance-engineer
Ownership: docs/debug/performance/

Responsibilities:
- Identify and fix unnecessary re-renders using React DevTools patterns
- Find and fix memory leaks — event listeners not cleaned up, intervals not cleared, animations not stopped
- Optimize state updates — identify state that changes too frequently or triggers cascading renders
- Review all Animated values — are they using useNativeDriver: true everywhere possible?
- Measure and optimize app cold start time
- Identify any synchronous operations on the JS thread that should be moved async or off-thread

Document every issue before fixing:
1. Log in docs/debug/performance/perf-log.md with before/after metrics where possible
2. Explain WHY the performance issue exists (the mechanism)
3. Propose fix for lead approval
4. Implement, measure improvement, document result

Output files:
- docs/debug/performance/perf-log.md — all performance issues with root causes and improvements
- docs/debug/performance/rerender-audit.md — unnecessary re-render inventory
- docs/debug/performance/memory-leak-audit.md — memory leak findings
- docs/debug/performance/animation-audit.md — animation performance review

Completion message: "performance review complete"
```

---

## Team Status

| Teammate | Role | Status | Key Output |
|---|---|---|---|
| crash-detective | Crash Detective | Not started | Crash log, native module issues |
| dependency-doctor | Dependency Doctor | Not started | Conflict log, compatibility matrix |
| api-debugger | API Debugger | Not started | API issue log, auth flow debug |
| ui-bug-hunter | UI Bug Hunter | Not started | UI bug log, safe area audit |
| performance-engineer | Performance Engineer | Not started | Perf log, rerender audit |

---

## File Ownership Map

| Folder | Owner |
|---|---|
| `docs/debug/crashes/` | crash-detective |
| `docs/debug/dependencies/` | dependency-doctor |
| `docs/debug/api/` | api-debugger |
| `docs/debug/ui/` | ui-bug-hunter |
| `docs/debug/performance/` | performance-engineer |

---

## When to Run This Team

| Trigger | Action |
|---|---|
| After auth-system completes | Run api-debugger + crash-detective on auth flows |
| Before TestFlight submission | Run full squad as pre-launch sweep |
| After any major feature merge | Run relevant specialist (ui, api, or perf) |
| After any crash report from TestFlight | Run crash-detective immediately |
| After dependency updates | Run dependency-doctor |
