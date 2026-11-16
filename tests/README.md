# Tests

Everything here runs offline at no cost: no OpenAI call, no production data touched.

| Command | What it covers | Needs |
|---|---|---|
| `npm test` | **Unit:** auth deep links, keypad text helpers. **Server:** `delete-account` (auth, deletion order, never half-deleted, Apple revoke, can't target another user) and `solve` free-tier limits (20/week, hourly ceilings, Premium bypass, charge only after a successful answer). Both run the real function files under Node with a Deno shim and mocked fetch. | Node 22+ |
| `npm run test:web` | **Browser E2E** against the real app on web: math keypad (29 checks), auth flows (16), weekly-limit paywall (3). Every Supabase call is intercepted and mocked, and `api.openai.com` is blocked. | `npx expo start --web --port 8099` running, `cd tests/web && npm install` once, and Edge or Chrome (`QUBE_TEST_BROWSER` to override) |
| `npm --prefix evals/solve run eval -- …` | Solve **accuracy** eval (`evals/solve/README.md`). **This one costs money** (OpenAI), so run it only on purpose. | `OPENAI_EVAL_KEY` in `.env.local` |

What these can't cover, and still needs the phone: native `Alert` confirms (Sign Out, Delete Account), the Apple and Google sheets, the camera, the iOS keyboard staying hidden behind the math field, haptics, and VoiceOver.
