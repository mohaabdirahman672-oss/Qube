import React, { createContext, useState, useEffect } from 'react';
import { Linking } from 'react-native';
import { GoogleSignin, statusCodes } from '../lib/googleSignIn';
import * as Crypto from 'expo-crypto';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import * as authService from '../services/authService';
import { parseAuthDeepLink } from '../lib/authDeepLink';

// Configure Google Sign-In (uses Supabase, no Firebase required).
// iosClientId is required explicitly — the native module otherwise falls back to
// reading GoogleService-Info.plist, which no longer exists (Firebase-era leftover,
// removed 2026-09-22) and pointed at the wrong Google Cloud project anyway.
GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ['email', 'profile'],
});

function generateNonce(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Maps raw Supabase error messages to user-friendly strings
function mapError(error) {
  if (!error) return null;
  const msg = (error.message || '').toLowerCase();
  if (msg.includes('email not confirmed'))        return 'Please verify your email — check your inbox';
  if (msg.includes('invalid login credentials'))  return 'Wrong email or password';
  if (msg.includes('user already registered'))    return 'An account with this email already exists';
  if (msg.includes('password should be at least'))return 'Password must be at least 8 characters';
  if (msg.includes('too many requests'))          return 'Too many attempts — please wait a moment';
  if (msg.includes('unable to validate email'))   return 'Enter a valid email address';
  if (msg.includes('network') || msg.includes('fetch')) return 'No connection — check your internet and try again';
  return 'Something went wrong — please try again';
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // No Supabase credentials — show auth screens so user can configure
      setLoading(false);
      return;
    }

    // Load persisted session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Keep session state in sync with Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Password reset / email confirmation links land here (see app.json's "scheme": "qube").
  // Supabase's JS client only auto-detects sessions in URLs on web, so on native the
  // access/refresh tokens are extracted from the incoming link by hand.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    function handleUrl({ url }) {
      const tokens = parseAuthDeepLink(url);
      if (tokens) supabase.auth.setSession(tokens);
    }

    Linking.getInitialURL().then(url => url && handleUrl({ url }));
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, []);

  // ── Email / Password ─────────────────────────────────────────────────────

  async function signUpEmail(email, password) {
    if (!isSupabaseConfigured) {
      return { error: 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.' };
    }
    const { data, error } = await authService.signUpWithEmail(email, password);
    if (error) return { error: mapError(error) };
    return { data };
  }

  async function signInEmail(email, password) {
    if (!isSupabaseConfigured) {
      return { error: 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.' };
    }
    const { data, error } = await authService.signInWithEmail(email, password);
    if (error) return { error: mapError(error) };
    return { data };
  }

  async function sendPasswordReset(email) {
    if (!isSupabaseConfigured) {
      return { error: 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.' };
    }
    const { error } = await authService.sendPasswordReset(email);
    if (error) return { error: mapError(error) };
    return {};
  }

  async function updateDisplayName(name) {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured.' };
    const { data, error } = await supabase.auth.updateUser({ data: { display_name: name.trim() } });
    if (error) return { error: mapError(error) };
    return { data };
  }

  async function updatePassword(password) {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured.' };
    const { data, error } = await authService.updatePassword(password);
    if (error) return { error: mapError(error) };
    setPasswordRecovery(false);
    return { data };
  }

  async function signOut() {
    if (isSupabaseConfigured) {
      await authService.signOutUser();
    }
    try { await GoogleSignin.signOut(); } catch {}
    setPasswordRecovery(false);
  }

  // ── Google Sign-In (Supabase via native Google SDK) ─────────────────────

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured.' };
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) return { error: 'No ID token received from Google.' };

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token:    idToken,
      });
      if (error) return { error: mapError(error) };
      return { data };
    } catch (error) {
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === statusCodes.IN_PROGRESS
      ) {
        return null;
      }
      return { error: 'Google sign in failed. Please try again.' };
    }
  }

  // ── Apple Sign-In (Supabase via native Apple SDK) ────────────────────────

  async function signInWithApple() {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured.' };

    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) return { error: 'Apple Sign-In is not supported on this device.' };

    try {
      const rawNonce    = generateNonce(32);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        return { error: 'Apple Sign In failed — no identity token received.' };
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token:    credential.identityToken,
        nonce:    rawNonce,
      });
      if (error) return { error: mapError(error) };
      return { data };
    } catch (err) {
      if (err?.code === 'ERR_REQUEST_CANCELED') return null;
      return { error: 'Apple sign in failed. Please try again.' };
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      passwordRecovery,
      signUpEmail,
      signInEmail,
      signOut,
      sendPasswordReset,
      updateDisplayName,
      updatePassword,
      signInWithGoogle,
      signInWithApple,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
