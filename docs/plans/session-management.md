# Plan: Session Management

**Owner:** session-engineer
**Status:** Pending — waiting for auth-architecture approval
**Approval:** Not yet submitted

---

## Feature
<!-- Persistent auth state: SecureStore + AuthContext + token refresh -->

## Files to Create

## Files to Edit
<!-- Must be in docs/shared-changes.md first if shared -->

## Dependencies
<!-- expo-secure-store, etc. -->

## SecureStore Key Naming Conventions
<!-- e.g. qube_access_token, qube_refresh_token, qube_user -->

## AuthContext Shape
```ts
// Define the full shape here
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (provider: 'google' | 'apple') => Promise<void>
  signOut: () => Promise<void>
}
```

## Token Refresh Strategy
<!-- When and how tokens are refreshed -->

## Logout Flow
<!-- How all stored tokens are cleared across both providers -->

## Expired Session Detection
<!-- How to detect expiry and redirect to login -->

## Risks

## Testing Strategy

## Open Questions
