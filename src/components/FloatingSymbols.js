import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

// Each symbol: position (0–1 of screen), size, opacity, float speed, color, initial drift offset
const SYMBOLS = [
  { s: '∑',  x: 0.04, y: 0.10, sz: 30, op: 0.07, ms: 9000,  d: 0,    c: '#4F8EF7' },
  { s: 'π',  x: 0.82, y: 0.06, sz: 34, op: 0.09, ms: 11000, d: 2000, c: '#F59E0B' },
  { s: '∫',  x: 0.12, y: 0.38, sz: 40, op: 0.06, ms: 13000, d: 4000, c: '#4F8EF7' },
  { s: '√',  x: 0.74, y: 0.28, sz: 26, op: 0.08, ms: 8500,  d: 1000, c: '#4F8EF7' },
  { s: '∞',  x: 0.42, y: 0.08, sz: 28, op: 0.07, ms: 10000, d: 3000, c: '#F59E0B' },
  { s: 'Δ',  x: 0.90, y: 0.48, sz: 24, op: 0.06, ms: 7500,  d: 5000, c: '#4F8EF7' },
  { s: 'λ',  x: 0.06, y: 0.62, sz: 28, op: 0.07, ms: 12000, d: 2500, c: '#8B5CF6' },
  { s: 'θ',  x: 0.58, y: 0.56, sz: 30, op: 0.08, ms: 9500,  d: 1500, c: '#4F8EF7' },
  { s: '±',  x: 0.28, y: 0.72, sz: 22, op: 0.06, ms: 10500, d: 3500, c: '#F59E0B' },
  { s: 'α',  x: 0.78, y: 0.74, sz: 24, op: 0.07, ms: 8000,  d: 4500, c: '#8B5CF6' },
  { s: '∂',  x: 0.22, y: 0.20, sz: 28, op: 0.06, ms: 11500, d: 6000, c: '#4F8EF7' },
  { s: 'ω',  x: 0.50, y: 0.85, sz: 22, op: 0.05, ms: 9200,  d: 700,  c: '#4F8EF7' },
  { s: 'β',  x: 0.88, y: 0.90, sz: 20, op: 0.05, ms: 12500, d: 3200, c: '#F59E0B' },
  { s: 'x²', x: 0.36, y: 0.46, sz: 18, op: 0.05, ms: 10200, d: 5500, c: '#4F8EF7' },
];

function FloatingSymbol({ s, x, y, sz, op, ms, d, c }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -18,
            duration: ms,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: ms,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, d);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: x * width,
        top:  y * height,
        fontSize: sz,
        color: c,
        opacity: op,
        transform: [{ translateY: floatAnim }],
        fontWeight: '200',
      }}
    >
      {s}
    </Animated.Text>
  );
}

export default function FloatingSymbols() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {SYMBOLS.map((sym, i) => (
        <FloatingSymbol key={i} {...sym} />
      ))}
    </View>
  );
}
