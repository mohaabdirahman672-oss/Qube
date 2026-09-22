import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Modal, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchCustomCards, insertCustomCard, deleteCustomCard } from '../services/dbService';
import { getWorkedExample } from '../services/flashcardApi';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import FloatingSymbols from '../components/FloatingSymbols';
import SoftAuthWall from '../components/SoftAuthWall';
import LockedPreview from '../components/LockedPreview';
import PaywallScreen from './PaywallScreen';
import { CATEGORIES, getCards, getProblems } from '../data/practiceData';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../context/SubscriptionContext';
import { colors, spacing, radius, typography } from '../theme';

const CARD_CATEGORIES  = CATEGORIES.filter(c => c !== 'All');
const TAGS             = ['FORMULA', 'IDENTITY', 'METHOD', 'THEOREM', 'RULE', 'MNEMONIC', 'DEFINITION'];

const DIFF_COLOR = { Easy: colors.green, Medium: colors.gold, Hard: '#EF4444' };
const DIFF_EMOJI = { Easy: '🟢', Medium: '🟡', Hard: '🔴' };
const TAG_COLOR  = {
  FORMULA: colors.blue, IDENTITY: colors.purple, METHOD: colors.gold,
  THEOREM: colors.green, RULE: '#EF4444', MNEMONIC: '#EC4899',
  DEFINITION: colors.textSub,
};

// ── Flashcard ─────────────────────────────────────────────────────────────────

function Flashcard({ card, index, total, onDelete, onLockedPress }) {
  const { isPremium } = useSubscription();
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const [workedExample, setWorkedExample] = useState(null);
  const [loadingExample, setLoadingExample] = useState(false);

  useEffect(() => {
    setFlipped(false);
    flipAnim.setValue(0);
    setWorkedExample(null);
  }, [index]);

  // Fetched lazily on first flip, not up front for every card in the deck —
  // Premium-only content (docs/plans/freemium-paywall-v2.md, decision 5), server
  // re-checks Premium regardless of what this client believes.
  useEffect(() => {
    if (!flipped || !isPremium || workedExample || loadingExample) return;
    setLoadingExample(true);
    getWorkedExample({ front: card.front, back: card.back, tag: card.tag })
      .then(setWorkedExample)
      .catch(() => setWorkedExample('Could not load a worked example right now.'))
      .finally(() => setLoadingExample(false));
  }, [flipped, isPremium, card.front, card.back, card.tag]);

  function handleFlip() {
    const toValue = flipped ? 0 : 1;
    Animated.spring(flipAnim, { toValue, useNativeDriver: true, tension: 120, friction: 10 }).start();
    setFlipped(!flipped);
  }

  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.45, 0.55, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0, 0.45, 0.55, 1], outputRange: [0, 0, 1, 1] });
  const cardScale    = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.94, 1] });
  const tagColor     = TAG_COLOR[card.tag] || colors.blue;

  return (
    <View style={styles.cardOuter}>
      <View style={styles.cardCounterRow}>
        <Text style={styles.cardCounter}>{index + 1} of {total}</Text>
        {card.custom && (
          <View style={styles.customBadge}>
            <Text style={styles.customBadgeText}>MY CARD</Text>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={handleFlip} activeOpacity={0.9}>
        <Animated.View style={[styles.cardWrap, { transform: [{ scale: cardScale }] }]}>
          {/* Front */}
          <Animated.View style={[styles.cardFace, styles.cardFront, { opacity: frontOpacity }]}>
            <View style={[styles.cardTagPill, { borderColor: tagColor + '50', backgroundColor: tagColor + '18' }]}>
              <Text style={[styles.cardTagText, { color: tagColor }]}>{card.tag}</Text>
            </View>
            <Text style={styles.cardFrontText}>{card.front}</Text>
            <View style={styles.tapHint}>
              <Ionicons name="repeat-outline" size={14} color={colors.textMuted} />
              <Text style={styles.tapHintText}>Tap to reveal answer</Text>
            </View>
          </Animated.View>

          {/* Back */}
          <Animated.View style={[styles.cardFace, styles.cardBack, { opacity: backOpacity }]}>
            <Text style={styles.cardBackText}>{card.back}</Text>

            <View style={styles.workedExampleWrap}>
              <Text style={styles.workedExampleLabel}>WORKED EXAMPLE</Text>
              <LockedPreview
                locked={!isPremium}
                onPress={!isPremium ? onLockedPress : undefined}
                label="Unlock worked examples"
                minHeight={64}
              >
                {isPremium ? (
                  loadingExample ? (
                    <ActivityIndicator color={colors.blue} style={{ marginTop: spacing.sm }} />
                  ) : (
                    <Text style={styles.workedExampleText}>{workedExample}</Text>
                  )
                ) : (
                  <Text style={styles.workedExampleText}>
                    {`For example, applying ${card.front.toLowerCase()} to specific numbers gives a step-by-step solution ending in a final answer, shown in full for Premium members.`}
                  </Text>
                )}
              </LockedPreview>
            </View>

            <View style={styles.tapHint}>
              <Ionicons name="repeat-outline" size={14} color={colors.textMuted} />
              <Text style={styles.tapHintText}>Tap to flip back</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {card.custom && onDelete && (
        <TouchableOpacity style={styles.deleteCardBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={13} color="#EF4444" />
          <Text style={styles.deleteCardText}>Delete card</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── ProblemCard ───────────────────────────────────────────────────────────────

function ProblemCard({ problem }) {
  const [revealed,   setRevealed]  = useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;

  function toggle() {
    const toValue = revealed ? 0 : 1;
    Animated.timing(revealAnim, { toValue, duration: 240, useNativeDriver: false }).start();
    setRevealed(!revealed);
  }

  const answerHeight = revealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] });
  const diffColor    = DIFF_COLOR[problem.difficulty] || colors.textSub;

  return (
    <View style={[styles.problemCard, revealed && { borderColor: diffColor + '40' }]}>
      <View style={[styles.diffBadge, { backgroundColor: diffColor + '18', borderColor: diffColor + '40' }]}>
        <Text style={styles.diffEmoji}>{DIFF_EMOJI[problem.difficulty]}</Text>
        <Text style={[styles.diffText, { color: diffColor }]}>{problem.difficulty}</Text>
      </View>
      <Text style={styles.problemQ}>{problem.question}</Text>
      <TouchableOpacity style={styles.revealBtn} onPress={toggle} activeOpacity={0.8}>
        <Text style={styles.revealBtnText}>{revealed ? 'Hide Answer' : 'Show Answer'}</Text>
        <Ionicons name={revealed ? 'chevron-up' : 'chevron-down'} size={14} color={colors.blue} />
      </TouchableOpacity>
      <Animated.View style={[styles.answerWrap, { maxHeight: answerHeight, overflow: 'hidden' }]}>
        <View style={styles.answerInner}>
          <Text style={styles.answerLabel}>Answer</Text>
          <Text style={styles.answerText}>{problem.answer}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ── AddCardModal ──────────────────────────────────────────────────────────────

function AddCardModal({ visible, onClose, onSave }) {
  const [front,    setFront]    = useState('');
  const [back,     setBack]     = useState('');
  const [category, setCategory] = useState('Algebra');
  const [tag,      setTag]      = useState('FORMULA');
  const backRef = useRef(null);

  function reset() {
    setFront('');
    setBack('');
    setCategory('Algebra');
    setTag('FORMULA');
  }

  function handleSave() {
    if (!front.trim() || !back.trim()) return;
    onSave({ front: front.trim(), back: back.trim(), category, tag });
    reset();
    onClose();
  }

  function handleCancel() {
    reset();
    onClose();
  }

  const canSave = front.trim().length > 0 && back.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleCancel} />

        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>New Flashcard</Text>

          {/* Front */}
          <Text style={styles.fieldLabel}>FRONT</Text>
          <TextInput
            style={styles.fieldInput}
            value={front}
            onChangeText={setFront}
            placeholder="Concept, formula, or question…"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={200}
            returnKeyType="next"
            onSubmitEditing={() => backRef.current?.focus()}
            autoFocus
          />

          {/* Back */}
          <Text style={styles.fieldLabel}>BACK (ANSWER)</Text>
          <TextInput
            ref={backRef}
            style={styles.fieldInput}
            value={back}
            onChangeText={setBack}
            placeholder="Explanation or answer…"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={300}
          />

          {/* Category */}
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: spacing.md }}
            contentContainerStyle={{ flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.md }}
          >
            {CARD_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.optionPill, category === c && styles.optionPillActive]}
              >
                <Text style={[styles.optionPillText, category === c && styles.optionPillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tag */}
          <Text style={styles.fieldLabel}>TAG</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: spacing.lg }}
            contentContainerStyle={{ flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.md }}
          >
            {TAGS.map(t => {
              const tColor   = TAG_COLOR[t] || colors.blue;
              const isActive = tag === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTag(t)}
                  style={[styles.optionPill, isActive && { backgroundColor: tColor + '22', borderColor: tColor + '60' }]}
                >
                  <Text style={[styles.optionPillText, isActive && { color: tColor }]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <LinearGradient
                colors={canSave ? [colors.blue, colors.blueMid] : [colors.border, colors.border]}
                style={styles.saveBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.saveBtnText}>Add Card</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function PracticeScreen({ navigation }) {
  const { session, user } = useAuth();
  const { isPremium } = useSubscription();
  const [showAuthWall,    setShowAuthWall]     = useState(false);
  const [showPaywall,     setShowPaywall]      = useState(false);

  const [category,        setCategory]        = useState('All');
  const [cardIndex,       setCardIndex]        = useState(0);
  const [customCards,     setCustomCards]      = useState([]);
  const [addModalVisible, setAddModalVisible]  = useState(false);

  useEffect(() => {
    if (!session) { setCustomCards([]); return; }
    fetchCustomCards()
      .then(({ data }) => setCustomCards(data.map(c => ({ ...c, custom: true }))))
      .catch(() => {});
  }, [session]);

  // Merge built-in cards with user's custom cards, filtered by active category
  const builtinCards   = getCards(category);
  const filteredCustom = category === 'All'
    ? customCards
    : customCards.filter(c => c.category === category);
  const allCards   = [...builtinCards, ...filteredCustom];
  const problems   = getProblems(category);
  const currentCard = allCards[cardIndex] ?? null;

  function switchCategory(cat) {
    setCategory(cat);
    setCardIndex(0);
  }

  function prev() { setCardIndex(i => (i - 1 + allCards.length) % allCards.length); }
  function next() { setCardIndex(i => (i + 1) % allCards.length); }

  function openAddCard() {
    if (!session) { setShowAuthWall(true); return; }
    setAddModalVisible(true);
  }

  async function handleAddCard({ front, back, category: cat, tag }) {
    const { data, error } = await insertCustomCard({ userId: user.id, front, back, category: cat, tag });
    if (error || !data) return;
    const newCard = { ...data, custom: true };
    setCustomCards(prev => [...prev, newCard]);
    if (category === 'All' || category === newCard.category) {
      setCardIndex(allCards.length);
    }
  }

  async function handleDeleteCard(id) {
    const updated     = customCards.filter(c => c.id !== id);
    const newFiltered = category === 'All' ? updated : updated.filter(c => c.category === category);
    const newTotal    = builtinCards.length + newFiltered.length;
    setCustomCards(updated);
    setCardIndex(i => Math.min(i, Math.max(0, newTotal - 1)));
    await deleteCustomCard(id);
  }

  return (
    <View style={styles.root}>
      <FloatingSymbols />
      <View style={styles.bgGlow} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Practice</Text>
            <Text style={styles.subtitle}>Sharpen your math skills</Text>
          </View>

          {/* Category pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pills}
            style={{ marginBottom: spacing.lg }}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.pill, category === cat && styles.pillActive]}
                onPress={() => switchCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Flashcard section header */}
          <View style={styles.sectionHeader}>
            <Ionicons name="layers-outline" size={16} color={colors.purple} />
            <Text style={styles.sectionTitle}>Flashcards</Text>
            <Text style={styles.sectionCount}>{allCards.length} cards</Text>
            <TouchableOpacity
              onPress={openAddCard}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="add-circle" size={24} color={colors.blue} />
            </TouchableOpacity>
          </View>

          {allCards.length > 0 ? (
            <>
              <Flashcard
                card={currentCard}
                index={cardIndex}
                total={allCards.length}
                onDelete={currentCard?.custom ? () => handleDeleteCard(currentCard.id) : null}
                onLockedPress={() => setShowPaywall(true)}
              />
              <View style={styles.navRow}>
                <TouchableOpacity style={styles.navBtn} onPress={prev} activeOpacity={0.8}>
                  <Ionicons name="chevron-back" size={20} color={colors.textSub} />
                  <Text style={styles.navBtnText}>Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={next} activeOpacity={0.8}>
                  <Text style={styles.navBtnText}>Next</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSub} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="layers-outline" size={28} color={colors.textMuted} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.emptyText}>No flashcards in this category yet.</Text>
              <TouchableOpacity onPress={openAddCard} style={{ marginTop: spacing.sm }}>
                <Text style={styles.emptyAddLink}>+ Add your first card</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Practice problems */}
          <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
            <Ionicons name="pencil-outline" size={16} color={colors.gold} />
            <Text style={styles.sectionTitle}>Practice Problems</Text>
            <Text style={styles.sectionCount}>{problems.length} problems</Text>
          </View>

          {problems.length > 0 ? (
            problems.map((p, i) => <ProblemCard key={i} problem={p} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No problems in this category yet.</Text>
            </View>
          )}

          {/* Homework-question generation — stubbed for launch (spec decision 4):
              shows the locked-preview mechanic so Premium messaging is accurate,
              no real generation behind it yet. */}
          <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
            <Ionicons name="library-outline" size={16} color={colors.green} />
            <Text style={styles.sectionTitle}>Homework Set</Text>
          </View>
          <LockedPreview
            locked={!isPremium}
            onPress={() => setShowPaywall(true)}
            label="Generate a homework set with Premium"
            minHeight={96}
          >
            <View style={styles.homeworkStubCard}>
              <Text style={styles.homeworkStubTitle}>10 {category === 'All' ? 'mixed-topic' : category} questions, generated from what you've studied</Text>
              <Text style={styles.homeworkStubSub}>Fresh set every time — Premium</Text>
            </View>
          </LockedPreview>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <AddCardModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddCard}
      />

      <SoftAuthWall
        visible={showAuthWall}
        onClose={() => setShowAuthWall(false)}
        onCreateAccount={() => { setShowAuthWall(false); navigation.navigate('SignUp'); }}
        onLogin={() => { setShowAuthWall(false); navigation.navigate('Login'); }}
      />

      <PaywallScreen
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        navigation={navigation}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg },
  bgGlow: { position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: colors.purple, opacity: 0.06 },
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.md },

  header:   { marginBottom: spacing.lg },
  title:    { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSub, marginTop: 2 },

  pills:         { paddingRight: spacing.md, gap: spacing.sm, flexDirection: 'row' },
  pill:          { paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillActive:    { backgroundColor: colors.purple + '22', borderColor: colors.purple + '60' },
  pillText:      { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  pillTextActive:{ color: colors.purple },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, marginBottom: spacing.md },
  sectionTitle:  { ...typography.h3, color: colors.textPrimary, flex: 1 },
  sectionCount:  { ...typography.caption, color: colors.textMuted },

  // Flashcard
  cardOuter:       { marginBottom: spacing.sm },
  cardCounterRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  cardCounter:     { ...typography.caption, color: colors.textMuted },
  customBadge:     { backgroundColor: colors.blue + '22', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: colors.blue + '50' },
  customBadgeText: { fontSize: 9, fontWeight: '800', color: colors.blue, letterSpacing: 0.8 },

  cardWrap:     { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, minHeight: 180, overflow: 'hidden' },
  cardFace:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  cardFront:    {},
  cardBack:     { backgroundColor: colors.surfaceHigh },
  cardTagPill:  { borderRadius: radius.full, paddingHorizontal: spacing.sm + 2, paddingVertical: 2, borderWidth: 1, marginBottom: spacing.md },
  cardTagText:  { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  cardFrontText:{ ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.lg },
  cardBackText: { ...typography.body, color: colors.textPrimary, textAlign: 'center', lineHeight: 26, fontWeight: '600', marginBottom: spacing.lg },
  workedExampleWrap: { width: '100%', marginBottom: spacing.md },
  workedExampleLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.xs, textAlign: 'center' },
  workedExampleText: { ...typography.caption, color: colors.textSub, textAlign: 'center', lineHeight: 18, padding: spacing.sm },
  tapHint:      { flexDirection: 'row', alignItems: 'center', gap: 4, position: 'absolute', bottom: spacing.md },
  tapHintText:  { ...typography.caption, color: colors.textMuted },

  deleteCardBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: spacing.sm, paddingVertical: 4 },
  deleteCardText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },

  navRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  navBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  navBtnText: { ...typography.caption, color: colors.textSub, fontWeight: '600' },

  emptyState:   { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  emptyText:    { ...typography.body, color: colors.textMuted },
  emptyAddLink: { fontSize: 13, color: colors.blue, fontWeight: '600' },

  homeworkStubCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  homeworkStubTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  homeworkStubSub:   { ...typography.caption, color: colors.textMuted },

  // Problem cards
  problemCard:   { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm + 2, borderWidth: 1, borderColor: colors.border },
  diffBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, marginBottom: spacing.sm },
  diffEmoji:     { fontSize: 11 },
  diffText:      { fontSize: 11, fontWeight: '700' },
  problemQ:      { ...typography.body, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.sm },
  revealBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 4 },
  revealBtnText: { fontSize: 13, fontWeight: '600', color: colors.blue },
  answerWrap:    {},
  answerInner:   { paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm },
  answerLabel:   { fontSize: 9, fontWeight: '800', color: colors.green, letterSpacing: 1, marginBottom: 4 },
  answerText:    { ...typography.body, color: colors.textPrimary, fontWeight: '600' },

  // Add card modal
  modalOverlay:  { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  modalSheet:    { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xxl, borderTopWidth: 1, borderColor: colors.border },
  modalHandle:   { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  modalTitle:    { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },

  fieldLabel: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.sm },
  fieldInput: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 56,
    marginBottom: spacing.md,
  },

  optionPill:         { paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2, borderRadius: radius.full, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  optionPillActive:   { backgroundColor: colors.purple + '22', borderColor: colors.purple + '60' },
  optionPillText:     { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  optionPillTextActive:{ color: colors.purple },

  modalActions:    { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn:       { flex: 1, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  cancelBtnText:   { fontSize: 15, fontWeight: '600', color: colors.textSub },
  saveBtn:         { flex: 2, height: 52, borderRadius: radius.lg, overflow: 'hidden' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  saveBtnText:     { fontSize: 15, fontWeight: '700', color: colors.white },
});
