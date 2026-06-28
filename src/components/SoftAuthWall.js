import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

export default function SoftAuthWall({ visible, onClose, onCreateAccount, onLogin }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Icon badge */}
          <LinearGradient
            colors={[colors.gold + '35', colors.gold + '10']}
            style={styles.iconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="bookmark" size={30} color={colors.gold} />
          </LinearGradient>

          {/* Copy */}
          <Text style={styles.title}>Save Your Progress</Text>
          <Text style={styles.body}>
            Create a free QUBE account to save your work, sync across devices, and never lose your progress.
          </Text>

          {/* Create Account — gold CTA matching Solve button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onCreateAccount}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.gold, colors.goldDark]}
              style={styles.primaryBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryBtnText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.black} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Login — secondary */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Login</Text>
          </TouchableOpacity>

          {/* Continue without saving */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.skipBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.skipText}>Continue Without Saving</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.xl,
  },

  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gold + '30',
  },

  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },

  primaryBtn: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  primaryBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: 0.2,
  },

  secondaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.blue,
  },

  skipBtn: {
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
