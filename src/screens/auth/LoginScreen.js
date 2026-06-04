import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import FloatingSymbols from '../../components/FloatingSymbols';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, radius } from '../../theme';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading,  setAppleLoading]  = useState(false);
  const [error, setError] = useState(null);

  const busy = googleLoading || appleLoading;

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // null return = user cancelled — AuthContext onAuthStateChanged handles the rest
    } catch {
      setError('Google sign in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleApple() {
    setError(null);
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (err) {
      // err.code 1001 = user cancelled Apple sheet — silent
      if (err?.code !== '1001' && err?.code !== 1001) {
        setError('Apple sign in failed. Please try again.');
      }
    } finally {
      setAppleLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <FloatingSymbols />
      <View style={styles.bgGlowBlue} />
      <View style={styles.bgGlowGold} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* ── Brand ────────────────────────────── */}
        <View style={styles.brand}>
          <LinearGradient
            colors={[colors.blue, colors.blueDark]}
            style={styles.logoBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoLetter}>Q</Text>
          </LinearGradient>
          <Text style={styles.wordmark}>QUBE</Text>
          <Text style={styles.tagline}>Math. Every Dimension.</Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* ── Auth buttons ─────────────────────── */}
        <View style={styles.authSection}>
          <Text style={styles.signInLabel}>Sign in to continue</Text>

          {/* Google */}
          <TouchableOpacity
            style={[styles.btn, styles.googleBtn]}
            onPress={handleGoogle}
            disabled={busy}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.bg} size="small" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.btnIcon} />
                <Text style={styles.googleText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple — iOS only */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.btn, styles.appleBtn]}
              onPress={handleApple}
              disabled={busy}
              activeOpacity={0.85}
            >
              {appleLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={22} color={colors.white} style={styles.btnIcon} />
                  <Text style={styles.appleText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.gold} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Legal */}
          <Text style={styles.legal}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  bgGlowBlue: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.blue,
    opacity: 0.07,
  },
  bgGlowGold: {
    position: 'absolute',
    bottom: 80,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.gold,
    opacity: 0.05,
  },

  brand: {
    alignItems: 'center',
    paddingTop: spacing.xxl + spacing.lg,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 14,
  },
  logoLetter: {
    fontSize: 46,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -2,
  },
  wordmark: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 7,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSub,
    fontWeight: '400',
    letterSpacing: 0.4,
  },

  authSection: {
    paddingBottom: spacing.xl,
  },
  signInLabel: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  btnIcon: {
    marginRight: 10,
  },

  googleBtn: {
    backgroundColor: '#FFFFFF',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: 0.1,
  },

  appleBtn: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  appleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.1,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold + '15',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.gold + '35',
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.gold,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  legal: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  legalLink: {
    color: colors.blue,
    fontWeight: '600',
  },
});
