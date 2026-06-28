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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import FloatingSymbols from '../../components/FloatingSymbols';
import AuthInput from '../../components/AuthInput';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, radius } from '../../theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen({ navigation }) {
  const { signUpEmail } = useAuth();

  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [confirm,       setConfirm]       = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(false);
  const [emailError,    setEmailError]    = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError,  setConfirmError]  = useState(false);

  const passwordRef = useRef(null);
  const confirmRef  = useRef(null);

  function validate() {
    const trimmed = email.trim();
    const ok = {
      email:    EMAIL_RE.test(trimmed),
      password: password.length >= 8,
      confirm:  password === confirm && confirm.length > 0,
    };
    setEmailError(!ok.email);
    setPasswordError(!ok.password);
    setConfirmError(!ok.confirm);
    if (!ok.email)    { setError('Enter a valid email address.'); return false; }
    if (!ok.password) { setError('Password must be at least 8 characters.'); return false; }
    if (!ok.confirm)  { setError('Passwords do not match.'); return false; }
    return true;
  }

  async function handleSignUp() {
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const { error: authError } = await signUpEmail(email.trim(), password);
      if (authError) {
        setError(authError);
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={styles.root}>
        <FloatingSymbols />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.successWrap}>
            <LinearGradient
              colors={[colors.blue + '22', colors.blue + '08']}
              style={styles.successIconBadge}
            >
              <Ionicons name="mail-outline" size={40} color={colors.blue} />
            </LinearGradient>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successBody}>
              We sent a confirmation link to
            </Text>
            <Text style={styles.successEmail}>{email.trim()}</Text>
            <Text style={styles.successHint}>
              Click the link in the email to activate your account, then sign in.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.blue, colors.blueMid]}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.successBtnText}>Back to Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Qube and start solving</Text>
            </View>

            <View style={{ flex: 1, minHeight: 32 }} />

            {/* Form */}
            <View style={styles.form}>
              <AuthInput
                value={email}
                onChangeText={v => { setEmail(v); setEmailError(false); setError(null); }}
                placeholder="Email address"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                hasError={emailError}
                editable={!loading}
              />
              <AuthInput
                ref={passwordRef}
                value={password}
                onChangeText={v => { setPassword(v); setPasswordError(false); setError(null); }}
                placeholder="Password (min. 8 characters)"
                isPassword
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                hasError={passwordError}
                editable={!loading}
              />
              <AuthInput
                ref={confirmRef}
                value={confirm}
                onChangeText={v => { setConfirm(v); setConfirmError(false); setError(null); }}
                placeholder="Confirm password"
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                hasError={confirmError}
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
                onPress={handleSignUp}
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
                    <Text style={styles.btnText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.signInWrap}
                disabled={loading}
              >
                <Text style={styles.signInText}>
                  Already have an account?{' '}
                  <Text style={styles.signInLink}>Sign in →</Text>
                </Text>
              </TouchableOpacity>
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
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
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
    fontSize: 16,
    color: colors.textSub,
    fontWeight: '400',
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

  signInWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  signInText: {
    fontSize: 14,
    color: colors.textSub,
  },
  signInLink: {
    color: colors.blue,
    fontWeight: '600',
  },

  // ── Success state ────────────────────────────────
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIconBadge: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successBody: {
    fontSize: 15,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 22,
  },
  successEmail: {
    fontSize: 15,
    color: colors.blue,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  successHint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.xl,
  },
  successBtn: {
    width: '100%',
    height: 56,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  successBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
});
