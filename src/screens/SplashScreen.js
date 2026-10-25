import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

// ── Native launch-screen handoff ──────────────────────────────────────────────
// app.json's splash shows assets/splash.png (a 1284x2778 transparent canvas with
// the 528px logo dead-centre) with resizeMode "contain" on SPLASH_BG. We compute
// the exact same on-screen logo size here, so the first JS frame is pixel-identical
// to the native launch screen and the animation picks up with no visible jump.
// If you regenerate splash.png, keep these three numbers in sync.
const CANVAS_W    = 1284;
const CANVAS_H    = 2778;
const CANVAS_LOGO = 528;
const SPLASH_BG   = '#060D18'; // must equal app.json → expo.splash.backgroundColor

const LOGO       = CANVAS_LOGO * Math.min(W / CANVAS_W, H / CANVAS_H);
const LOGO_END   = 0.8;   // logo shrinks to 80% as it rises to make room for the name
const GAP        = 18;    // logo → name row
const TEXT_H     = 113;   // name row + divider + tagline
const LIFT       = (GAP + TEXT_H) / 2;
const TEXT_TOP   = H / 2 - LIFT + (LOGO * LOGO_END) / 2 + GAP;

// Logo gold (matches the cube/ring in assets/icon.png — softer than theme gold)
const GOLD      = '#C9A84C';
const INK       = '#F0F4FF';
const MATH_INK  = '#9DB4E0';

// Faint formulas behind everything — kept clear of the centre column
const FORMULAS = [
  { t: 'a² + b² = c²',      x: 0.07, y: 0.10, sz: 17 },
  { t: 'y = mx + b',         x: 0.56, y: 0.17, sz: 16 },
  { t: '∑',                  x: 0.85, y: 0.08, sz: 30 },
  { t: 'π',                  x: 0.13, y: 0.25, sz: 26 },
  { t: '√x',                 x: 0.80, y: 0.30, sz: 20 },
  { t: 'f′(x)',              x: 0.04, y: 0.46, sz: 16 },
  { t: 'Δ',                  x: 0.88, y: 0.57, sz: 22 },
  { t: '∫ f(x) dx',          x: 0.07, y: 0.72, sz: 17 },
  { t: 'sin²θ + cos²θ = 1',  x: 0.38, y: 0.81, sz: 14 },
  { t: 'lim f(x)',           x: 0.10, y: 0.88, sz: 15 },
  { t: '∞',                  x: 0.72, y: 0.92, sz: 22 },
];

// Timeline (ms from first JS frame)
const HOLD_UNTIL   = 3300;  // auto-continue
const TAP_ENABLED  = 600;   // ignore accidental taps during the handoff

export default function SplashScreen({ onDone }) {
  const insets = useSafeAreaInsets();

  const bgIn       = useRef(new Animated.Value(0)).current;
  const lift       = useRef(new Animated.Value(0)).current;
  const bracketsIn = useRef(new Animated.Value(0)).current;
  const open       = useRef(new Animated.Value(0)).current;
  const divider    = useRef(new Animated.Value(0)).current;
  const tagline    = useRef(new Animated.Value(0)).current;
  const hint       = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  // Width of "Qube" — the brackets start closed at its centre and open outward.
  // Seeded with an estimate; onLayout replaces it long before the brackets appear.
  const [wordW, setWordW] = useState(150);

  const startedAt = useRef(Date.now());
  const finished  = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    Animated.timing(screenFade, {
      toValue: 0, duration: 450, easing: Easing.in(Easing.quad), useNativeDriver: true,
    }).start(() => onDone?.());
  };

  useEffect(() => {
    const fadeIn = (v, delay, duration) => Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);

    Animated.parallel([
      // 1 — backdrop (gradient, glow, formulas) blooms in over the solid launch colour
      fadeIn(bgIn, 0, 700),
      // 2 — logo rises and settles
      Animated.sequence([
        Animated.delay(250),
        Animated.spring(lift, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
      // 3 — closed "[]" appears, then springs open to reveal the name
      Animated.sequence([
        Animated.delay(650),
        Animated.timing(bracketsIn, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(open, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
      ]),
      // 4 — divider, tagline, tap hint
      fadeIn(divider, 1250, 500),
      fadeIn(tagline, 1400, 500),
      fadeIn(hint,    1900, 500),
    ]).start();

    const t = setTimeout(finish, HOLD_UNTIL);
    return () => clearTimeout(t);
  }, []);

  const onPress = () => {
    if (Date.now() - startedAt.current >= TAP_ENABLED) finish();
  };

  // ── Interpolations ──
  const logoStyle = {
    transform: [
      { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -LIFT] }) },
      { scale:      lift.interpolate({ inputRange: [0, 1], outputRange: [1, LOGO_END] }) },
    ],
  };
  const half = wordW / 2;
  const leftBracket = {
    opacity: bracketsIn,
    transform: [{ translateX: open.interpolate({ inputRange: [0, 1], outputRange: [half, 0] }) }],
  };
  const rightBracket = {
    opacity: bracketsIn,
    transform: [{ translateX: open.interpolate({ inputRange: [0, 1], outputRange: [-half, 0] }) }],
  };
  const wordStyle = {
    opacity: open.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' }),
    transform: [{ scale: open.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
  };
  const riseIn = (v) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
  });

  return (
    <Animated.View style={[styles.root, { opacity: screenFade }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress} accessibilityRole="button" accessibilityLabel="Continue">

        {/* Backdrop */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { opacity: bgIn, transform: [{ scale: bgIn.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1] }) }] },
          ]}
        >
          <LinearGradient
            colors={['#0E1F3A', SPLASH_BG]}
            start={{ x: 0.25, y: 0.3 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {FORMULAS.map((f, i) => (
            <Text key={i} allowFontScaling={false} style={[styles.formula, { left: f.x * W, top: f.y * H, fontSize: f.sz }]}>
              {f.t}
            </Text>
          ))}
          <WireCube x={W * 0.72} y={H * 0.67} s={44} d={18} />

          {/* Corner accents */}
          <View style={[styles.corner, { top: insets.top + 12, left: 24, borderTopWidth: 1, borderLeftWidth: 1 }]} />
          <View style={[styles.corner, { top: insets.top + 12, right: 24, borderTopWidth: 1, borderRightWidth: 1 }]} />
          <View style={[styles.corner, { bottom: insets.bottom + 12, left: 24, borderBottomWidth: 1, borderLeftWidth: 1 }]} />
          <View style={[styles.corner, { bottom: insets.bottom + 12, right: 24, borderBottomWidth: 1, borderRightWidth: 1 }]} />
        </Animated.View>

        {/* Gold glow — follows the logo */}
        <Animated.Image
          source={require('../../assets/splash-glow.png')}
          style={[styles.glow, { opacity: bgIn }, logoStyle]}
          pointerEvents="none"
        />

        {/* Logo — starts exactly where the native launch screen drew it */}
        <Animated.View style={[styles.logoWrap, logoStyle]} pointerEvents="none">
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
        </Animated.View>

        {/* [ Qube ] */}
        <View style={styles.textBlock} pointerEvents="none">
          <View style={styles.nameRow}>
            <Animated.Text allowFontScaling={false} style={[styles.bracket, leftBracket]}>[</Animated.Text>
            <Animated.Text
              allowFontScaling={false}
              style={[styles.wordmark, wordStyle]}
              onLayout={(e) => setWordW(e.nativeEvent.layout.width)}
            >
              Qube
            </Animated.Text>
            <Animated.Text allowFontScaling={false} style={[styles.bracket, rightBracket]}>]</Animated.Text>
          </View>

          <Animated.View style={[styles.divider, { opacity: Animated.multiply(divider, 0.45), transform: [{ scaleX: divider }] }]} />

          <Animated.Text allowFontScaling={false} style={[styles.tagline, riseIn(tagline)]}>
            MATH. EVERY DIMENSION.
          </Animated.Text>
        </View>

        <Animated.Text
          allowFontScaling={false}
          style={[styles.hint, { bottom: insets.bottom + 40 }, riseIn(hint)]}
          pointerEvents="none"
        >
          TAP TO CONTINUE
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

// Faint wireframe cube: two offset squares joined at the corners by 45° lines
function WireCube({ x, y, s, d }) {
  const diag = Math.hypot(d, d);
  const corners = [[0, d], [s, d], [0, s + d], [s, s + d]];
  return (
    <View style={{ position: 'absolute', left: x, top: y, width: s + d, height: s + d, opacity: 0.14 }}>
      <View style={[styles.cubeFace, { left: d, top: 0, width: s, height: s }]} />
      <View style={[styles.cubeFace, { left: 0, top: d, width: s, height: s }]} />
      {corners.map(([px, py], i) => (
        <View
          key={i}
          style={[styles.cubeEdge, {
            width: diag,
            left: px + d / 2 - diag / 2,
            top: py - d / 2 - 0.5,
            transform: [{ rotate: '-45deg' }],
          }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BG,
    zIndex: 999,
  },

  formula: {
    position: 'absolute',
    color: MATH_INK,
    opacity: 0.1,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  cubeFace: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: MATH_INK,
  },
  cubeEdge: {
    position: 'absolute',
    height: 1,
    backgroundColor: MATH_INK,
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: GOLD,
    opacity: 0.4,
  },

  glow: {
    position: 'absolute',
    width: LOGO * 2.4,
    height: LOGO * 2.4,
    left: (W - LOGO * 2.4) / 2,
    top: (H - LOGO * 2.4) / 2,
  },
  logoWrap: {
    position: 'absolute',
    width: LOGO,
    height: LOGO,
    left: (W - LOGO) / 2,
    top: (H - LOGO) / 2,
  },
  logo: {
    width: LOGO,
    height: LOGO,
  },

  textBlock: {
    position: 'absolute',
    top: TEXT_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
  },
  bracket: {
    fontSize: 62,
    lineHeight: 72,
    fontWeight: '200',
    color: GOLD,
    includeFontPadding: false,
  },
  wordmark: {
    fontSize: 56,
    lineHeight: 68,
    fontWeight: '300',
    color: INK,
    letterSpacing: 3,
    paddingHorizontal: 6,
    includeFontPadding: false,
  },
  divider: {
    width: 200,
    height: 1,
    backgroundColor: GOLD,
    marginTop: 14,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 5,
    color: GOLD,
    marginTop: 10,
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 2.5,
    color: 'rgba(201,168,76,0.5)', // dimmed via colour — opacity is driven by the fade-in
  },
});
