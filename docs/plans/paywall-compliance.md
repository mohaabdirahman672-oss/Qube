# Paywall App Review compliance

**Requested:** 2026-09-23 by the lead ("fix the 5 problems"). The request itself counts as approval.

## Feature
Get the subscription upsell (the paywall plus everything else that advertises
Premium) past App Review guidelines 3.1.2 and 2.3. Premium must be described
accurately everywhere a user or reviewer can see it.

## Changes
1. **Only sell what exists.** The paywall's Premium list becomes: *No weekly
   solve limit* and *Worked examples on every flashcard*. Similar questions,
   homework sets and graphing move to a muted "Coming to Premium" list with a
   SOON tag.
   - "Unlimited" is dropped. `solve` still applies a 20/hour abuse limit to
     Premium users, so "unlimited" isn't strictly true.
   - Profile's leftover "Upgrade to Pro — COMING SOON" card is removed. It
     advertised a second tier that doesn't exist (statistics, priority AI,
     offline).
   - Profile's "98% accuracy" FAQ answer is replaced; the same unbacked claim
     was removed from Home in KI-R27.
2. **Required disclosures on the paywall**:
   - Payment is charged to the Apple ID.
   - The subscription auto-renews unless cancelled ≥24h before the period ends.
   - Renewal is charged within 24h before the period ends.
   - It can be managed or cancelled in Apple ID settings.
   - Tappable **Terms of Service** and **Privacy Policy** links open the
     existing in-app `LegalDocModal`.
3. **Billing period always shown.** Prices render as `<store price> / month`
   and `<store price> / year`, whatever format the store string uses.
4. **Trial only for eligible users.**
   - `iap.js` adds `getIntroEligibility()`, which wraps
     `Purchases.checkTrialOrIntroductoryPriceEligibility`.
   - Trial wording ("Start 7-day free trial", "Free for 7 days, then …")
     appears only when the product has an intro offer **and** the status is
     ELIGIBLE. Trial length comes from the store's intro price, not hardcoded
     text.
   - UNKNOWN, INELIGIBLE and no-offer all get "Subscribe", which is
     RevenueCat's documented guidance for UNKNOWN.
5. **Sign-in to purchase: make it explicit and justified, not silent.** The
   purchase stays account-bound.
   - The architecture keys entitlements to the Supabase uid. The server can't
     honor a purchase made by an anonymous device without new server-side
     entitlement handling for guests.
   - Guests see why ("Premium is tied to your Qube account so it works on all
     your devices") and a "Sign in to subscribe" button, instead of the old
     trial button that silently closed the paywall.
   - The App Review notes explain the reasoning.
6. **The headline matches the context.** "You've used your N free solves this
   week" appears only when opened from the weekly limit (`reason="limit"`);
   otherwise it's a neutral "Get more out of Qube".

## Files to Edit
`src/screens/PaywallScreen.js`, `src/lib/iap.js`, `src/screens/SolveScreen.js`
(passes `reason="limit"`), `src/screens/ProfileScreen.js` (Pro card, FAQ,
"Unlimited" subtitles), `docs/app-store-connect-prep.md` (review notes).
The Terms don't need changing: they already describe billing correctly, and
"no weekly limit" is accurate without a fair-use clause.

## Dependencies
None new. `react-native-purchases` 10.10.1 already exposes the eligibility API.

## Risks
- Can't be exercised end to end until KI-08 (products and API key) is done;
  until then the paywall uses its fallback prices. Sandbox testing must cover
  an eligible user, an ineligible user (second Apple ID, or after a trial),
  and the guest path.
- A LegalDocModal nested inside the paywall's Modal: RN on iOS presents a
  nested Modal from the top-most view controller. Verify on device.

## Edge Cases
- Offerings fail to load: fallback prices, no trial wording, and purchase
  shows "Not available yet" (as today).
- Monthly and annual can differ in eligibility; copy follows the selected plan.

## Testing Strategy
Compile and bundle checks here. On-device checks are listed in the review doc.

## Open Questions
- ~~Should the Premium hourly cap be raised?~~ **Decided by the lead:** yes, to 100/hour, with "Unlimited solves (fair use)" copy (KI-R32).
