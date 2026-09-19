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

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();

  const [password,      setPassword]      = useState('');
  const [confirm,       setConfirm]       = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError,  setConfirmError]  = useState(false);

  const confirmRef = useRef(null);

  function validate() {
    const ok = {
      password: password.length >= 8,
      confirm:  password === confirm && confirm.length > 0,
    };
    setPasswordError(!ok.password);
    setConfirmError(!ok.confirm);
    if (!ok.password) { setError('Password must be at least 8 characters.'); return false; }
    if (!ok.confirm)  { setError('Passwords do not match.'); return false; }
    return true;
  }

  async function handleSave() {
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const { error: authError } = await updatePassword(password);
      if (authError) setError(authError);
      // On success, passwordRecovery flips false and RootNavigator returns to the app.
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
            <View style={styles.titleWrap}>
              <Text style={styles.title}>New Password</Text>
              <Text style={styles.subtitle}>
                Choose a new password for your account.
              </Text>
            </View>

            <View style={{ flex: 1, minHeight: 48 }} />

            <View style={styles.form}>
              <AuthInput
                value={password}
                onChangeText={v => { setPassword(v); setPasswordError(false); setError(null); }}
                placeholder="New password (min. 8 characters)"
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
                placeholder="Confirm new password"
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleSave}
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
                onPress={handleSave}
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
                    <Text style={styles.btnText}>Save Password</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },

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

  titleWrap: { paddingTop: spacing.xxl ?? spacing.xl + spacing.lg },
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

  form: { paddingBottom: spacing.xl },

  btn: {
    height: 56,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  btnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.6 },
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
  errorText: { color: colors.gold, fontSize: 13, flex: 1, lineHeight: 18 },
});
