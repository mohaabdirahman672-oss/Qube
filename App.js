import 'react-native-url-polyfill/auto';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

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
      <SafeAreaProvider>
        <NavigationContainer theme={NAV_THEME}>
          <StatusBar style="light" translucent />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default registerRootComponent(App);
