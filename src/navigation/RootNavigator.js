import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import AppNavigator         from './AppNavigator';
import LoginScreen          from '../screens/auth/LoginScreen';
import SignUpScreen         from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import SplashScreen         from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show animated splash on first launch; auth resolves well within the ~2.5s window
  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* MainTabs is always first — every user (guest or signed-in) gets the app immediately */}
      <Stack.Screen
        name="MainTabs"
        component={AppNavigator}
        options={{ animation: 'none' }}
      />

      {/* Auth screens are in the stack when logged out but never forced.
          Navigated to from ProfileScreen or SoftAuthWall.
          When session becomes non-null (after login/signup), React Navigation
          automatically removes these and returns the user to MainTabs. */}
      {!session && (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
