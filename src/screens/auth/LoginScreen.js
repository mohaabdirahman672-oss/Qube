import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Linking,
} from 'react-native';

const PRIVACY_URL = 'https://spot-hurricane-661.notion.site/Qube-Privacy-Policy-Last-updated-August-2026-3b838d7712fc803a8025f809d0fca230';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import FloatingSymbols from '../../components/FloatingSymbols';
import AuthInput from '../../components/AuthInput';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, radius } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { signInWithGoogle, signInWithApple, signInEmail } = useAuth();

  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [emailLoading,  setEmailLoading]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading,  setAppleLoading]  = useState(false);
  const [error,         setError]         = useState(null);
  const [emailError,    setEmailError]    = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const passwordRef = useRef(null);
  const busy = emailLoading || googleLoading || appleLoading;

  async function handleEmailSignIn() {
    const trimmed = email.trim();
    const missingEmail    = !trimmed;
    const missingPassword = !password;
    setEmailError(missingEmail);
    setPasswordError(missingPassword);
    if (missingEmail || missingPassword) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setEmailLoading(true);
    try {
      const { error: authError } = await signInEmail(trimmed, password);
      if (authError) setError(authError);
      // On success: onAuthStateChange in AuthContext fires → RootNavigator auto-navigates
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Brand ─────────────────────────── */}
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

            <View style={{ flex: 1, minHeight: 24 }} />

            {/* ── Auth section ──────────────────── */}
            <View style={styles.authSection}>
              {/* Email form */}
              <AuthInput
                value={email}
                onChangeText={v => { setEmail(v); setEmailError(false); setError(null); }}
                placeholder="Email address"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                hasError={emailError}
                editable={!busy}
              />
              <AuthInput
                ref={passwordRef}
                value={password}
                onChangeText={v => { setPassword(v); setPasswordError(false); setError(null); }}
                placeholder="Password"
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleEmailSignIn}
                hasError={passwordError}
                editable={!busy}
              />

              {/* Forgot password */}
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotWrap}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                disabled={busy}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Sign In button */}
              <TouchableOpacity
                style={[styles.btn, busy && styles.btnDisabled]}
                onPress={handleEmailSignIn}
                disabled={busy}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={busy ? [colors.border, colors.border] : [colors.blue, colors.blueMid]}
                  style={styles.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {emailLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.signInText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google */}
              <TouchableOpacity
                style={[styles.btn, styles.googleBtn, busy && styles.btnDisabled]}
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
                  style={[styles.btn, styles.appleBtn, busy && styles.btnDisabled]}
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

              {/* Create account */}
              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                style={styles.createWrap}
                disabled={busy}
              >
                <Text style={styles.createText}>
                  Don't have an account?{' '}
                  <Text style={styles.createLink}>Create one →</Text>
                </Text>
              </TouchableOpacity>

              {/* Legal */}
              <Text style={styles.legal}>
                By continuing, you agree to our{' '}
                <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_URL)}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_URL)}>Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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

  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: spacing.md,
  },
  forgotText: {
    fontSize: 13,
    color: colors.blue,
    fontWeight: '500',
  },

  btn: {
    height: 56,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  btnIcon: {
    marginRight: 10,
  },

  googleBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.1,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    fontWeight: '500',
    letterSpacing: 0.3,
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

  createWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  createText: {
    fontSize: 14,
    color: colors.textSub,
  },
  createLink: {
    color: colors.blue,
    fontWeight: '600',
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
