import 'react-native-url-polyfill/auto';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

const NAV_THEME = {
  dark: true,
  colors: {
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
