# Auth Flow Debug Log

**Owner:** api-debugger
**Status:** Pending

---

## Google OAuth Flow
**Expected:** App opens browser → user authenticates → redirect back → token exchanged → session stored
**Issues found:**

## Apple Sign-In Flow
**Expected:** Native Apple sheet → user authenticates → identity token → Supabase session → stored
**Issues found:**

## Token Refresh Flow
**Expected:** Expired token detected → refresh automatically → new token stored
**Issues found:**

## Logout Flow
**Expected:** All tokens cleared → Supabase session invalidated → redirect to login
**Issues found:**

## Common Auth Failure Patterns
| Failure | Likely Cause | Debug Steps | Fix |
|---|---|---|---|
| Redirect loop | Bad redirect URI config | Check app.json scheme | Fix scheme in Supabase + app.json |
| Token exchange fails | Wrong client ID | Verify EXPO_PUBLIC vars | Correct env vars |
| Session not persisting | SecureStore not called | Check AuthContext | Ensure tokens saved on login |
| Apple Sign-In unavailable | Not on physical device | Use dev build | Build with EAS |
