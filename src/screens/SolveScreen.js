import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import FloatingSymbols from '../components/FloatingSymbols';
import SoftAuthWall from '../components/SoftAuthWall';
import { solveMathProblem } from '../services/solveApi';
import { insertSavedProblem } from '../services/dbService';
import { useAuth } from '../hooks/useAuth';
import { getRemainingFreeSolves, consumeFreeSolve, FREE_SOLVE_LIMIT } from '../lib/freeSolves';
import { colors, spacing, radius, typography } from '../theme';

const DIFF_COLOR = { Easy: colors.green, Medium: colors.gold, Hard: '#EF4444', Advanced: colors.purple };

// ── helpers ──────────────────────────────────────────────────────────────────

async function pickImage(useCamera) {
  console.log('[SolveScreen] requesting permission', { useCamera });
  const perm = useCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  console.log('[SolveScreen] permission result', perm.status);

  if (perm.status !== 'granted') {
    Alert.alert(
      'Permission needed',
      useCamera ? 'Camera access is required to take a photo.' : 'Photo library access is required.'
    );
    return null;
  }

  console.log('[SolveScreen] launching', useCamera ? 'camera' : 'library');
  const result = useCamera
    ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8, mediaTypes: ['images'] })
    : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8, mediaTypes: ['images'] });
  console.log('[SolveScreen] picker result', { canceled: result.canceled, hasAsset: !!result.assets?.[0], hasBase64: !!result.assets?.[0]?.base64 });

  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0];
}

// ── main component ────────────────────────────────────────────────────────────

export default function SolveScreen({ navigation }) {
  const { session, user } = useAuth();
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [showPaywall, setShowPaywall]   = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(FREE_SOLVE_LIMIT);

  // Re-check whenever the screen mounts and whenever sign-in state changes — signing in
  // makes the local guest counter irrelevant (the real per-user server limit takes over).
  useEffect(() => {
    if (session) return;
    getRemainingFreeSolves().then(setFreeRemaining);
  }, [session]);

  const [mode, setMode]               = useState('type');
  const [typeText, setTypeText]       = useState('');
  const [imageUri, setImageUri]       = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime]     = useState('image/jpeg');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [result, setResult]           = useState(null);
  const [saved, setSaved]             = useState(false);

  const scrollRef      = useRef(null);
  const solutionOffset = useRef(0);

  // ── mode switch ──────────────────────────────────────────────────────────

  function switchMode(m) {
    setMode(m);
    setError(null);
    setResult(null);
    setSaved(false);
    setImageUri(null);
    setImageBase64(null);
    setTypeText('');
  }

  // ── image selection ──────────────────────────────────────────────────────

  async function handlePickImage(useCamera) {
    if (loading) return;
    console.log('[SolveScreen] handlePickImage start', { useCamera });
    const asset = await pickImage(useCamera);
    console.log('[SolveScreen] handlePickImage got asset?', !!asset);
    if (!asset) return;
    setImageUri(asset.uri);
    setImageBase64(asset.base64);
    setImageMime(asset.mimeType || 'image/jpeg');
    setError(null);
    setResult(null);
    setSaved(false);
    solve({ imageBase64: asset.base64, imageMimeType: asset.mimeType || 'image/jpeg' });
  }

  // ── solve ─────────────────────────────────────────────────────────────────

  async function solve(overrides) {
    if (loading) return;
    if (!session && freeRemaining <= 0) {
      setShowPaywall(true);
      return;
    }
    setError(null);
    setResult(null);
    setSaved(false);
    setLoading(true);

    const input = overrides || (mode === 'type'
      ? { text: typeText.trim() }
      : { imageBase64, imageMimeType: imageMime });

    if (mode === 'type' && !overrides && !typeText.trim()) {
      setError('Please type your math problem first.');
      setLoading(false);
      return;
    }

    console.log('[SolveScreen] solve() calling solveMathProblem', { mode, hasImage: !!input.imageBase64 });
    try {
      const res = await solveMathProblem(input);
      console.log('[SolveScreen] solve() got result', { hasMath: res?.hasMath });
      setLoading(false);
      if (!res.hasMath) {
        setError(res.message || 'No math problem detected. Try a clearer photo or switch to Type mode.');
        return;
      }
      if (!session) {
        setFreeRemaining(await consumeFreeSolve());
      }
      setResult(res);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: solutionOffset.current - 16, animated: true });
      }, 100);
    } catch (e) {
      console.log('[SolveScreen] solve() caught error', e?.message);
      setLoading(false);
      setError(e.message || 'Something went wrong. Please try again.');
    }
  }

  // ── save ──────────────────────────────────────────────────────────────────

  async function saveResult() {
    if (!result || saved) return;
    if (!session) { setShowAuthWall(true); return; }
    const { error } = await insertSavedProblem({
      userId:      user.id,
      type:        'scan',
      title:       result.answer ? 'Answer: ' + result.answer : 'Solved Problem',
      problemType: result.problemType,
      difficulty:  result.difficulty,
      steps:       result.steps,
      answer:      result.answer,
      explanation: result.explanation,
    });
    if (error) {
      Alert.alert('Error', 'Could not save the problem. Please try again.');
    } else {
      setSaved(true);
    }
  }

  // ── try next ──────────────────────────────────────────────────────────────

  function tryNext() {
    const q = result?.practiceQuestion;
    if (!q) return;
    setMode('type');
    setTypeText(q);
    setResult(null);
    setError(null);
    setSaved(false);
    solve({ text: q });
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <FloatingSymbols />
      <View style={styles.bgGlow} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Solve</Text>
                <Text style={styles.subtitle}>Scan or type any math problem</Text>
              </View>
              <View style={styles.headerIcon}>
                <Ionicons name="camera" size={22} color={colors.gold} />
              </View>
            </View>

            {!session ? (
              <View style={styles.freeCountPill}>
                <Ionicons name="flash-outline" size={14} color={colors.gold} />
                <Text style={styles.freeCountText}>
                  {freeRemaining} free solve{freeRemaining !== 1 ? 's' : ''} left
                </Text>
              </View>
            ) : null}

            {/* Mode tabs */}
            <View style={styles.modeTabs}>
              {[
                { key: 'camera', icon: 'camera-outline',   label: 'Camera'  },
                { key: 'upload', icon: 'image-outline',    label: 'Upload'  },
                { key: 'type',   icon: 'create-outline',   label: 'Type'    },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.modeTab, mode === tab.key && styles.modeTabActive]}
                  onPress={() => switchMode(tab.key)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={mode === tab.key ? colors.gold : colors.textMuted}
                  />
                  <Text style={[styles.modeTabLabel, mode === tab.key && styles.modeTabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Camera mode ── */}
            {mode === 'camera' && (
              <TouchableOpacity
                style={[styles.imageTouchZone, loading && styles.solveBtnDisabled]}
                onPress={() => handlePickImage(true)}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.imageZoneIcon}>
                  <Ionicons name="camera" size={38} color={colors.gold} />
                </View>
                <Text style={styles.imageZoneTitle}>Take a photo</Text>
                <Text style={styles.imageZoneSub}>Point your camera at a math problem</Text>
              </TouchableOpacity>
            )}

            {/* ── Upload mode ── */}
            {mode === 'upload' && (
              <View>
                {imageUri ? (
                  <View style={styles.previewWrap}>
                    <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
                    <TouchableOpacity
                      style={styles.clearBtn}
                      onPress={() => { setImageUri(null); setImageBase64(null); setResult(null); setError(null); }}
                    >
                      <Ionicons name="close-circle" size={26} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.imageTouchZone, loading && styles.solveBtnDisabled]}
                    onPress={() => handlePickImage(false)}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <View style={styles.imageZoneIcon}>
                      <Ionicons name="cloud-upload-outline" size={38} color={colors.blue} />
                    </View>
                    <Text style={styles.imageZoneTitle}>Choose an image</Text>
                    <Text style={styles.imageZoneSub}>Select a photo from your library</Text>
                  </TouchableOpacity>
                )}
                {imageUri && !loading && !result && (
                  <TouchableOpacity
                    style={styles.uploadAgainBtn}
                    onPress={() => handlePickImage(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="image-outline" size={16} color={colors.blue} />
                    <Text style={styles.uploadAgainText}>Choose different image</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── Type mode ── */}
            {mode === 'type' && (
              <View>
                <View style={styles.typeBox}>
                  <TextInput
                    style={styles.typeInput}
                    placeholder="e.g.  2x² + 7x − 15 = 0"
                    placeholderTextColor={colors.textMuted}
                    value={typeText}
                    onChangeText={setTypeText}
                    multiline
                    textAlignVertical="top"
                    returnKeyType="done"
                    blurOnSubmit
                  />
                  <Text style={styles.charCount}>{typeText.length}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.solveBtn, loading && styles.solveBtnDisabled]}
                  onPress={() => solve()}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.gold, colors.goldDark]}
                    style={styles.solveBtnGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.solveBtnText}>Solve with AI</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.black} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.gold} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Loading */}
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={colors.gold} />
                <Text style={styles.loadingText}>Analyzing your problem…</Text>
              </View>
            ) : null}

            {/* Solution */}
            {result ? (
              <View
                onLayout={e => { solutionOffset.current = e.nativeEvent.layout.y; }}
                style={styles.solutionCard}
              >
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
                    <Text style={styles.practiceNextQ}>{result.practiceQuestion}</Text>
                    <TouchableOpacity style={styles.practiceNextBtn} onPress={tryNext} activeOpacity={0.8}>
                      <Text style={styles.practiceNextBtnText}>Solve This →</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, saved && styles.actionBtnSaved]}
                    onPress={saveResult}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={saved ? 'checkmark-circle' : 'bookmark-outline'}
                      size={16}
                      color={saved ? colors.green : colors.blue}
                    />
                    <Text style={[styles.actionBtnText, saved && { color: colors.green }]}>
                      {saved ? 'Saved!' : 'Save'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnSecondary}
                    onPress={() => { setResult(null); setError(null); setTypeText(''); setImageUri(null); setImageBase64(null); setSaved(false); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh-outline" size={16} color={colors.textSub} />
                    <Text style={styles.actionBtnSecondaryText}>New Problem</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SoftAuthWall
        visible={showAuthWall}
        onClose={() => setShowAuthWall(false)}
        onCreateAccount={() => { setShowAuthWall(false); navigation.navigate('SignUp'); }}
        onLogin={() => { setShowAuthWall(false); navigation.navigate('Login'); }}
      />

      <SoftAuthWall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onCreateAccount={() => { setShowPaywall(false); navigation.navigate('SignUp'); }}
        onLogin={() => { setShowPaywall(false); navigation.navigate('Login'); }}
        icon="sparkles"
        title="You're Out of Free Solves"
        body={`You've used all ${FREE_SOLVE_LIMIT} free solves. Sign in for unlimited AI-powered solving — it's quick and free.`}
        skipLabel="Not Now"
      />
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.bg },
  bgGlow: { position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: colors.gold, opacity: 0.06 },
  safe:  { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.md },

  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  headerLeft: { flex: 1 },
  title:      { ...typography.h1, color: colors.textPrimary },
  subtitle:   { ...typography.caption, color: colors.textSub, marginTop: 2 },
  headerIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.gold + '18', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gold + '30' },

  freeCountPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.gold + '15', borderRadius: radius.full, paddingHorizontal: spacing.sm + 2, paddingVertical: 5, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.gold + '30' },
  freeCountText: { fontSize: 11, fontWeight: '700', color: colors.gold, letterSpacing: 0.2 },

  modeTabs:          { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  modeTab:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, gap: 5, borderRadius: radius.md },
  modeTabActive:     { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.border },
  modeTabLabel:      { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  modeTabLabelActive:{ color: colors.gold },

  imageTouchZone: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, marginBottom: spacing.md },
  imageZoneIcon:  { width: 72, height: 72, borderRadius: radius.xl, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  imageZoneTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  imageZoneSub:   { ...typography.caption, color: colors.textSub },

  previewWrap:    { position: 'relative', marginBottom: spacing.md },
  preview:        { width: '100%', height: 220, borderRadius: radius.lg, backgroundColor: colors.surface },
  clearBtn:       { position: 'absolute', top: spacing.sm, right: spacing.sm },

  uploadAgainBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: spacing.sm, marginBottom: spacing.md },
  uploadAgainText:{ ...typography.caption, color: colors.blue, fontWeight: '600' },

  typeBox:       { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, minHeight: 110 },
  typeInput:     { ...typography.body, color: colors.textPrimary, minHeight: 80, textAlignVertical: 'top' },
  charCount:     { ...typography.caption, color: colors.textMuted, textAlign: 'right', marginTop: spacing.xs },

  solveBtn:         { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  solveBtnDisabled: { opacity: 0.5 },
  solveBtnGrad:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  solveBtnText:     { fontSize: 16, fontWeight: '700', color: colors.black, letterSpacing: 0.2 },

  errorBox:  { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.gold + '15', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.gold + '30', marginBottom: spacing.md },
  errorText: { ...typography.caption, color: colors.gold, flex: 1, lineHeight: 18 },

  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  loadingText: { ...typography.body, color: colors.textSub },

  solutionCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.md },

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

  actionRow:              { flexDirection: 'row', gap: spacing.sm },
  actionBtn:              { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.blue + '15', borderRadius: radius.md, paddingVertical: spacing.sm + 2, borderWidth: 1, borderColor: colors.blue + '30' },
  actionBtnSaved:         { backgroundColor: colors.green + '15', borderColor: colors.green + '30' },
  actionBtnText:          { fontSize: 13, fontWeight: '700', color: colors.blue },
  actionBtnSecondary:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surfaceHigh, borderRadius: radius.md, paddingVertical: spacing.sm + 2, borderWidth: 1, borderColor: colors.border },
  actionBtnSecondaryText: { fontSize: 13, fontWeight: '600', color: colors.textSub },
});
