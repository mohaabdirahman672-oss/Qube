# App Store Connect prep — privacy label + review notes

Reference answers so filling out App Store Connect is copy-paste, not a fresh
research pass. Sourced from the actual code (`supabase/functions/solve`,
`src/lib/weeklyUsage.js`, `App.js`, migrations) and the published Privacy
Policy — not guessed. Re-check against the code if either changes materially
before submission.

---

## 1. App Privacy ("nutrition label")

App Store Connect → your app → App Privacy → Get Started. One row per data type below.

| Data type | Collected? | Used for | Linked to identity? | Used for tracking? |
|---|---|---|---|---|
| **Email Address** | Yes | App Functionality (account, sign-in) | Yes | No |
| **Name** | Yes | App Functionality (Google/Apple profile name, optional) | Yes | No |
| **Photos or Videos** | Yes | App Functionality (scan-to-solve; sent to OpenAI, not stored — see note below) | No | No |
| **User ID** | Yes | App Functionality (Supabase auth uid) | Yes | No |
| **Device ID** | Yes | App Functionality (anonymous guest rate-limiting/weekly cap, `src/lib/weeklyUsage.js`) | No | No |
| **Purchase History** | Yes | App Functionality (subscription entitlement, via RevenueCat/Apple) | Yes | No |
| **Crash Data** | Yes | Analytics / App Functionality (Sentry, KI-R24) | No | No |
| **Performance Data** | Yes | Analytics (Sentry) | No | No |
| **Other Usage Data** | No | — | — | — |
| **Precise/Coarse Location** | No | — | — | — |
| **Contacts** | No | — | — | — |
| **Advertising Data** | No | — | — | — |

**Note on Photos**: problem photos are transmitted to `supabase/functions/solve`
and from there to OpenAI's API to generate a solution, but are **never written
to a database** — the function is stateless and the image only exists for the
duration of that one request. Apple's own guidance is that this still counts as
"collected" (it leaves the device and is processed by a third party), so it's
declared here, but you should mark it **not linked to the user's identity** —
nothing ties a specific photo back to an account.

**None of this is used for tracking** (cross-app/cross-site linking, data
brokers) — Qube doesn't do that, so every row's tracking column is "No" and
you can answer "No" to the top-level "Do you or your third-party partners
collect data from this app for tracking?" question.

**Third parties this data passes through**, if App Store Connect asks: OpenAI
(photos/text, for solving), Supabase (all account/auth data, hosting),
RevenueCat (purchase/subscription state), Sentry (crash/performance data),
Google and Apple (their own sign-in flows only).

---

## 2. Privacy Policy URL

Paste into App Store Connect → App Information → Privacy Policy URL:

```
https://claude.ai/artifact/BJD7cQeJe1ebUFRH9paBPp
```

**Already public** (shared 2026-09-23).
Apple's reviewer can load it without a claude.ai
account.

---

## 3. App Review notes

Paste into App Store Connect → your build → App Review Information → Notes.

> Qube works fully without an account — the reviewer can test the core AI
> solving feature (Scan and Type-in, under the Solve tab) immediately with no
> sign-in required, up to 20 free solves/week. Camera or Photo Library access
> is needed for the scan feature (permission prompts are in-app).
>
> Optional sign-in (email/password, Google, or Apple) unlocks saving solved
> problems and custom flashcards. A reviewer account is provided below if you'd
> like to test those or the Premium subscription flow.
>
> Premium ($9.99/month or $79.99/year, 7-day free trial for new subscribers)
> adds unlimited solves (fair use: up to 100/hour, stated in the Terms) and AI-generated worked examples on
> flashcards. The paywall lists "Similar questions", "Homework sets", and
> "Graphing" separately under "Coming to Premium", each marked SOON. The
> matching sections after solving a problem are locked with a "coming soon"
> label for every user, including subscribers. They are planned for a future
> update and are not sold as current Premium features.
>
> Subscribing requires signing in because Premium is an account-based
> entitlement: it's tied to the user's Qube account so it works across every
> device they sign in on, alongside their synced saved problems and
> flashcards. Sign in with Apple is offered, so this takes one tap. Everything
> else, including the core solve feature, works without an account.
>
> Account deletion is in the app: Profile → Settings → Delete Account. It
> deletes the account and all its data immediately, and for Sign in with Apple
> accounts it also revokes the app's Apple token. To test it, please create a
> new account rather than deleting the demo account below.

**Demo account**: with the login gate removed, a demo account is no longer
strictly required to reach the app's main feature (this alone was the single
most common rejection reason for this category of app — see
`docs/plans/launch-daily-checklist.md`). Still worth providing one so the
reviewer can see Saved Problems, custom flashcards, and Premium/subscription
management.

✅ **Created 2026-10-25:** **`reviewer@qubemath.app`** (Cloudflare forward to the owner's Gmail). It has saved problems and a flashcard, and is not Premium. **The password is deliberately not stored in this repo.** The owner types it directly into App Store Connect → App Review Information → Sign-in required.

**Attach-Purchase note**: if the reviewer needs to test the subscription
itself, mention that Apple's own Sandbox Tester accounts are the intended path
(App Store Connect → Users and Access → Sandbox Testers) — this only becomes
relevant once KI-08 (RevenueCat/App Store Connect product setup) is complete.

---

## 4. Age rating

App Review Information → Age Rating questionnaire. Qube has no user-generated
content shown to other users, no mature content, no gambling. Expect this to
land at **4+**. Answer "No" to every content category unless something in the
app changes (e.g. a future social/sharing feature).

---

## 5. Subscription metadata (guideline 3.1.2)

Apple requires working **Terms of Use** and **Privacy Policy** links in both
places:
- **In the app**: done. The paywall shows the auto-renew disclosure and links
  to both documents (docs/plans/paywall-compliance.md).
- **In the App Store listing**: still to do. Put the Privacy Policy URL in the
  Privacy Policy URL field. For Terms, either paste the Terms URL
  (`https://claude.ai/artifact/YZ2QSANyCGUqDwRo1VsvuS`) at the end of the App
  Description ("Terms of Use: <url>"), or add it under App Information →
  License Agreement (custom EULA). Missing it from the listing is its own
  common rejection, separate from the in-app links.

---

## Still blocked on

- **KI-08**: RevenueCat/App Store Connect subscription products must exist
  before the "Purchase History" row above is fully accurate and before a
  reviewer can actually test the trial.
- ~~**Reviewer demo account**~~: done 2026-10-25 (`reviewer@qubemath.app`, see §3).
