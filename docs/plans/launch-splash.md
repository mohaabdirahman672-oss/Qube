# Plan — Branded launch splash ("[ Qube ]" bracket reveal)

Requested directly by the lead/owner on 2026-09-26, with reference images (app-icon variants, a navy "math" backdrop mockup, and photos of `preview.html`'s splash). The request itself was the approval to proceed.

## Feature
When the app is opened, the native launch screen shows the Qube logo on navy. The JS splash then takes over from the exact same frame: the backdrop (gradient, faint formulas, wireframe cube, gold corner accents, gold glow) blooms in, the logo rises, and a closed `[]` springs open to reveal **Qube**. The divider, the "MATH. EVERY DIMENSION." tagline and a "TAP TO CONTINUE" hint follow. The splash auto-continues after 3.3s, and a tap skips it after 0.6s. This matches `preview.html`'s splash.

## Files to Create
- `assets/logo.png`: transparent round logo cut from `assets/icon.png` (r=400, feathered edge)
- `assets/splash.png`: 1284x2778 transparent canvas with the logo 528px wide, dead centre
- `assets/splash-glow.png`: soft gold radial glow (RN has no radial gradients without react-native-svg)

## Files to Edit
- `src/screens/SplashScreen.js`: full rewrite; same `onDone` contract, so `RootNavigator.js` is untouched
- `app.json`: `splash.image`/`resizeMode: contain`; bg `#06091A` → `#060D18`

## Dependencies
None added. Uses the existing `expo-linear-gradient` and `react-native-safe-area-context`. No new native modules, per the KI-R14–R19 lessons.

## Risks
- The native launch screen only changes after a new EAS build. Dev-client/Fast Refresh shows only the new JS part.
- The handoff is seamless only if `CANVAS_*` constants in `SplashScreen.js` match `splash.png`.

## Edge Cases
- 16:9 iPhones (SE): `contain` fits by height, and the JS uses `min(W/1284, H/2778)` to match.
- Double finish (tap + timer): guarded by the `finished` ref.
- Android: the legacy top-level splash renders the canvas at 200dp wide, so the logo is small. iOS-first; acceptable.

## Testing Strategy
Web export bundles; visual check via `expo start --web`; on-device check on the next EAS build (native → JS handoff).

## Open Questions
- Which of the three icon variants (navy / white / blue) should be the App Store icon? It currently stays navy.
