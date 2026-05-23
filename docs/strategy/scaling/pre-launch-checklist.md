# Pre-Launch Infrastructure Checklist

**Owner:** scaling-strategist
**Status:** Pending

---

## Must Complete Before App Store Submission

### Backend
- [ ] Supabase project on paid plan (or free tier confirmed sufficient for launch)
- [ ] Row Level Security enabled on all tables
- [ ] Database backups configured
- [ ] Environment variables secured (no keys in codebase)

### AI / Scan Feature
- [ ] OpenAI API key stored in Supabase Edge Function (not in app bundle)
- [ ] Rate limiting per user configured
- [ ] Cost cap / alert configured on OpenAI account

### App
- [ ] No console.log statements with sensitive data
- [ ] Error boundaries on all screens
- [ ] Crash reporting configured (Sentry or equivalent)
- [ ] App loads in < 3 seconds on iPhone 12 or newer

### App Store
- [ ] EAS Build configured
- [ ] TestFlight build tested on real device
- [ ] Apple Sign-In capability configured
- [ ] Privacy policy URL ready
- [ ] App Store screenshots prepared

## Nice-to-Have Before Launch (not blockers)
- [ ] Analytics configured
- [ ] A/B testing framework
- [ ] OTA update pipeline (EAS Update)
