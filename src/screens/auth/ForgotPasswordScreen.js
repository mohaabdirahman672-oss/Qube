import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import FloatingSymbols from '../../components/FloatingSymbols';
import AuthInput from '../../components/AuthInput';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, radius } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const { sendPasswordReset } = useAuth();

  const [email,      setEmail]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [sent,       setSent]       = useState(false);
  const [emailError, setEmailError] = useState(false);

  async function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(true);
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setEmailError(false);
    setLoading(true);
    try {
      const { error: authError } = await sendPasswordReset(trimmed);
      if (authError) {
        setError(authError);
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <FloatingSymbols />
      <View style={styles.bgGlowBlue} />

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
            {/* Back */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {sent
                  ? 'Reset email sent successfully.'
                  : 'Enter your email and we\'ll send you a link to reset your password.'}
              </Text>
            </View>

            <View style={{ flex: 1, minHeight: 48 }} />

            {sent ? (
              // ── Success state ─────────────────────────────
              <View style={styles.sentWrap}>
                <LinearGradient
                  colors={[colors.green + '22', colors.green + '08']}
                  style={styles.sentIconBadge}
                >
                  <Ionicons name="checkmark-circle-outline" size={44} color={colors.green} />
                </LinearGradient>
                <Text style={styles.sentTitle}>Check your inbox</Text>
                <Text style={styles.sentBody}>
                  We sent a password reset link to
                </Text>
                <Text style={styles.sentEmail}>{email.trim()}</Text>
                <Text style={styles.sentHint}>
                  The link expires in 1 hour. Check your spam folder if you don't see it.
                </Text>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.blue, colors.blueMid]}
                    style={styles.btnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.btnText}>Back to Sign In</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              // ── Form ──────────────────────────────────────
              <View style={styles.form}>
                <AuthInput
                  value={email}
                  onChangeText={v => { setEmail(v); setEmailError(false); setError(null); }}
                  placeholder="Email address"
                  keyboardType="email-address"
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                  hasError={emailError}
                  editable={!loading}
                />

                {error && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.gold} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.btn, loading && styles.btnDisabled]}
                  onPress={handleSend}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={loading ? [colors.border, colors.border] : [colors.blue, colors.blueMid]}
                    style={styles.btnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.btnText}>Send Reset Email</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backToSignIn}
                  disabled={loading}
                >
                  <Text style={styles.backToSignInText}>
                    Back to{' '}
                    <Text style={styles.backToSignInLink}>Sign In →</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
    top: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.blue,
    opacity: 0.06,
  },

  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  titleWrap: {
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSub,
    fontWeight: '400',
    lineHeight: 22,
  },

  form: {
    paddingBottom: spacing.xl,
  },

  btn: {
    height: 56,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  btnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
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

  backToSignIn: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  backToSignInText: {
    fontSize: 14,
    color: colors.textSub,
  },
  backToSignInLink: {
    color: colors.blue,
    fontWeight: '600',
  },

  // ── Sent state ───────────────────────────────────
  sentWrap: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  sentIconBadge: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  sentTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sentBody: {
    fontSize: 15,
    color: colors.textSub,
    textAlign: 'center',
  },
  sentEmail: {
    fontSize: 15,
    color: colors.blue,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  sentHint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
