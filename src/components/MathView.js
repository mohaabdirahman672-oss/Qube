import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TurboModuleRegistry } from 'react-native';
import { texToSvg } from '../lib/mathjax';
import { toPlainMath } from '../lib/plainMath';
import { colors } from '../theme';

// react-native-svg calls TurboModuleRegistry.getEnforcing() at import time, so on a
// dev-client build that predates it (added 2026-10-25) a top-level import would
// throw and red-screen the whole app. Same defensive pattern as src/lib/iap.js
// (RevenueCat) and Sentry in App.js (KI-R24): load it only when the native module
// is actually in the binary; otherwise every MathView shows its plain-text fallback.
let SvgXml = null;
try {
  if (Platform.OS === 'web' || TurboModuleRegistry.get('RNSVGSvgViewModule')) {
    SvgXml = require('react-native-svg').SvgXml;
  }
} catch {
  SvgXml = null;
}

// One typeset formula (docs/plans/latex-math-rendering.md). The TeX → SVG
// conversion runs synchronously during render and returns exact em dimensions,
// so the formula's box is its final size on the very first frame — nothing
// loads in afterwards and nothing around it shifts. (MathJax's one-time setup
// is moved off this path by warmMath(), called while a solve is in flight.)
//
// Wider than its container → scrolls sideways rather than wrapping, the way a
// textbook keeps an equation on one line. If the TeX doesn't parse, falls back
// to the string as text, cleaned by toPlainMath so it still reads as math.
export default function MathView({
  latex,
  color = colors.textPrimary,
  fontSize = 17,
  align = 'left',
  fallbackStyle,
}) {
  const svg = useMemo(() => {
    if (!SvgXml || !latex || !String(latex).trim()) return null;
    try { return texToSvg(latex); } catch { return null; }
  }, [latex]);

  if (!latex || !String(latex).trim()) return null;

  if (!svg) {
    return (
      <Text style={[styles.fallback, { color, fontSize, textAlign: align }, fallbackStyle]}>
        {toPlainMath(latex)}
      </Text>
    );
  }

  const width = Math.ceil(svg.widthEm * fontSize);
  const height = Math.ceil(svg.heightEm * fontSize);

  return (
    // alignSelf stretch: the horizontal ScrollView needs a real width to scroll
    // within, even when the parent centres its children (flashcards, Answer box).
    <View style={{ height, alignSelf: 'stretch' }} accessible accessibilityRole="text" accessibilityLabel={toPlainMath(latex)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={[
          styles.row,
          { justifyContent: align === 'center' ? 'center' : 'flex-start' },
        ]}
      >
        <SvgXml xml={svg.xml} width={width} height={height} color={color} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row:      { flexGrow: 1, alignItems: 'center' },
  fallback: { lineHeight: 24, fontWeight: '500' },
});
