import 'react-native-url-polyfill/auto';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import * as Sentry from '@sentry/react-native';
import { AuthProvider } from './src/context/AuthContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

// Reinstalled 2026-09-23 (KI-09) — was removed during the KI-R17 crash bisection
// and never restored, since removing it turned out not to be the actual fix
// (KI-R16). No mobileReplayIntegration here on purpose: that's what triggered the
// separate real Sentry bug in KI-R16 (SIGABRT when configured without setup),
// fixed upstream in 8.6.0 but not worth re-enabling without a real need for it.
// Source-map upload is disabled via the SENTRY_DISABLE_AUTO_UPLOAD EAS env var
// (KI-06) — crash reports work, stack traces just aren't symbolicated yet.
//
// Wrapped in try/catch on purpose: any dev-client build made before this package
// was added doesn't have Sentry's native module linked, so Sentry.init() would
// throw over Fast Refresh on an already-running install rather than waiting for a
// fresh build — same class of crash as KI-R14-R19. Fails silently to "no crash
// reporting" instead, exactly like every other optional-native-module guard added
// this session (see src/lib/iap.js).
let sentryReady = false;
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      enabled: !__DEV__,
      tracesSampleRate: 0.2,
    });
    sentryReady = true;
  } catch (e) {
    console.log('[Sentry] init failed, continuing without crash reporting', e?.message);
  }
}

function wrapWithSentry(RootComponent) {
  if (!sentryReady) return RootComponent;
  try {
    return Sentry.wrap(RootComponent);
  } catch (e) {
    console.log('[Sentry] wrap failed, continuing without crash reporting', e?.message);
    return RootComponent;
  }
}

// React Navigation v7 requires a `fonts` object on the theme (regular/medium/bold/heavy,
// each { fontFamily, fontWeight }) — native-stack's header config reads it unconditionally.
// This theme never had one, so `theme.fonts.regular` was undefined, throwing
// "Cannot read property 'regular' of undefined" the moment any native-stack screen
// rendered. Spreading DarkTheme's own (platform-correct) fonts fixes it.
const NAV_THEME = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary:      colors.blue,
    background:   colors.bg,
    card:         colors.surface,
    text:         colors.textPrimary,
    border:       colors.border,
    notification: colors.gold,
  },
};

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <SafeAreaProvider>
          <NavigationContainer theme={NAV_THEME}>
            <StatusBar style="light" translucent />
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default registerRootComponent(wrapWithSentry(App));
