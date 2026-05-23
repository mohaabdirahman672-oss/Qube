# Supabase Debug Log

**Owner:** api-debugger
**Status:** Pending

---

## Connection Issues
<!-- SUPABASE_URL reachable? Anon key valid? -->

## Query Failures
<!-- RLS policy blocking queries? Wrong table names? Type mismatches? -->

## Auth Issues
<!-- OAuth provider config? Redirect URI mismatch? -->

## Realtime Issues
<!-- If realtime is used: subscription failures, connection drops -->

## Common Supabase Error Codes Reference
| Error Code | Meaning | Common Cause | Fix |
|---|---|---|---|
| 401 | Unauthorized | Missing or invalid JWT | Check session before query |
| 403 | Forbidden | RLS policy blocking | Review RLS policies |
| 406 | Not Acceptable | Wrong Accept header | Use .select() correctly |
| 409 | Conflict | Unique constraint violation | Handle duplicate inserts |
| 42501 | Insufficient privilege | RLS blocking | Add/fix RLS policy |
