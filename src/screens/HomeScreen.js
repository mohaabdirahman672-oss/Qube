import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingSymbols from '../components/FloatingSymbols';
import SoftAuthWall from '../components/SoftAuthWall';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, radius, typography } from '../theme';

// Shown once, after the intro animation finishes, only to guests who've never seen it.
const WELCOME_PROMPT_SEEN_KEY = '@qube/welcome_prompt_seen';

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────

const FEATURE_CARDS = [
  {
    key: 'ai',
    icon: 'flash',
    label: 'AI POWERED',
    title: 'Solve with AI',
    subtitle: 'Get instant step-by-step solutions to any problem.',
    gradientColors: [colors.blueDark, colors.blueMid],
    glowColor: colors.blue,
    accentLight: colors.blue + '22',
  },
  {
    key: 'practice',
    icon: 'layers',
    label: 'FLASHCARDS & QUIZZES',
    title: 'Practice',
    subtitle: 'Flashcards, formulas, and practice problems.',
    gradientColors: [colors.purpleDark, colors.purple],
    glowColor: colors.purple,
    accentLight: colors.purple + '22',
  },
  {
    key: 'quiz',
    icon: 'trophy',
    label: 'PRACTICE MODE',
    title: 'Practice Quizzes',
    subtitle: 'Sharpen skills with adaptive difficulty quizzes.',
    gradientColors: [colors.goldDark, colors.gold],
    glowColor: colors.gold,
    accentLight: colors.gold + '22',
  },
];

const QUICK_STATS = [
  { value: '500+', label: 'Topics',   icon: 'book-outline'   },
  { value: '10K',  label: 'Problems', icon: 'calculator-outline' },
  { value: '98%',  label: 'Accuracy', icon: 'star-outline'   },
];

// ─────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────

function StatPill({ value, label, icon, delay }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statPill,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Ionicons name={icon} size={14} color={colors.blue} style={{ marginBottom: 3 }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

function ScanCard({ glowAnim, glowOuter, glowInner, cardAnim, cardScale, onPress }) {
  return (
    <Animated.View
      style={[
        styles.scanCardOuter,
        { opacity: cardAnim, transform: [{ scale: cardScale }] },
      ]}
    >
      {/* Layered glow rings */}
      <Animated.View style={[styles.glowRingOuter, { opacity: glowOuter }]} />
      <Animated.View style={[styles.glowRingInner, { opacity: glowInner }]} />

      <TouchableOpacity activeOpacity={0.88} style={styles.scanCardTouch} onPress={onPress}>
        <LinearGradient
          colors={['#0E1D3F', '#091428']}
          style={styles.scanCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Left: icon */}
          <LinearGradient
            colors={[colors.gold, colors.goldDark]}
            style={styles.scanIconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="camera" size={30} color={colors.black} />
          </LinearGradient>

          {/* Center: text */}
          <View style={styles.scanTextBlock}>
            <View style={styles.scanBadgeRow}>
              <View style={styles.scanBadge}>
                <Text style={styles.scanBadgeText}>INSTANT</Text>
              </View>
            </View>
            <Text style={styles.scanTitle}>Scan Problem</Text>
            <Text style={styles.scanSubtitle}>
              Take a photo and get step-by-step help
            </Text>
          </View>

          {/* Right: arrow */}
          <View style={styles.scanArrow}>
            <LinearGradient
              colors={[colors.gold + '33', colors.gold + '11']}
              style={styles.scanArrowCircle}
            >
              <Ionicons name="arrow-forward" size={18} color={colors.gold} />
            </LinearGradient>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function FeatureCard({ card, animVal, index, onPress }) {
  const slideAnim = useRef(new Animated.Value(32)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 480,
      delay: 100 * index,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn  = () =>
    Animated.spring(pressAnim, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View
      style={{
        opacity: animVal,
        transform: [{ translateY: slideAnim }, { scale: pressAnim }],
        marginBottom: spacing.sm + 2,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View style={[styles.featureCard, { borderColor: card.glowColor + '30' }]}>
          {/* Subtle glow wash on left edge */}
          <View style={[styles.featureEdge, { backgroundColor: card.glowColor }]} />

          {/* Icon */}
          <LinearGradient
            colors={card.gradientColors}
            style={styles.featureIconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={card.icon} size={22} color={colors.white} />
          </LinearGradient>

          {/* Text */}
          <View style={styles.featureTextBlock}>
            <Text style={[styles.featureLabel, { color: card.glowColor }]}>
              {card.label}
            </Text>
            <Text style={styles.featureTitle}>{card.title}</Text>
            <Text style={styles.featureSubtitle}>{card.subtitle}</Text>
          </View>

          {/* Chevron */}
          <View style={[styles.featureChevron, { backgroundColor: card.accentLight }]}>
            <Ionicons name="chevron-forward" size={16} color={card.glowColor} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
//  MAIN SCREEN
// ─────────────────────────────────────────────

// Map feature card keys to navigator route names
const CARD_ROUTES = { ai: 'scan', practice: 'practice', quiz: 'practice' };

export default function HomeScreen({ navigation }) {
  const { session, loading: authLoading } = useAuth();
  const [showWelcomePrompt, setShowWelcomePrompt] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const promptDecidedRef = useRef(false);

  // The entrance animation's own effect (below) runs once on mount with a stale
  // closure over session/authLoading, so it only flips this flag; this effect,
  // re-run whenever auth state actually settles, makes the real decision.
  useEffect(() => {
    if (!entranceDone || authLoading || promptDecidedRef.current) return;
    promptDecidedRef.current = true;
    if (session) return;
    AsyncStorage.getItem(WELCOME_PROMPT_SEEN_KEY)
      .then((seen) => { if (!seen) setShowWelcomePrompt(true); })
      .catch(() => {});
  }, [entranceDone, authLoading, session]);

  const dismissWelcomePrompt = () => {
    setShowWelcomePrompt(false);
    AsyncStorage.setItem(WELCOME_PROMPT_SEEN_KEY, '1').catch(() => {});
  };

  // Animation refs
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const greetOpacity   = useRef(new Animated.Value(0)).current;
  const greetTranslate = useRef(new Animated.Value(24)).current;

  const statsOpacity = useRef(new Animated.Value(0)).current;

  const scanOpacity = useRef(new Animated.Value(0)).current;
  const scanScale   = useRef(new Animated.Value(0.88)).current;

  const card1Opacity = useRef(new Animated.Value(0)).current;
  const card2Opacity = useRef(new Animated.Value(0)).current;
  const card3Opacity = useRef(new Animated.Value(0)).current;

  const glowPulse      = useRef(new Animated.Value(0.5)).current;
  const glowRingOuter  = useRef(new Animated.Value(0.18)).current;
  const glowRingInner  = useRef(new Animated.Value(0.28)).current;

  // ── Entrance sequence ──────────────────────
  useEffect(() => {
    Animated.sequence([
      // 1. Logo scales + fades in
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1,    tension: 70, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 2. Greeting slides up
      Animated.parallel([
        Animated.timing(greetOpacity,   { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(greetTranslate, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]),
      // 3. Stats row
      Animated.timing(statsOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      // 4. Scan card pops in
      Animated.parallel([
        Animated.timing(scanOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scanScale,   { toValue: 1, tension: 90, friction: 8, useNativeDriver: true }),
      ]),
      // 5. Feature cards stagger in
      Animated.stagger(110, [
        Animated.timing(card1Opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(card2Opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(card3Opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setEntranceDone(true);
    });

    // Glow pulse — runs independently
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse,     { toValue: 1,    duration: 1800, useNativeDriver: true }),
        Animated.timing(glowPulse,     { toValue: 0.4,  duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowRingOuter, { toValue: 0.35, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowRingOuter, { toValue: 0.10, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowRingInner, { toValue: 0.55, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowRingInner, { toValue: 0.18, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const cardOpacities = [card1Opacity, card2Opacity, card3Opacity];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating math symbols layer */}
      <FloatingSymbols />

      {/* Subtle radial bg glow top-left */}
      <View style={styles.bgGlowBlue} />
      <View style={styles.bgGlowGold} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          {/* ── Logo ─────────────────────────── */}
          <Animated.View
            style={[
              styles.logoRow,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <LinearGradient
              colors={[colors.blue, colors.blueDark]}
              style={styles.logoBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoLetter}>Q</Text>
            </LinearGradient>

            <View style={styles.logoTextWrap}>
              <Text style={styles.logoWordmark}>QUBE</Text>
              <View style={styles.logoBetaTag}>
                <Text style={styles.logoBetaText}>BETA</Text>
              </View>
            </View>

            {/* Notification bell */}
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.75}>
              <Ionicons name="notifications-outline" size={22} color={colors.textSub} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </Animated.View>

          {/* ── Greeting ─────────────────────── */}
          <Animated.View
            style={[
              styles.greetBlock,
              {
                opacity: greetOpacity,
                transform: [{ translateY: greetTranslate }],
              },
            ]}
          >
            <Text style={styles.greetHello}>Welcome to Qube</Text>
            <Text style={styles.greetTagline}>Math. Every Dimension.</Text>
          </Animated.View>

          {/* ── Stats pills ───────────────────── */}
          <Animated.View style={[styles.statsRow, { opacity: statsOpacity }]}>
            {QUICK_STATS.map((st, i) => (
              <StatPill key={st.label} {...st} delay={i * 80} />
            ))}
          </Animated.View>

          {/* ── Scan Card ────────────────────── */}
          <ScanCard
            glowAnim={glowPulse}
            glowOuter={glowRingOuter}
            glowInner={glowRingInner}
            cardAnim={scanOpacity}
            cardScale={scanScale}
            onPress={() => navigation.navigate('scan')}
          />

          {/* ── Feature Cards ────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Features</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('practice')}>
              <Text style={styles.sectionLink}>See all →</Text>
            </TouchableOpacity>
          </View>

          {FEATURE_CARDS.map((card, i) => (
            <FeatureCard
              key={card.key}
              card={card}
              animVal={cardOpacities[i]}
              index={i}
              onPress={() => navigation.navigate(CARD_ROUTES[card.key])}
            />
          ))}

          {/* ── Recent Activity ──────────────── */}
          <Animated.View style={{ opacity: card3Opacity }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent</Text>
            </View>
            <View style={styles.recentCard}>
              <View style={styles.recentIconWrap}>
                <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              </View>
              <Text style={styles.recentEmpty}>
                No recent activity yet.{'\n'}
                <Text style={{ color: colors.blue }}>Scan a problem</Text> to get started.
              </Text>
            </View>
          </Animated.View>

          {/* Bottom spacer for nav bar */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>

      <SoftAuthWall
        visible={showWelcomePrompt}
        onClose={dismissWelcomePrompt}
        onCreateAccount={() => { dismissWelcomePrompt(); navigation.navigate('SignUp'); }}
        onLogin={() => { dismissWelcomePrompt(); navigation.navigate('Login'); }}
        icon="school"
        title="Welcome to Qube"
        body="Sign in to save your solved problems and sync your progress across devices. Or just dive in — solving works without an account."
        skipLabel="Maybe Later"
      />
    </View>
  );
}

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },

  // Background glows
  bgGlowBlue: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.blue,
    opacity: 0.07,
  },
  bgGlowGold: {
    position: 'absolute',
    top: 200,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.gold,
    opacity: 0.05,
  },

  // ── Logo row ──
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg + 4,
    marginTop: spacing.xs,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  logoLetter: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -1,
  },
  logoTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm + 2,
    gap: 8,
  },
  logoWordmark: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 3,
  },
  logoBetaTag: {
    backgroundColor: colors.blue + '28',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.blue + '50',
  },
  logoBetaText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.blue,
    letterSpacing: 1,
  },
  notifBtn: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },

  // ── Greeting ──
  greetBlock: {
    marginBottom: spacing.lg,
  },
  greetHello: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 5,
  },
  greetTagline: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSub,
    letterSpacing: 0.3,
  },

  // ── Stats pills ──
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg + 4,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },

  // ── Scan card ──
  scanCardOuter: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  glowRingOuter: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: radius.xl + 12,
    backgroundColor: colors.gold,
    opacity: 0.12,
  },
  glowRingInner: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: radius.xl + 5,
    backgroundColor: colors.gold,
    opacity: 0.2,
  },
  scanCardTouch: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.gold + '40',
    gap: spacing.md,
  },
  scanIconBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    flexShrink: 0,
  },
  scanTextBlock: {
    flex: 1,
  },
  scanBadgeRow: {
    marginBottom: 6,
  },
  scanBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold + '22',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.gold + '44',
  },
  scanBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1,
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  scanSubtitle: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 18,
  },
  scanArrow: {
    flexShrink: 0,
  },
  scanArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gold + '30',
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.blue,
    fontWeight: '600',
  },

  // ── Feature cards ──
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  featureEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    opacity: 0.8,
  },
  featureIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureTextBlock: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: colors.textSub,
    lineHeight: 17,
  },
  featureChevron: {
    width: 32,
    height: 32,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ── Recent card ──
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  recentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentEmpty: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 20,
    flex: 1,
  },
});
