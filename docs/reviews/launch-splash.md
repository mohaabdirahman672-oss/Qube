# Completion Summary — Branded launch splash

**Date:** 2026-09-26 · **Plan:** `docs/plans/launch-splash.md`

## What was built
- The native launch screen now shows the Qube logo centred on `#060D18` instead of a blank colour.
- `SplashScreen.js` was rewritten to match `preview.html`: the logo starts pixel-aligned with the native launch image, the backdrop fades in, the logo rises and shrinks to 80%, `[]` appears closed and springs open to reveal "Qube", then the divider, tagline and tap hint appear. It auto-continues at 3.3s, and a tap skips it after 0.6s.

## Files
- Created: `assets/logo.png`, `assets/splash.png`, `assets/splash-glow.png`, plus this doc and the plan.
- Modified: `src/screens/SplashScreen.js`, `app.json` (splash block only).

## Decisions
- **Logo from `icon.png`, not redrawn.** The splash logo is identical to the App Store icon. No react-native-svg was added, because it's a new native module and would need a rebuild (see KI-R14–R19).
- **Full-screen canvas instead of `expo-splash-screen`'s `imageWidth`.** SDK 53's top-level `splash` renders the image full-screen with `contain`, so a fixed-ratio canvas makes the logo's on-screen size computable in JS. That gives an exact handoff with no new dependency.
- **Gold `#C9A84C`** (logo gold, as in `preview.html`), kept local to the splash rather than added to `theme.js`.
- **"Qube" all white.** This matches the reference images and photos.
- Generator script: the assets were generated with a one-off jimp-compact script. To regenerate, crop `icon.png` at centre r=400 with the alpha feathered from r=352 to r=400, and place it at 528px on a 1284x2778 canvas.

## Still to do
- A new EAS build is needed to see the native half (launch image). The JS half works now over dev-client.
- Choose the App Store icon variant (open question in the plan).

## Risks / known issues
- If `splash.png` is regenerated, `CANVAS_W/H/LOGO` in `SplashScreen.js` must be updated too.
- On Android the native logo is small (legacy splash at 200dp). Not a launch target.
