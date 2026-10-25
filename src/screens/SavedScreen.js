import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FloatingSymbols from '../components/FloatingSymbols';
import { StepContent } from '../components/SolutionView';
import { toPlainMath } from '../lib/plainMath';
import { useAuth } from '../hooks/useAuth';
import {
  fetchSavedProblems,
  deleteSavedProblem,
  clearSavedProblems,
} from '../services/dbService';
import { colors, spacing, radius, typography } from '../theme';

const DIFF_COLOR = { Easy: colors.green, Medium: colors.gold, Hard: '#EF4444', Advanced: colors.purple };

function SavedItem({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const diffColor = DIFF_COLOR[item.difficulty] || colors.blue;
  const date = new Date(item.saved_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.cardIconWrap}>
          <Ionicons name="calculator-outline" size={18} color={colors.blue} />
        </View>

        <View style={styles.cardInfo}>
          {item.problem_type ? (
            <Text style={styles.cardType}>{item.problem_type.toUpperCase()}</Text>
          ) : null}
          <Text style={styles.cardTitle} numberOfLines={2}>{toPlainMath(item.title)}</Text>
          <View style={styles.cardMeta}>
            {item.difficulty ? (
              <Text style={[styles.cardDiff, { color: diffColor }]}>{item.difficulty}</Text>
            ) : null}
            <Text style={styles.cardDate}>{date}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </TouchableOpacity>

      {expanded && item.steps?.length > 0 ? (
        <View style={styles.cardSteps}>
          <View style={styles.cardStepsDivider} />
          {item.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <StepContent step={step} explanationStyle={styles.stepContent} />
              </View>
            </View>
          ))}
          {item.answer ? (
            <View style={styles.answerChip}>
              <Text style={styles.answerChipLabel}>Answer: </Text>
              <Text style={styles.answerChipValue}>{toPlainMath(item.answer)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function SavedScreen() {
  const { session, user } = useAuth();
  const [items,     setItems]     = useState([]);
  // Starts true when signed in so the first frame is the spinner, not a
  // momentary "Nothing saved yet" before the focus effect kicks off the fetch.
  const [loading,   setLoading]   = useState(!!session);
  const [loadError, setLoadError] = useState(false);

  // fetchSavedProblems() never throws — it resolves { data: [], error } — so the
  // error has to be read off the result, or a network failure silently renders
  // as "Nothing saved yet" and looks like the user's saved problems are gone.
  const load = useCallback(() => {
    if (!session) { setItems([]); setLoading(false); return; }
    setLoading(true);
    setLoadError(false);
    fetchSavedProblems()
      .then(({ data, error }) => {
        if (error) { setLoadError(true); return; }
        setItems(data);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [session]);

  useFocusEffect(load);

  async function deleteItem(id) {
    Alert.alert('Delete', 'Remove this saved problem?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setItems(prev => prev.filter(i => i.id !== id));
          const { error } = await deleteSavedProblem(id);
          if (error) {
            Alert.alert('Couldn\'t delete', 'Check your connection and try again.');
            load(); // restore consistent state
          }
        },
      },
    ]);
  }

  async function clearAll() {
    Alert.alert('Clear All', 'Delete all saved problems? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => {
          const previous = items;
          setItems([]);
          const { error } = await clearSavedProblems(user.id);
          if (error) {
            setItems(previous);
            Alert.alert('Couldn\'t clear', 'Check your connection and try again.');
          }
        },
      },
    ]);
  }

  // ── Guest state ──────────────────────────────────────────────────────────────
  if (!session) {
    return (
      <View style={styles.root}>
        <FloatingSymbols />
        <View style={styles.bgGlow} />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Saved</Text>
            <Text style={styles.subtitle}>Your saved problems</Text>
          </View>
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bookmark-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Sign in to save problems</Text>
            <Text style={styles.emptyText}>
              Create a free account to save and sync your solved problems across devices.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FloatingSymbols />
      <View style={styles.bgGlow} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Saved</Text>
            <Text style={styles.subtitle}>
              {loading ? 'Loading…' : `${items.length} saved problem${items.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          {items.length > 0 ? (
            <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.blue} size="large" />
          </View>
        ) : loadError && items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Couldn't load saved problems</Text>
            <Text style={styles.emptyText}>Check your connection and try again.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bookmark-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyText}>
              Solve a problem and tap <Text style={{ color: colors.blue }}>Save</Text> to keep it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <SavedItem item={item} onDelete={deleteItem} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg },
  bgGlow: { position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: colors.blue, opacity: 0.05 },
  safe:   { flex: 1 },

  header:       { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.md },
  title:        { ...typography.h1, color: colors.textPrimary },
  subtitle:     { ...typography.caption, color: colors.textSub, marginTop: 2 },
  clearBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  clearBtnText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list:        { paddingHorizontal: spacing.md, paddingBottom: 120 },

  card:        { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm + 2, overflow: 'hidden' },
  cardHeader:  { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, alignItems: 'flex-start' },
  cardIconWrap:{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.blue + '18', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.blue + '30', flexShrink: 0 },
  cardInfo:    { flex: 1 },
  cardType:    { fontSize: 9, fontWeight: '800', color: colors.blue, letterSpacing: 0.8, marginBottom: 3 },
  cardTitle:   { ...typography.body, color: colors.textPrimary, fontWeight: '600', lineHeight: 20, marginBottom: 4 },
  cardMeta:    { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  cardDiff:    { fontSize: 11, fontWeight: '700' },
  cardDate:    { fontSize: 11, color: colors.textMuted },
  cardActions: { alignItems: 'center', gap: spacing.xs },

  cardSteps:        { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  cardStepsDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  stepRow:          { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  stepNum:          { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.blue + '18', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1, borderColor: colors.blue + '30' },
  stepNumText:      { fontSize: 10, fontWeight: '800', color: colors.blue },
  stepBody:         { flex: 1 },
  stepTitle:        { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  stepContent:      { ...typography.caption, color: colors.textSub, lineHeight: 18 },
  answerChip:       { flexDirection: 'row', backgroundColor: colors.gold + '18', borderRadius: radius.md, padding: spacing.sm + 2, borderWidth: 1, borderColor: colors.gold + '30', marginTop: spacing.xs },
  answerChipLabel:  { fontSize: 12, fontWeight: '700', color: colors.gold },
  answerChipValue:  { fontSize: 12, color: colors.textPrimary, fontWeight: '600', flex: 1 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyIcon:  { width: 80, height: 80, borderRadius: radius.xl, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  emptyText:  { ...typography.body, color: colors.textSub, textAlign: 'center', lineHeight: 22 },
  retryBtn:     { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, borderWidth: 1, borderColor: colors.border },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: colors.blue },
});
