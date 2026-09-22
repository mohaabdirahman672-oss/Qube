import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

// Shared "shape of what you're missing" preview mechanic (docs/plans/freemium-paywall-v2.md
// feature-preview mechanic) — used for flashcard worked examples, similar-question
// content, and the graphing stub. Renders the real content underneath a blur so free
// users see genuine layout/length, not a placeholder, with a lock affordance on top
// that routes to the paywall.
export default function LockedPreview({
  locked = true,
  onPress,
  label = 'Unlock with Premium',
  intensity = 22,
  minHeight,
  children,
}) {
  if (!locked) return children;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.wrap, minHeight ? { minHeight } : null]}
    >
      <View pointerEvents="none" style={styles.content}>{children}</View>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay}>
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={16} color={colors.gold} />
        </View>
        {!!label && <Text style={styles.label}>{label}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    opacity: 0.9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  lockBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.gold + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
    backgroundColor: colors.bg + 'CC',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
});
