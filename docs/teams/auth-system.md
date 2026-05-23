# Team: auth-system

**Size:** 5 teammates
**Model:** Claude Sonnet (all teammates)
**Purpose:** Design and implement the full authentication system for Qube
**Plan approval required:** Yes — no teammate writes code before lead approval

---

## Spawn Prompt (copy this to launch the team)

```
Create an agent team called "auth-system" with 5 teammates, all using Sonnet.
Require plan approval before any teammate begins implementation.

Before starting, all teammates must read:
- CLAUDE.md
- docs/agent-memory.md
- docs/known-issues.md

---

TEAMMATE 1 — Auth Architect

Name: auth-architect
Ownership: docs/plans/auth-architecture.md, features/auth/, providers/auth-provider/

Responsibilities:
- Design the full auth architecture for Qube
- Define session lifecycle (login → persist → refresh → logout)
- Define protected route handling pattern
- Define auth folder structure for the team to follow
- Coordinate other auth teammates — your plan is the blueprint they all follow

Workflow:
1. Read docs/agent-memory.md and docs/known-issues.md first
2. Create your architecture plan at docs/plans/auth-architecture.md
3. Send "auth architecture submitted" to the lead when plan is ready
4. Wait for approval before proceeding
5. After approval, scaffold the folder structure and shared auth standards

Output files:
- docs/plans/auth-architecture.md (architecture diagrams, flow documentation, shared standards)

Completion message: "auth architecture submitted"

---

TEAMMATE 2 — Google OAuth Dev

Name: google-auth-dev
Ownership: features/auth/google/, lib/google-auth/, docs/reviews/google-auth.md

Responsibilities:
- Implement Google Sign-In using Expo AuthSession
- Configure Supabase Google OAuth provider
- Configure redirect URIs for iOS and Android
- Handle all edge cases (cancel, network error, token expiry)

Wait for auth-architect's plan to be approved before starting your plan.

Your plan at docs/plans/google-auth.md must include:
- npm dependencies required
- environment variables needed (EXPO_PUBLIC_*)
- full redirect flow diagram
- iOS vs Android differences
- edge cases and error handling strategy
- Supabase provider configuration steps

Completion message: "google auth complete"

---

TEAMMATE 3 — Apple Sign-In Dev

Name: apple-auth-dev
Ownership: features/auth/apple/, ios/auth/, docs/reviews/apple-auth.md

Responsibilities:
- Implement Apple Sign-In using expo-apple-authentication
- Configure iOS entitlements and capabilities
- Ensure App Store compliance (Apple Sign-In required if any social login exists)
- Handle all error states and fallback flows

Wait for auth-architect's plan to be approved before starting your plan.

Your plan at docs/plans/apple-auth.md must include:
- entitlement requirements (Sign In with Apple capability)
- expo-apple-authentication setup steps
- dev build requirement (does NOT work in Expo Go — flag this)
- fallback handling for unsupported devices
- error states (cancelled, failed, credential revoked)
- App Store compliance notes

Completion message: "apple auth complete"

---

TEAMMATE 4 — Session Engineer

Name: session-engineer
Ownership: context/auth-context/, hooks/auth/, storage/session/

Responsibilities:
- Build the persistent login system using expo-secure-store
- Implement AuthContext (React Context) for app-wide auth state
- Handle token storage, refresh, and expiry
- Implement clean logout (clear all stored tokens)
- Implement expired session recovery (redirect to login)

Wait for auth-architect's plan to be approved before starting your plan.

Your plan at docs/plans/session-management.md must include:
- SecureStore key naming conventions
- AuthContext shape (user, session, loading, signIn, signOut)
- Token refresh strategy
- Logout flow (all providers)
- Expired session detection and recovery

Store session architecture notes in docs/agent-memory.md when complete.

Completion message: "session system complete"

---

TEAMMATE 5 — QA + Critic

Name: auth-qa
Ownership: tests/auth/, docs/reviews/auth-review.md, docs/known-issues.md

Responsibilities:
- Review ALL auth implementations after each teammate completes
- Test edge cases and security
- Review UX flows
- Review scalability and maintainability
- Write final pass/fail report

DO NOT modify any implementation files. Report only.

Test coverage must include:
- Login persistence across app restarts
- Provider switching (Google → Apple, Apple → Google)
- Invalid/expired session handling
- iOS-specific edge cases
- Network failure during auth
- TestFlight readiness checklist

Final output at docs/reviews/auth-review.md must include:
- Pass / Fail verdict
- Bug list with severity
- Architecture concerns
- Security findings
- UX findings
- Improvement suggestions for next iteration

Completion message: "auth review complete"
```

---

## Team Status

| Teammate | Role | Status | Plan | Review |
|---|---|---|---|---|
| auth-architect | Auth Architect | Not started | — | — |
| google-auth-dev | Google OAuth Dev | Not started | — | — |
| apple-auth-dev | Apple Sign-In Dev | Not started | — | — |
| session-engineer | Session Engineer | Not started | — | — |
| auth-qa | QA + Critic | Not started | — | — |

---

## File Ownership Map

| Folder / File | Owner |
|---|---|
| `features/auth/` | auth-architect (structure), google-auth-dev + apple-auth-dev (implementation) |
| `features/auth/google/` | google-auth-dev |
| `features/auth/apple/` | apple-auth-dev |
| `providers/auth-provider/` | auth-architect |
| `lib/google-auth/` | google-auth-dev |
| `ios/auth/` | apple-auth-dev |
| `context/auth-context/` | session-engineer |
| `hooks/auth/` | session-engineer |
| `storage/session/` | session-engineer |
| `tests/auth/` | auth-qa |
| `docs/plans/auth-architecture.md` | auth-architect |
| `docs/plans/google-auth.md` | google-auth-dev |
| `docs/plans/apple-auth.md` | apple-auth-dev |
| `docs/plans/session-management.md` | session-engineer |
| `docs/reviews/google-auth.md` | google-auth-dev |
| `docs/reviews/apple-auth.md` | apple-auth-dev |
| `docs/reviews/auth-review.md` | auth-qa |
| `docs/known-issues.md` | auth-qa (auth entries) |
