import React, { createContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { GoogleSignin, statusCodes } from '../lib/googleSignIn';
import * as Crypto from 'expo-crypto';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import appleAuth from '../lib/appleAuth';

if (isFirebaseConfigured) {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    scopes: ['email', 'profile'],
  });
}

function generateNonce(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // When Firebase isn't configured (no .env), skip auth and go straight to app
  const [user, setUser]       = useState(isFirebaseConfigured ? null : { uid: 'preview' });
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo?.data?.idToken ?? userInfo?.idToken;
      if (!idToken) throw new Error('No ID token received from Google');
      const credential = GoogleAuthProvider.credential(idToken);
      return signInWithCredential(auth, credential);
    } catch (error) {
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === statusCodes.IN_PROGRESS
      ) {
        return null;
      }
      throw error;
    }
  }

  async function signInWithApple() {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured');
    if (!appleAuth?.isSupported) {
      throw new Error('Apple Sign In is not supported on this device');
    }

    const rawNonce    = generateNonce(32);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );

    const appleAuthRequest = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes:    [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      nonce: hashedNonce,
    });

    if (!appleAuthRequest.identityToken) {
      throw new Error('Apple Sign In failed — no identity token returned');
    }

    const provider   = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken:  appleAuthRequest.identityToken,
      rawNonce,
    });

    return signInWithCredential(auth, credential);
  }

  async function signOut() {
    if (!isFirebaseConfigured) return;
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore
    }
    return firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
