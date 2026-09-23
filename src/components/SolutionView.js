import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

const DIFF_COLOR = { Easy: colors.green, Medium: colors.gold, Hard: '#EF4444', Advanced: colors.purple };

// Everything the solve function told the user, in one place — rendered live by
// SolveScreen and replayed from history by RecentSolveModal, so the two can't
// drift apart. Renders content only (no card chrome, no Solve-screen actions);
// meant to sit inside a container with `gap` spacing like SolveScreen's card.
// onTryNext is optional: without it, "Try this next" shows the question only.
export default function SolutionView({ result, onTryNext }) {
  return (
    <>
      {/* Type + difficulty */}
      {(result.problemType || result.difficulty) ? (
        <View style={styles.badgeRow}>
          {result.problemType ? (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{result.problemType.toUpperCase()}</Text>
            </View>
          ) : null}
          {result.difficulty ? (
            <View style={[styles.diffBadge, { borderColor: DIFF_COLOR[result.difficulty] + '50' }]}>
              <Text style={[styles.diffBadgeText, { color: DIFF_COLOR[result.difficulty] }]}>
                {result.difficulty}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Method explanation */}
      {result.explanation ? (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>{result.explanation}</Text>
        </View>
      ) : null}

      {/* Steps */}
      {(result.steps || []).map((step, i) => (
        <View key={i}>
          {i > 0 ? <View style={styles.stepDivider} /> : null}
          <View style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepContent}>{step.body}</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Answer */}
      {result.answer ? (
        <LinearGradient
          colors={[colors.goldDark + '22', colors.gold + '11']}
          style={styles.answerBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.answerLabel}>ANSWER</Text>
          <Text style={styles.answerValue}>{result.answer}</Text>
        </LinearGradient>
      ) : null}

      {/* Common mistake */}
      {result.commonMistake ? (
        <View style={styles.mistakeBox}>
          <Ionicons name="warning-outline" size={16} color={colors.gold} />
          <View style={styles.mistakeTextWrap}>
            <Text style={styles.mistakeLabel}>Common Mistake</Text>
            <Text style={styles.mistakeText}>{result.commonMistake}</Text>
          </View>
        </View>
      ) : null}

      {/* Key formula */}
      {result.formula ? (
        <View style={styles.formulaChip}>
          <Ionicons name="flask-outline" size={14} color={colors.blue} />
          <Text style={styles.formulaText}>{result.formula}</Text>
        </View>
      ) : null}

      {/* Try this next */}
      {result.practiceQuestion ? (
        <View style={styles.practiceNextCard}>
          <Text style={styles.practiceNextLabel}>TRY THIS NEXT</Text>
          <Text style={[styles.practiceNextQ, !onTryNext && { marginBottom: 0 }]}>{result.practiceQuestion}</Text>
          {onTryNext ? (
            <TouchableOpacity style={styles.practiceNextBtn} onPress={onTryNext} activeOpacity={0.8}>
              <Text style={styles.practiceNextBtnText}>Solve This →</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  badgeRow:      { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  typeBadge:     { backgroundColor: colors.blue + '18', borderRadius: radius.full, paddingHorizontal: spacing.sm + 2, paddingVertical: 3, borderWidth: 1, borderColor: colors.blue + '30' },
  typeBadgeText: { fontSize: 10, fontWeight: '800', color: colors.blue, letterSpacing: 0.8 },
  diffBadge:     { borderRadius: radius.full, paddingHorizontal: spacing.sm + 2, paddingVertical: 3, borderWidth: 1 },
  diffBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  explanationBox:  { backgroundColor: colors.blue + '0E', borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.blue },
  explanationText: { ...typography.body, color: colors.textSub, fontStyle: 'italic', lineHeight: 22 },

  stepDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  stepRow:     { flexDirection: 'row', gap: spacing.md },
  stepNum:     { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.blue + '18', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, borderWidth: 1, borderColor: colors.blue + '30' },
  stepNumText: { fontSize: 12, fontWeight: '800', color: colors.blue },
  stepBody:    { flex: 1 },
  stepTitle:   { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  stepContent: { ...typography.body, color: colors.textSub, lineHeight: 22 },

  answerBox:   { borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.gold + '30' },
  answerLabel: { fontSize: 9, fontWeight: '800', color: colors.gold, letterSpacing: 1.5, marginBottom: 4 },
  answerValue: { fontSize: 20, fontWeight: '800', color: colors.gold, letterSpacing: -0.3 },

  mistakeBox:      { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.gold + '0F', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.gold + '25', alignItems: 'flex-start' },
  mistakeTextWrap: { flex: 1 },
  mistakeLabel:    { fontSize: 10, fontWeight: '800', color: colors.gold, letterSpacing: 0.8, marginBottom: 3 },
  mistakeText:     { ...typography.caption, color: colors.textSub, lineHeight: 18 },

  formulaChip: { flexDirection: 'row', gap: spacing.xs + 2, alignItems: 'center', backgroundColor: colors.blue + '0E', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.blue + '20' },
  formulaText: { ...typography.caption, color: colors.blue, fontWeight: '600', flex: 1 },

  practiceNextCard:    { backgroundColor: colors.surfaceHigh, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.purple + '30' },
  practiceNextLabel:   { fontSize: 9, fontWeight: '800', color: colors.purple, letterSpacing: 1.5, marginBottom: spacing.sm },
  practiceNextQ:       { ...typography.body, color: colors.textPrimary, marginBottom: spacing.md, lineHeight: 22 },
  practiceNextBtn:     { backgroundColor: colors.purple + '22', borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.purple + '40' },
  practiceNextBtnText: { fontSize: 13, fontWeight: '700', color: colors.purple },
});
