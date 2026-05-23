# Environment Variable Verification

**Owner:** api-debugger
**Status:** Pending

---

## Required Environment Variables

| Variable | Purpose | Location | Verified |
|---|---|---|---|
| EXPO_PUBLIC_SUPABASE_URL | Supabase project URL | .env | — |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | .env | — |
| EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS | Google OAuth iOS client ID | .env | — |
| EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID | Google OAuth Android client ID | .env | — |
| OPENAI_API_KEY | AI scan feature (server-side only) | EAS Secrets | — |

## Verification Checklist
- [ ] `.env` file exists (not committed to git)
- [ ] `.env` is in `.gitignore`
- [ ] All EXPO_PUBLIC_ vars accessible in app code
- [ ] Server-side secrets only in EAS Secrets, never in .env committed to repo
- [ ] `app.json` extra config reads env vars correctly

## Issues Found

| Variable | Issue | Fix |
|---|---|---|
| | | |
