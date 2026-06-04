import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, typography } from '../theme';

const TABS = [
  { key: 'home',    label: 'Home',    icon: 'home'     },
  { key: 'saved',   label: 'Saved',   icon: 'bookmark' },
  { key: 'scan',    label: 'Scan',    icon: 'scan'     },  // center — special
  { key: 'practice', label: 'Practice', icon: 'layers'   },
  { key: 'profile', label: 'Profile', icon: 'person'   },
];

function TabItem({ tab, isActive, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
    onPress?.(tab.key);
  };

  if (tab.key === 'scan') {
    return (
      <TouchableOpacity style={styles.scanWrap} onPress={handlePress} activeOpacity={0.9}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={[colors.gold, colors.goldDark]}
            style={styles.scanCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="scan" size={26} color={colors.black} />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.scanLabel}>Scan</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.tab} onPress={handlePress} activeOpacity={0.7}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale: scaleAnim }] }]}>
        {isActive && <View style={styles.activePill} />}
        <Ionicons
          name={isActive ? tab.icon : `${tab.icon}-outline`}
          size={22}
          color={isActive ? colors.blue : colors.textMuted}
        />
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function BottomNav({ activeTab = 'home', onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {/* Glass blur border */}
      <View style={styles.topBorder} />
      {TABS.map((tab) => (
        <TabItem
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onPress={onTabPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    paddingTop: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabInner: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: -2,
    left: 4,
    right: 4,
    height: 2.5,
    borderRadius: radius.full,
    backgroundColor: colors.blue,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
    fontSize: 10,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.blue,
    fontWeight: '700',
  },
  scanWrap: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 4,
    marginTop: -20,
  },
  scanCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  scanLabel: {
    ...typography.caption,
    color: colors.gold,
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
  },
});
