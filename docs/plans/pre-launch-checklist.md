# Qube — Pre-Launch Checklist (MARK1)

> Say **MARK1** to Claude to bring this back up.
> Written 2026-09-26. Supersedes the date-by-date `launch-daily-checklist.md` for what's *left*; that file stays as history.
> Numbers in brackets like **[#3]** match the original short list.

## 📅 Timeline (updated 2026-10-25)
- **Submit to Apple by:** mid-December 2026 (aim for **Dec 15**, which leaves room for one rejection and resubmit)
- **Launch:** **January 1, 2027**, with marketing as spring semester starts
- **Pace:** about 1 hour a day. Claude's code sessions are sized to that, and while a build runs you do a checklist item.
- **Biggest schedule risk:** A1. Subscriptions can't be sandbox-tested (C6) or sold until it's Active. Check on Apple's progress weekly.

**Order of work:** ✅ math rendering (Part G1) → math keyboard (Part G2) → Part H before submitting. Part A/C/E items fill the time while builds run.

---

## Part A: Start today (only you can do these)

### A1. Paid Apps Agreement, banking, tax [#3a]
> **Status (2026-10-25):** ⛔ **blocked on Apple.** The legal entity shows **"Mohamed Abdirahman"** and needs to be **"Mohamed Mohamed"**. You're waiting on Apple to change it. Check weekly. Once it's fixed, finish steps 3–7 below. If the corrected name changes how the seller appears, tell Claude so the Copyright line (E2) and legal docs match.

Nothing can be sold, not even a free trial, until this says **Active**.
1. Go to **appstoreconnect.apple.com** and sign in with your Account Holder Apple ID.
2. Click **Business**. On older layouts it's called "Agreements, Tax, and Banking".
3. Next to **Paid Apps**, click **View and Agree to Terms**, then accept.
4. **Bank Account**: click **Add**, then enter the routing number, account number, and the account holder name *exactly* as your bank has it.
5. **Tax Forms**: if you're in the US, fill in the **W-9** with your legal name and SSN (or EIN if you have a business).
6. **Contacts**: put yourself in every role (Senior Management, Finance, Technical, Legal, Marketing).
7. The status shows **Processing**, usually for 1–3 days. Carry on with the rest while you wait. Come back when it says **Active**.

### A2. Domain and support email [#2] ✅ Done 2026-09-29
> Domain is **`qubemath.app`**. `support@qubemath.app` forwards to Gmail. App and legal docs updated (KI-R33).
> Support page: `https://claude.ai/artifact/4dh7Wsk3nRYVJ8yQVpWzBK`. **Share it "Anyone with the link" before E2.**

`qube.app` isn't registered right now (checked 2026-09-26). Every `support@qube.app` link in the app and legal docs bounces until it is.
1. Make a free account at **dash.cloudflare.com**, then go to **Domain Registration → Register Domains** and search `qube.app`.
   - If it's available, buy it (about $15/year).
   - If it's taken or "premium" priced, pick another name (e.g. `getqube.app`, `qubemath.app`) and **tell Claude which one**. Claude updates every reference in the app and republishes the legal docs.
2. Open the domain, then **Email → Email Routing → Get started**.
3. Create a custom address **`support`**, set **Send to an email** to your Gmail, and click the verification link Cloudflare emails you.
4. When Cloudflare offers to add the MX/TXT records, click **Add records and enable**.
5. Test it: from a *different* email account, send a message to `support@<domain>`. It should land in your Gmail.
6. Tell Claude it works. Claude then builds the **Support page** that App Store Connect requires as a "Support URL" and gives you the link.

### A3. Reviewer demo account [#5] ✅ Done 2026-10-25
> **`reviewer@qubemath.app`**. The password is kept by you only, never in the repo, and is entered in E3.
1. In Cloudflare Email Routing, add a second address **`reviewer`** that forwards to your Gmail. (Or use `yourgmail+qubereview@gmail.com`.)
2. On your phone, sign out of Qube, then go to **Profile → Sign up** with that email and a new password. **Write the password down.**
3. Click the confirmation email.
4. Solve 2 problems and save one, and make a flashcard, so Saved isn't empty when Apple looks.
5. Don't buy Premium on it. The email and password go into App Review Information in step E3.

---

## Part B: Code work (Claude does these once you say go)

### B1. In-app account deletion [#1, KI-15]
> **Status (2026-09-29):** built (`docs/reviews/account-deletion.md`). Still needed: deploy `delete-account`, the Apple key below, and the on-device test.

Apple rejects apps where deletion is "email us" (guideline 5.1.1(v)).
**Claude builds:**
1. The plan `docs/plans/account-deletion.md`.
2. A new Supabase function `delete-account`. It checks the user's session, deletes all their rows (saved problems, flashcards, usage, entitlements), then deletes the login itself.
3. **Profile → Delete Account**: a red confirm dialog, then deletion, then sign-out, then back to the guest Home screen. It also warns: *"Deleting your account doesn't cancel Premium. Cancel it in iPhone Settings → your name → Subscriptions."*
4. **For Sign in with Apple users**: they confirm with Apple one more time, and the server revokes Qube's access with Apple. Apple requires this revoke step.
5. Deploy, then test on your phone with a throwaway account.

**You do (needed for step 4):**
1. Go to **developer.apple.com → Account → Certificates, IDs & Profiles → Keys → +**.
2. Name it `Qube Sign in with Apple` and tick **Sign in with Apple**. Click **Configure**, choose primary App ID `com.qube.mathapp`, then **Save → Continue → Register**.
3. Click **Download**. You only get one chance, so keep the `.p8` file safe. Note the **Key ID** and your **Team ID** (`GU33M426GC`).
4. Tell Claude where you saved the `.p8` and the Key ID. Claude stores them as Supabase secrets, never in the app.

### B2. Deploy the `solve` function [#4, KI-14]
> **Status (2026-10-25):** ✅ **Done.** Deployed together with the LaTeX math rendering and confirmed with a solve on the phone. KI-14 can close.

1. Claude runs `npx supabase functions deploy solve`.
2. Do one solve on your phone to confirm it still works. KI-14 is then closed.

---

## Part C: Subscriptions [#3b–e]
You can create the products before A1 is Active. Purchases, including sandbox ones, need A1 Active.

### C1. Create the two subscriptions in App Store Connect
1. Go to **Apps → Qube → Monetization → Subscriptions**.
2. Under **Subscription Groups**, click **Create** and set the reference name to `Qube Premium`.
3. Inside the group, click **Create** (subscription):
   - Reference name: `Premium Monthly`
   - Product ID: `com.qube.mathapp.premium.monthly`
   - Duration: **1 Month**
   - Price: **$9.99** (accept the auto-converted prices for other countries)
   - Localization (English US): display name `Qube Premium Monthly`, description `Unlimited solves and AI worked examples.`
   - Review Information: attach a screenshot of the Qube paywall.
   - **Introductory Offers → Create**: all countries, **Free**, **1 week**, new subscribers.
4. Repeat for annual:
   - Reference name: `Premium Annual`
   - Product ID: `com.qube.mathapp.premium.annual`
   - Duration: **1 Year**, price **$79.99**, same 1-week free trial.
5. On the group itself, add a localization with display name `Qube Premium`.
6. Both products now show **Ready to Submit**. They get submitted *with* the app in F2.

### C2. In-App Purchase key (lets RevenueCat talk to Apple)
1. Go to **Users and Access → Integrations → In-App Purchase → Generate** (or **+**).
2. Name it `RevenueCat` and download the `.p8`. Note the **Key ID** and the **Issuer ID** shown at the top of the page.

### C3. RevenueCat setup
1. Sign up at **app.revenuecat.com**, then **Create project** named `Qube`.
2. Go to **Apps → + New → App Store**. Enter App name `Qube` and bundle ID `com.qube.mathapp`, then upload the C2 `.p8` with its Key ID and Issuer ID.
3. **Products**: import both products (or add the two IDs from C1 by hand).
4. **Entitlements → + New**: identifier **exactly** `premium`. Attach **both** products.
5. **Offerings**: open `default` and make sure it's marked **Current**. Add two packages:
   - **Monthly** (`$rc_monthly`) with the monthly product
   - **Annual** (`$rc_annual`) with the annual product

   The paywall reads exactly these two slots, so other package types won't show.
6. Go to **API keys** and copy the **public Apple key** (starts with `appl_`). It's safe to paste to Claude.

### C4. Claude wires it up
1. Sets `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in EAS for development, preview and production.
2. Generates a random webhook secret and sets it as a Supabase secret (`REVENUECAT_WEBHOOK_SECRET`), then gives you the value for C5.

### C5. RevenueCat webhook (you)
1. In RevenueCat, go to **Project settings → Integrations → Webhooks → + Add**.
2. URL: `https://fvwainyumiunpdjhapto.supabase.co/functions/v1/revenuecat-webhook`
3. Authorization header value: `Bearer <secret from Claude>`. Include the word `Bearer` and a space.
4. Environment: **Both** (sandbox and production). Click **Save**, then **Send test event**. It should report success.

### C6. Sandbox test (after the D2 build, which has the key in it)
1. Go to **App Store Connect → Users and Access → Sandbox → Test Accounts → +**. Use an email that has **never** been an Apple ID (e.g. `yourgmail+sandbox1@gmail.com`).
2. On your iPhone, go to **Settings → App Store**, scroll to **Sandbox Account**, and sign in with the tester.
3. In Qube, sign in, open the paywall, tap **Start free trial**, and confirm.
4. **Profile** should now show Premium, and solves should be unlimited.
5. Sandbox time runs fast: the 1-week trial passes in about 3 minutes, and a month renews in about 5. Watch it convert and renew.
6. Cancel under **Settings → App Store → Sandbox Account → Manage**. After it expires, Qube should drop back to **free (20/week)**, not lock you out.
7. Delete the app, reinstall, and tap **Restore Purchases**. It should come back if the sub is still active.
8. Tell Claude. Claude checks that RevenueCat events arrived and that Supabase `user_entitlements` updated.

---

## Part D: Testing [#6–9]

### D1. Full manual pass on your phone [#6]
For anything broken, send Claude a screenshot and what you tapped.
- [ ] **Splash**: logo, then the brackets open, then "Qube" appears. Tapping skips it.
- [ ] **Solve**: camera scan, photo upload and typing all give step-by-step answers. The free counter goes down. At the limit, the paywall appears with a "wait until Monday" option.
- [ ] **Practice**: flashcards flip. Locked items say "coming soon". "Try This Next" works.
- [ ] **Saved**: you can save a solve, open it and delete it. Signed out, it shows the sign-in prompt.
- [ ] **Home**: the stat pills are right. Recent items open.
- [ ] **Profile**: Privacy and Terms open and close. Contact Us opens Mail. Restore Purchases works. Sign Out works.
- [ ] **Auth**: email sign-up works and the confirm link opens the app. Sign in works. Forgot password: the link opens the reset screen and the new password works. Google works. Apple works, and cancelling does no harm. Guest solves carry over after signing in.
- [ ] **Delete account** (after B1): the account is gone and you can't sign back in with it.

### D2. Production build [#7]
1. Claude commits everything (including the new splash) and runs `eas build --profile production --platform ios`. It takes about 20–40 minutes.
2. This is the first build that shows the logo on the iPhone launch screen.

### D3. Internal TestFlight [#8]
1. Claude runs `eas submit --platform ios --latest`. The first time, you may need to type an Apple 2FA code.
2. In **App Store Connect → TestFlight**, the build shows "Processing" for about 10–30 minutes. The encryption question is already answered in `app.json`.
3. Go to **Internal Testing → +**, create a group `Team`, and add yourself. Internal testers must be users on your App Store Connect team, so add anyone else under Users and Access first.
4. Install the **TestFlight** app on your phone, install Qube from it, and do a quick D1 pass **on this build**. Some bugs only show up in real builds.

### D4. External beta [#9]
1. Go to **TestFlight → External Testing → +**, create a group `Beta`, and add the build.
2. Fill in **Test Information**: what Qube is, what to test, feedback email `support@<domain>`, and the demo login from A3.
3. Submit for **Beta App Review**, which usually takes about a day.
4. Once approved, turn on the **Public Link** and send it to testers (classmates, friends, students).
5. Run it for about a week. Feedback arrives in **TestFlight → Feedback**, and crashes go to Sentry. Send everything to Claude, who sorts it into "must fix before launch" and "after launch".

---

## Part E: App Store listing [#10–12]

### E1. Screenshots [#10]
1. Take screenshots on your phone of real screens (side button + volume up). Aim for 5–6:
   1. Scanning a problem
   2. The step-by-step solution
   3. Practice flashcards
   4. Home
   5. Saved problems
   6. (optional) Premium
2. Send them to Claude. Claude resizes them to Apple's required **6.9" iPhone** size (1320×2868) and adds short captions on the navy-and-gold look.
3. Upload them on the version page under **Previews and Screenshots**.

### E2. Listing text [#11]
Claude drafts all of this for you to paste. Where it goes, on **Apps → Qube → iOS App 1.0** and **App Information**:
- **Name** (30 characters max), **Subtitle** (30 max), **Promotional Text** (optional)
- **Description**: must end with `Terms of Use: https://claude.ai/artifact/YZ2QSANyCGUqDwRo1VsvuS`
- **Keywords** (100 characters, commas, no spaces)
- **Support URL**: `https://claude.ai/artifact/4dh7Wsk3nRYVJ8yQVpWzBK`, **Copyright** (`2026 <your legal name>`)
- **App Information**: Category **Education**. **Privacy Policy URL**: `https://claude.ai/artifact/BJD7cQeJe1ebUFRH9paBPp`
- **Pricing and Availability**: Free, with the countries you want

### E3. Forms [#12]
1. **App Privacy → Get Started**: enter each row from `docs/app-store-connect-prep.md` §1, then **Publish**.
2. **Age Rating**: answer "None/No" to everything (no ads, no user-generated content, no chat, no web browsing). It should come out **4+**.
3. **App Review Information** (on the version page):
   - Your name, phone and email
   - Tick **Sign-in required** and enter the demo email and password from A3
   - **Notes**: paste §3 from `docs/app-store-connect-prep.md`

---

## Part F: Final build and submit [#13–14]

### F1. Claude
1. Removes `expo-dev-client` (KI-09b). It's only for development.
2. Confirms the version is `1.0.0`, then builds and submits the final build (same commands as D2/D3).

### F2. You, in App Store Connect
1. On **iOS App 1.0**, go to **Build → +** and pick the final build.
2. Under **In-App Purchases and Subscriptions**, add **both** subscriptions. They must go in with the first version.
3. Under **Version Release**, choose **Manually release this version** so you choose launch day.
4. Click **Add for Review**, then **Submit to App Review**.

### F3. The review
- It usually takes 1–3 days. Watch your email and the App Store Connect phone app.
- **If rejected:** copy the whole message from the **App Review** section and send it to Claude **the same day**. Fixing and replying quickly is the difference between a 2-day and a 2-week delay.

### F4. Launch
- When it says **Pending Developer Release**, press **Release This Version**. 🚀

---

## Part G: Product work before submission (Claude, in ~1-hour sessions)

### G1. Textbook math rendering ✅ Done 2026-10-25
Typeset steps, Answer box, formula chip, flashcards and worked examples. Confirmed on the phone (`docs/reviews/latex-math-rendering.md`).
- [ ] Still to check: a Premium worked example, which needs a Premium account (after C6).

### G2. Math keyboard (next)
A custom tabbed math keypad on Solve's "type a problem" field, replacing the iOS keyboard:
- **Tabs:** History, 123, Functions, Calculus, Symbols.
- **Bottom row:** ABC (iOS keyboard for word problems), ← →, backspace, Solve.
- Templates with empty slots, plus long-press alternates.

Plan and session breakdown: `docs/plans/math-keyboard.md`. **Adds a native module, so a new dev build is needed.**

---

## Part H: Before submitting (do all of these before F1)
- [ ] **Restore Supabase before any testing or submission.** The free tier auto-pauses after about a week without activity. In **supabase.com/dashboard → project → Restore** (it was live on 2026-10-25). If it pauses during App Review, sign-in and solving break for the reviewer. Restore it right before submitting, and consider the paid tier (or a weekly ping) for review week and launch.
- [ ] **Remove the BETA badge** and "· Beta" text:
  - `HomeScreen.js` (logo BETA pill)
  - `ProfileScreen.js` (two BETA pills; "Version 1.0.0 · Beta" in the About row, the version footer and the About content)
- [ ] **Replace the blue "Q" placeholder with the real cube logo everywhere:**
  - the Home header logo
  - the `LoginScreen.js` logo
  - the Profile version footer
  - (The Profile *avatar* fallback "Q" is a user-initial bubble, not the logo. Decide whether it should be the cube too.)
- [ ] **New production build after all native changes** (`react-native-svg` from G1, plus whatever G2 adds). Earlier builds can't run the current code. D2 and F1 cover this as long as they run **after** G2 is merged.

---

**After launch (optional):** KI-06, readable crash reports in Sentry.
