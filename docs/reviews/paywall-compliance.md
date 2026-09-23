# Paywall App Review compliance: completion summary

**Date:** 2026-09-23 · **Plan:** `docs/plans/paywall-compliance.md` · **Tracked as:** KI-R31

## What was built
| # | Problem | Fix |
|---|---|---|
| 1 | Paywall sold features that don't exist (similar questions, homework sets) | The Premium list now has only real features: no weekly limit and flashcard worked examples. The unbuilt ones are in a muted, dashed "Coming to Premium" box with SOON tags. "Unlimited" is dropped everywhere because `solve` still applies a 20/hour abuse limit to Premium |
| 2 | Required subscription fine print missing | The paywall now states: charged to Apple ID; auto-renews unless cancelled ≥24h before the period ends; renewal charged within 24h before it ends; how to manage or cancel. Terms of Service and Privacy Policy links open in-app (`LegalDocModal`) |
| 3 | Prices could show without a billing period | Prices always render as `<store price> / month` and `<store price> / year` |
| 4 | Trial offered to users who can't get one | `iap.js` adds `getIntroEligibility()` and `isTrialEligible()`. Trial wording appears only with an intro offer **and** a definite ELIGIBLE status. UNKNOWN, INELIGIBLE and no-offer show "Subscribe" with regular-price fine print. Trial length is read from the store's intro offer |
| 5 | Sign-in required to buy | Kept, but made explicit and justified. Guests see why Premium needs an account and a "Sign in to subscribe" button, instead of a trial button that silently closed the paywall. The App Review notes explain that the entitlement is account-based |

Also fixed while in here:
- **The headline no longer lies.** "You've used your 20 free solves this week" shows only when the paywall opens from the weekly limit (`reason="limit"`, Solve). From Profile or a locked flashcard it reads "Get more out of Qube with Premium".
- **Removed Profile's leftover "Upgrade to Pro — COMING SOON" card.** It advertised a second tier that doesn't exist (statistics, priority AI, offline) next to the real Premium.
- **Profile FAQ copy.** The "98% accuracy" claim is replaced with an honest answer, and the Premium answer now says "7-day free trial for new subscribers".
- **Legal effective dates** are now shared constants in `legalContent.js`, used by Profile and the paywall.

## Files modified
`src/screens/PaywallScreen.js`, `src/lib/iap.js`, `src/screens/ProfileScreen.js`,
`src/screens/SolveScreen.js`, `src/data/legalContent.js`,
`docs/app-store-connect-prep.md` (review notes plus new §5 on listing metadata)

## Decisions
- **Account-bound purchase kept rather than building guest purchases.**
  Entitlements are keyed to the Supabase uid, and the server is the only
  thing `solve` trusts. Guest purchases would need server-side entitlements
  keyed by device, a webhook mapping for RevenueCat anonymous IDs, and a
  transfer on sign-up. That's real work and a new failure surface, for a risk
  that is arguable at worst: Premium is account-based and Sign in with Apple
  makes it one tap. Revisit only if App Review actually rejects on this.
- **UNKNOWN eligibility shows "Subscribe"**, following RevenueCat's documented
  guidance. Some new users may see regular pricing when they'd actually get
  the trial. Apple's purchase sheet still shows the trial at confirmation, so
  they're never charged unexpectedly.
- **"No weekly limit" instead of "unlimited".** The alternative, raising the
  Premium hourly cap and adding a fair-use clause, is left open (see Risks).

## Risks and open items
- **Untestable until KI-08.** Until the products and API key exist, the
  paywall shows fallback prices and "Subscribe" (no offering means no
  eligibility check). Sandbox testing must cover: a fresh tester (trial
  wording), a tester who already used the trial (Subscribe wording and the
  regular-price disclosure), a guest (sign-in prompt), and the Terms/Privacy
  links opening over the paywall.
- **The legal modal is nested inside the paywall modal.** RN on iOS supports
  this. Verify on device that the legal modal opens on top and closes back
  to the paywall.
- **Product question:** paying users are capped at 20 solves an hour by
  the abuse limit. A heavy homework session could hit that. Consider raising
  the Premium limit (for example to 100/hour) in `solve` and then advertising
  "unlimited (fair use)". That's one line of server code plus a deploy.
- **App Store listing** still needs the Terms of Use link (prep doc §5).

## Device checklist
1. As a guest, open the paywall from Profile. It should show the neutral
   headline, the sign-in note and the "Sign in to subscribe" button.
2. Hit the weekly limit on Solve. It should show the "You've used your 20…" headline.
3. Tap Terms of Service, then Privacy Policy. Each opens over the paywall and
   closes back to it.
4. Switch between Monthly and Annual. The fine print should update with "/ month" or "/ year".
