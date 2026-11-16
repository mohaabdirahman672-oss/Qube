import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MathView from '../MathView';
import { TABS, LAYOUTS, CMD } from './keys';
import { colors, radius, spacing } from '../../theme';

// Haptics are a nicety: guarded like the other native modules so a build without
// expo-haptics just stays silent.
let Haptics = null;
try { Haptics = require('expo-haptics'); } catch { Haptics = null; }
const tick = () => { try { Haptics?.selectionAsync?.(); } catch {} };
const thud = () => { try { Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium); } catch {} };

const KEY_HEIGHT = 44;
const GAP = 6;
const ROWS = 4;
export const KEYPAD_GRID_HEIGHT = ROWS * KEY_HEIGHT + (ROWS - 1) * GAP;
const REPEAT_DELAY = 400;
const REPEAT_EVERY = 70;

function KeyFace({ item, textStyle }) {
  if (item.display) {
    return <MathView latex={item.display} fontSize={14} color={StyleSheet.flatten(textStyle).color} align="center" fallbackStyle={textStyle} />;
  }
  return <Text style={textStyle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{item.label}</Text>;
}

function Key({ item, onPress, onLongPress, testID }) {
  const isNum = item.style === 'num';
  const isOp = item.style === 'op';
  return (
    <Pressable
      testID={testID}
      onPress={() => onPress(item)}
      onLongPress={item.alts ? (e) => onLongPress(item, e) : undefined}
      delayLongPress={350}
      accessibilityRole="button"
      accessibilityLabel={item.a11y || item.label}
      accessibilityHint={item.alts ? 'Long press for more' : undefined}
      style={({ pressed }) => [styles.key, isNum && styles.keyNum, isOp && styles.keyOp, pressed && styles.keyPressed]}
    >
      <KeyFace item={item} textStyle={[styles.keyText, isNum && styles.keyTextNum, isOp && styles.keyTextOp]} />
      {item.alts ? <View style={styles.altDot} /> : null}
    </Pressable>
  );
}

// Arrows and backspace repeat while held, like the iOS keyboard: a tap fires once
// (onPress), holding past REPEAT_DELAY starts repeating until release. There's no
// "hold to clear everything" — too easy to trigger by accident.
function RepeatKey({ onFire, children, style, a11y, testID }) {
  const timer = useRef(null);
  const stop = useCallback(() => { clearInterval(timer.current); timer.current = null; }, []);
  useEffect(() => stop, [stop]);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      delayLongPress={REPEAT_DELAY}
      // React Native never calls onPress after onLongPress, so a hold doesn't
      // also fire a trailing extra step.
      onPress={onFire}
      onLongPress={() => {
        onFire();
        timer.current = setInterval(onFire, REPEAT_EVERY);
      }}
      onPressOut={stop}
      style={({ pressed }) => [style, pressed && styles.keyPressed]}
    >
      {children}
    </Pressable>
  );
}

export default function MathKeypad({
  onInsert,            // (latex) => void
  onCommand,           // (commandName) => void
  onSolve,
  onAbc,               // switch to the text keyboard for word problems
  onDismiss,
  history = [],        // [{ id, latex }] newest first
  onPickHistory,       // (latex) => void
  solveDisabled,
}) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('basic');
  const [alt, setAlt] = useState(null); // { item }

  const press = useCallback((item) => {
    tick();
    setAlt(null);
    if (item.cmd) onCommand(item.cmd);
    else onInsert(item.latex);
  }, [onInsert, onCommand]);

  const longPress = useCallback((item) => { thud(); setAlt({ item }); }, []);

  const rows = LAYOUTS[tab];

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]} testID="math-keypad">
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <Pressable
              key={t.id}
              testID={`keypad-tab-${t.id}`}
              onPress={() => { tick(); setAlt(null); setTab(t.id); }}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t.id === 'history' ? 'History' : t.label}
            >
              {t.icon
                ? <Ionicons name={t.icon} size={17} color={active ? colors.gold : colors.textSub} />
                : <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>}
              {active ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          );
        })}
        <Pressable onPress={onDismiss} style={styles.dismiss} accessibilityRole="button" accessibilityLabel="Hide keypad" testID="keypad-dismiss">
          <Ionicons name="chevron-down" size={18} color={colors.textSub} />
        </Pressable>
      </View>

      {/* Grid (fixed height so switching tabs never makes the screen jump) */}
      <View style={styles.grid}>
        {tab === 'history' ? (
          history.length ? (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: GAP }} showsVerticalScrollIndicator={false}>
              {history.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => { tick(); onPickHistory?.(h.latex); setTab('basic'); }}
                  style={({ pressed }) => [styles.historyRow, pressed && styles.keyPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Reuse this problem"
                >
                  <MathView latex={h.latex} fontSize={15} />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.historyEmpty}>
              <Ionicons name="time-outline" size={22} color={colors.textMuted} />
              <Text style={styles.historyEmptyText}>Problems you type will show up here.</Text>
            </View>
          )
        ) : (
          rows.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((item, c) => (
                <Key key={`${r}-${c}`} item={item} onPress={press} onLongPress={longPress} testID={`key-${tab}-${item.label}`} />
              ))}
            </View>
          ))
        )}

        {/* Long-press alternates */}
        {alt ? (
          <Pressable style={styles.altScrim} onPress={() => setAlt(null)} accessibilityLabel="Close alternates">
            <View style={styles.altBar}>
              {[alt.item, ...alt.item.alts].map((a) => (
                <Pressable
                  key={a.label}
                  onPress={() => press(a)}
                  style={({ pressed }) => [styles.altKey, pressed && styles.keyPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={a.a11y || a.label}
                  testID={`alt-${a.label}`}
                >
                  <Text style={styles.altText}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        ) : null}
      </View>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <Pressable onPress={() => { tick(); onAbc?.(); }} style={({ pressed }) => [styles.key, styles.bottomKey, pressed && styles.keyPressed]}
          accessibilityRole="button" accessibilityLabel="Switch to text keyboard for word problems" testID="key-abc">
          <Text style={styles.keyText}>ABC</Text>
        </Pressable>
        <RepeatKey onFire={() => { tick(); onCommand(CMD.left.cmd); }} style={[styles.key, styles.bottomKey]} a11y={CMD.left.a11y} testID="key-left">
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </RepeatKey>
        <RepeatKey onFire={() => { tick(); onCommand(CMD.right.cmd); }} style={[styles.key, styles.bottomKey]} a11y={CMD.right.a11y} testID="key-right">
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </RepeatKey>
        <RepeatKey onFire={() => { tick(); onCommand(CMD.backspace.cmd); }} style={[styles.key, styles.bottomKey]} a11y={CMD.backspace.a11y} testID="key-backspace">
          <Ionicons name="backspace-outline" size={20} color={colors.textPrimary} />
        </RepeatKey>
        <Pressable onPress={() => { thud(); onSolve?.(); }} disabled={solveDisabled}
          style={({ pressed }) => [styles.key, styles.solveKey, solveDisabled && { opacity: 0.5 }, pressed && styles.solvePressed]}
          accessibilityRole="button" accessibilityLabel="Solve" testID="key-solve">
          <Text style={styles.solveText}>Solve</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.black} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: GAP,
    ...Platform.select({ web: { userSelect: 'none' }, default: {} }),
  },
  tabs: { flexDirection: 'row', alignItems: 'stretch', height: 40, marginBottom: GAP },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSub },
  tabTextActive: { color: colors.gold },
  tabUnderline: { position: 'absolute', bottom: 2, left: '22%', right: '22%', height: 2.5, borderRadius: 2, backgroundColor: colors.gold },
  dismiss: { width: 40, alignItems: 'center', justifyContent: 'center' },

  grid: { height: KEYPAD_GRID_HEIGHT, gap: GAP },
  row: { flex: 1, flexDirection: 'row', gap: GAP },
  key: {
    flex: 1, height: KEY_HEIGHT, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  keyNum: { backgroundColor: colors.borderLight + '66' },
  keyOp: { backgroundColor: colors.goldDark + '22', borderColor: colors.goldDark + '55' },
  keyPressed: { backgroundColor: colors.blue + '40' },
  keyText: { fontSize: 17, fontWeight: '500', color: colors.textPrimary, paddingHorizontal: 2 },
  keyTextNum: { fontSize: 20, fontWeight: '500' },
  keyTextOp: { color: colors.gold, fontSize: 21, fontWeight: '600' },
  altDot: { position: 'absolute', top: 4, right: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textMuted },

  altScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg + 'b3', alignItems: 'center', justifyContent: 'center' },
  altBar: { flexDirection: 'row', gap: GAP, padding: GAP, backgroundColor: colors.surfaceHigh, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gold + '55' },
  altKey: { minWidth: 56, height: KEY_HEIGHT, borderRadius: radius.sm, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  altText: { fontSize: 18, color: colors.textPrimary, fontWeight: '500' },

  historyRow: { backgroundColor: colors.surfaceHigh, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  historyEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  historyEmptyText: { fontSize: 13, color: colors.textSub },

  bottomRow: { flexDirection: 'row', gap: GAP, marginTop: GAP },
  bottomKey: { flex: 1 },
  solveKey: { flex: 2, flexDirection: 'row', gap: 6, backgroundColor: colors.gold, borderColor: colors.goldDark },
  solvePressed: { backgroundColor: colors.goldDark },
  solveText: { fontSize: 16, fontWeight: '700', color: colors.black },
});
