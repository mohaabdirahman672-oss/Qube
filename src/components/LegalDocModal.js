import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

// Renders a legal doc (or About Qube) natively in-app, in the app's own theme,
// instead of bouncing out to an external browser — see docs/known-issues.md,
// the "opens claude.ai" bug found 2026-09-23. Content lives in
// src/data/legalContent.js; this component is just the shell + renderer.
export default function LegalDocModal({ visible, onClose, title, subtitle, sections, footer }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {sections.map((s, i) => (
              <View key={s.heading} style={[styles.section, i === 0 && { borderTopWidth: 0 }]}>
                <Text style={styles.sectionNum}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={styles.sectionBody}>
                  <Text style={styles.sectionHeading}>{s.heading}</Text>
                  <Text style={styles.sectionText}>{s.body}</Text>
                </View>
              </View>
            ))}
            {footer}
            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerText: { flex: 1 },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  section: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sectionNum: {
    ...typography.h2,
    color: colors.blue,
    width: 30,
    flexShrink: 0,
  },
  sectionBody: { flex: 1 },
  sectionHeading: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  sectionText: { ...typography.body, color: colors.textSub, lineHeight: 22 },
});
