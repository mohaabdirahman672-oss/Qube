import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import FloatingSymbols from '../components/FloatingSymbols';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');
const CX = width  / 2;
const CY = height / 2;

// How far off-screen the brackets start before sliding in
const SLIDE = width * 0.85;

export default function SplashScreen({ onDone }) {
  const leftSlide    = useRef(new Animated.Value(-SLIDE)).current;
  const rightSlide   = useRef(new Animated.Value(SLIDE)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.55)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const screenFade   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1 — brackets slide in from both sides
      Animated.parallel([
        Animated.spring(leftSlide,  { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }),
        Animated.spring(rightSlide, { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }),
      ]),

      // 2 — logo pops in
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, tension: 110, friction: 7, useNativeDriver: true }),
      ]),

      // 3 — slogan fades in
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),

      // 4 — hold
      Animated.delay(1300),

      // 5 — fade to app
      Animated.timing(screenFade, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start(() => onDone?.());
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: screenFade }]}>
      <FloatingSymbols />

      {/* Ambient glows */}
      <View style={styles.glowBlue} />
      <View style={styles.glowGold} />

      {/* Logo — sits at screen center */}
      <Animated.View
        style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        {/* Gold outer ring */}
        <View style={styles.goldRingOuter} />

        {/* Blue gradient disc */}
        <LinearGradient
          colors={['#1A3A7A', '#2563EB']}
          style={styles.logoDisc}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
        >
          <Ionicons name="cube" size={50} color={colors.white} />
        </LinearGradient>

        {/* Thin gold inner ring */}
        <View style={styles.goldRingInner} />
      </Animated.View>

      {/* App name + slogan */}
      <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
        <Text style={styles.appName}>Qube</Text>
        <Text style={styles.slogan}>MATH. EVERY DIMENSION.</Text>
      </Animated.View>

      {/* Left bracket — absolutely positioned, slides in from left */}
      <Animated.Text
        style={[styles.bracket, styles.bracketLeft, { transform: [{ translateX: leftSlide }] }]}
        allowFontScaling={false}
      >
        [
      </Animated.Text>

      {/* Right bracket — absolutely positioned, slides in from right */}
      <Animated.Text
        style={[styles.bracket, styles.bracketRight, { transform: [{ translateX: rightSlide }] }]}
        allowFontScaling={false}
      >
        ]
      </Animated.Text>
    </Animated.View>
  );
}

const LOGO_SIZE   = 96;
const BRACKET_SZ  = 130;
// Horizontal gap between bracket and logo edge
const GAP         = 18;
const HALF_LOGO   = LOGO_SIZE / 2;
// Approximate pixel width of [ at the chosen font size (roughly 0.55em)
const BRACKET_W   = BRACKET_SZ * 0.55;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },

  // Ambient glows
  glowBlue: {
    position: 'absolute',
    top: CY - 260,
    left: CX - 160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.blue,
    opacity: 0.06,
  },
  glowGold: {
    position: 'absolute',
    bottom: CY - 300,
    right: CX - 140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.gold,
    opacity: 0.05,
  },

  // Logo
  logoWrap: {
    width: LOGO_SIZE + 12,
    height: LOGO_SIZE + 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  goldRingOuter: {
    position: 'absolute',
    width: LOGO_SIZE + 12,
    height: LOGO_SIZE + 12,
    borderRadius: (LOGO_SIZE + 12) / 2,
    borderWidth: 2,
    borderColor: colors.gold,
    opacity: 0.55,
  },
  logoDisc: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldRingInner: {
    position: 'absolute',
    width: LOGO_SIZE - 8,
    height: LOGO_SIZE - 8,
    borderRadius: (LOGO_SIZE - 8) / 2,
    borderWidth: 1,
    borderColor: colors.goldLight,
    opacity: 0.3,
  },

  // Text
  textBlock: {
    alignItems: 'center',
    marginTop: 22,
  },
  appName: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1.5,
    includeFontPadding: false,
  },
  slogan: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 3.5,
    marginTop: 8,
    opacity: 0.9,
  },

  // Brackets — absolute, flanking the logo
  bracket: {
    position: 'absolute',
    fontSize: BRACKET_SZ,
    lineHeight: BRACKET_SZ * 1.1,
    fontWeight: '200',
    color: colors.gold,
    includeFontPadding: false,
    opacity: 0.85,
    // Vertically center on the logo (logo is at CY - (logoSize+text)/2 roughly)
    // We offset upward slightly so bracket spans the logo height
    top: CY - BRACKET_SZ * 0.52,
  },
  bracketLeft: {
    // Right edge of bracket should be GAP away from left edge of logo
    left: CX - HALF_LOGO - GAP - BRACKET_W,
  },
  bracketRight: {
    // Left edge of bracket should be GAP away from right edge of logo
    left: CX + HALF_LOGO + GAP,
  },
});
