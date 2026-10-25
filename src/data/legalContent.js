// In-app renderable copies of the published legal docs (Privacy Policy / Terms
// of Service — see docs/known-issues.md KI-R21/KI-10 for the hosted originals,
// which stay the canonical URL for App Store Connect's "Privacy Policy URL"
// field and for anyone outside the app). Kept as data + a shared renderer
// (src/components/LegalDocModal.js) rather than duplicating markup per screen.
// If either published doc changes materially, update the matching sections here.

// Shown as the legal modals' subtitle (Profile, Paywall). Keep in step with the
// hosted docs' effective dates.
export const PRIVACY_POLICY_EFFECTIVE   = 'Effective September 23, 2026';
export const TERMS_OF_SERVICE_EFFECTIVE = 'Effective September 23, 2026';

export const PRIVACY_POLICY_SECTIONS = [
  {
    heading: 'Information we collect',
    body: 'Qube works without an account — you get a limited number of free solves as a guest before we ever ask you to sign in.\n\nAccount info: if you sign in (email, Google, or Apple), we receive your email and, if shared, your name and profile photo. We never see your Google or Apple password.\n\nMath problems, photos, and typed text: sent through our own server to OpenAI’s API to generate a solution. We never store your problem photos, and we do not store problem text afterward unless you choose to Save a solution (see Retention) — otherwise it passes through and is not written to our database.\n\nGuest device data: an anonymous, random identifier created on your device. It’s sent with each solve so our server can count your free solves for the week and apply a basic abuse limit. Not tied to your name or email.\n\nSubscriptions: if you subscribe to Premium, Apple processes the payment — we never see your card details. We receive your subscription status (active, trial, expired) to unlock Premium features.\n\nDiagnostic data: crash and error reports (device model, OS version, app version) — never your problem content.',
  },
  {
    heading: 'How we use it',
    body: 'To generate step-by-step solutions, create and secure your account, enforce free-tier and rate limits fairly, diagnose crashes, and respond to support requests. We do not use your data for advertising and we do not sell it to anyone.',
  },
  {
    heading: 'Who we share it with',
    body: 'OpenAI — your problem photo or text, solely to generate a solution.\nSupabase — our backend: auth, your account record, the server function that proxies solve requests.\nGoogle / Apple — only if you choose that sign-in method, governed by their own privacy policies.\nRevenueCat — manages Premium subscription status (an anonymous app user ID and your purchase history with Apple), only if you subscribe or restore purchases.\nSentry — crash and error reports, to find and fix bugs. Never your problem content.\n\nWe may also disclose information if required by law, or to protect the rights, safety, and security of Qube, our users, or the public.',
  },
  {
    heading: 'Retention',
    body: 'Account information is kept for as long as your account exists. Problem photos are never retained — they exist only for the moment it takes to generate your solution. Problem text is not retained on our servers unless you choose to keep it: solutions you tap Save on, and flashcards you create, are stored with your account so they sync across devices, until you delete them or your account.\n\nOn your device only: your last few solutions (the problem text and the solution, never the photo) are kept locally so you can revisit them from Home. They are never uploaded and are cleared when you sign out.\n\nFree-solve counts: our server keeps a weekly count tied to your anonymous device identifier (or your account, once signed in), which starts over each Monday. The identifier itself stays on your device and is removed if you delete the app.',
  },
  {
    heading: 'Your rights',
    body: 'You can ask us to access, correct, or delete your data at any time. Delete your account any time in the app from Profile → Settings → Delete Account, or by emailing us. If you’re in the EU/UK or California, you have specific rights under GDPR or the CCPA — the same contact handles those requests.',
  },
  {
    heading: 'Children’s privacy',
    body: 'Qube may be used by students of many ages under a parent’s or school’s supervision, but accounts are not knowingly directed at, or collecting data from, children under 13 without appropriate consent. If you believe a child created an account without proper consent, contact us and we’ll remove it.',
  },
  {
    heading: 'Security',
    body: 'Data in transit is encrypted (HTTPS/TLS). API keys for third-party AI services are kept server-side only and are never bundled into the app itself.',
  },
  {
    heading: 'International users',
    body: 'Qube is operated from the United States. If you use it from outside the U.S., your information will be transferred to and processed in the U.S. and other countries where our providers operate.',
  },
  {
    heading: 'Changes to this policy',
    body: 'If we make material changes, we’ll update the effective date and, for significant changes, notify you in the app. Continuing to use Qube after a change means you accept the update.',
  },
  {
    heading: 'Contact',
    body: 'Questions about this policy, or a request to access/delete your data? Email support@qubemath.app — we read every one.',
  },
];

export const TERMS_OF_SERVICE_SECTIONS = [
  {
    heading: 'Accepting these terms',
    body: 'By creating an account, subscribing to Premium, or using Qube as a guest, you agree to these terms and to our Privacy Policy. If you don’t agree, please don’t use the app.',
  },
  {
    heading: 'What Qube is (and isn’t)',
    body: 'Qube uses AI to generate step-by-step solutions to math problems you photograph or type. It’s a study aid, not a certified tutor or textbook.\n\nAI-generated answers can be wrong. Qube is right most of the time, but it can misread handwriting, misinterpret an ambiguous problem, or make a genuine reasoning error. Always check your work, especially before relying on an answer for graded work or an exam.',
  },
  {
    heading: 'Accounts & eligibility',
    body: 'You can use Qube’s free tier without an account. Creating an account unlocks saving problems and custom flashcards, but is still subject to the weekly free-solve limit unless you’re on Premium. You’re responsible for keeping your credentials secure.',
  },
  {
    heading: 'Subscriptions & billing',
    body: 'Qube Premium is an auto-renewing subscription purchased through your Apple ID: $9.99/month or $79.99/year, with a 7-day free trial on first subscription where offered. It includes unlimited AI solves (fair use — see Free tier & fair use) and AI worked examples on every flashcard.\n\nPayment is charged to your Apple ID at confirmation of purchase. It renews automatically unless auto-renew is turned off at least 24 hours before the current period ends, and your account is charged for renewal within that 24-hour window. Manage or cancel any time in Settings → Apple ID → Subscriptions — it takes effect at the end of the current paid period.\n\nIf you cancel a trial before it converts, you keep app access — you simply return to the free weekly tier. Refunds are handled by Apple under their standard policies.',
  },
  {
    heading: 'Free tier & fair use',
    body: 'The free tier includes a limited number of AI solves per week, resetting on a regular schedule shown in the app. We may adjust the limit, and may rate-limit or suspend access that looks automated or abusive.\n\nPremium includes unlimited solves, subject to fair use: currently up to 100 solves per hour, far beyond normal study use. This ceiling exists only to stop automated or scripted use. If you reach it, you can solve again within the hour, and your weekly access is never affected.',
  },
  {
    heading: 'Your content & conduct',
    body: 'You keep ownership of what you submit to Qube. By submitting it, you give us the limited right to process it (including sending it to our AI provider) solely to generate your solution, and to store solutions you choose to Save.\n\nPlease don’t: submit illegal or abusive content, attempt to circumvent rate limits or subscription gating, build a competing service on our AI proxy, or interfere with the app’s operation. We may suspend accounts that violate this.',
  },
  {
    heading: 'Intellectual property',
    body: 'Qube’s app, design, branding, and static course/flashcard content are owned by us. Your subscription gives you a personal, non-transferable license to use the app — not ownership of anything in it.',
  },
  {
    heading: 'Disclaimers & liability',
    body: 'Qube is provided “as is,” without warranties of any kind — including that it will be uninterrupted, error-free, or that its AI answers will always be accurate. To the fullest extent permitted by law, we’re not liable for indirect or consequential damages from your use of the app.',
  },
  {
    heading: 'Termination',
    body: 'You can stop using Qube and delete your account any time in the app from Profile → Settings → Delete Account. We may suspend accounts that violate these terms. Deleting your account doesn’t automatically cancel an active App Store subscription — cancel that separately in your Apple ID settings.',
  },
  {
    heading: 'Changes & governing law',
    body: 'We may update these terms as Qube evolves; material changes get a new effective date and, for significant changes, an in-app notice. These terms are governed by the laws of the United States, without regard to conflict-of-law rules, unless your local law requires otherwise.',
  },
  {
    heading: 'Contact',
    body: 'Questions about these terms, your subscription, or your account? Email support@qubemath.app.',
  },
];
