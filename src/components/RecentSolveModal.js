import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SolutionView from './SolutionView';
import { recentSolveTitle } from '../lib/recentSolves';
import { colors, spacing, radius, typography } from '../theme';

const SOURCE_LABEL = { camera: 'Scanned', upload: 'Uploaded', type: 'Typed' };

export function formatSolvedAt(iso) {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Full replay of a past solve from Home's Recent list. Same useSafeAreaInsets()
// approach as LegalDocModal — SafeAreaView insets don't reliably reach content
// inside RN's <Modal> (KI-R25).
export default function RecentSolveModal({ visible, entry, onClose }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible && !!entry} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.root}>
        <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Solution</Text>
              {entry ? (
                <Text style={styles.subtitle}>
                  {SOURCE_LABEL[entry.source] || 'Solved'} · {formatSolvedAt(entry.solvedAt)}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          {entry ? (
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={styles.problemBox}>
                <Text style={styles.problemLabel}>PROBLEM</Text>
                <Text style={styles.problemText}>{recentSolveTitle(entry)}</Text>
              </View>
              <View style={styles.solutionCard}>
                <SolutionView result={entry.result} />
              </View>
              <View style={{ height: spacing.xl }} />
            </ScrollView>
          ) : null}
        </View>
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
  title:      { ...typography.h1, color: colors.textPrimary },
  subtitle:   { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.md },

  problemBox:   { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  problemLabel: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.xs },
  problemText:  { ...typography.body, color: colors.textPrimary, fontWeight: '600', lineHeight: 22 },

  solutionCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
});
