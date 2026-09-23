import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../context/SubscriptionContext';
import { getOfferings, purchasePackage, restorePurchases } from '../lib/iap';
import { resetDayName } from '../lib/weeklyUsage';
import { colors, spacing, radius, typography } from '../theme';

const FEATURES = [
  { icon: 'infinite',        text: 'Unlimited solves, every day' },
  { icon: 'bulb',            text: 'Worked examples with real numbers on every flashcard' },
  { icon: 'shuffle',         text: 'Similar-question generation for extra practice' },
  { icon: 'library',         text: 'Homework-question sets from what you’ve studied' },
  { icon: 'stats-chart',     text: 'Graphing — coming in v1.2' },
];

// The paywall screen, shown when the weekly free-solve cap is hit (also reachable
// by tapping any LockedPreview). Per spec: headline states the limit was hit, the
// primary CTA starts a trial, and a clearly-visible secondary line always offers
// the free path back in — never trap a free user into feeling forced to pay.
export default function PaywallScreen({ visible, onClose, navigation, limit = 20 }) {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { resetsOn, refresh } = useSubscription();
  const [plan, setPlan] = useState('annual');
  const [offering, setOffering] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!visible) return;
    getOfferings().then(setOffering).catch(() => setOffering(null));
  }, [visible]);

  const monthlyPkg = offering?.monthly ?? null;
  const annualPkg  = offering?.annual ?? null;
  const monthlyPrice = monthlyPkg?.product?.priceString ?? '$9.99/mo';
  const annualPrice  = annualPkg?.product?.priceString ?? '$79.99/yr';

  async function handleStartTrial() {
    if (!session) {
      onClose();
      navigation.navigate('Login');
      return;
    }
    const pkg = plan === 'annual' ? annualPkg : monthlyPkg;
    if (!pkg) {
      Alert.alert('Not available yet', 'Subscriptions aren’t set up in this build yet. Try again shortly.');
      return;
    }
    setPurchasing(true);
    try {
      const { isPremium } = await purchasePackage(pkg);
      if (isPremium) {
        await refresh();
        onClose();
      }
    } catch (e) {
      if (!e?.userCancelled) {
        Alert.alert('Purchase failed', e?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const { isPremium } = await restorePurchases();
      await refresh();
      if (isPremium) {
        onClose();
      } else {
        Alert.alert('No purchases found', 'We couldn’t find an active subscription for this Apple ID.');
      }
    } catch (e) {
      Alert.alert('Restore failed', e?.message || 'Something went wrong. Please try again.');
    } finally {
      setRestoring(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.root}>
        <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={[colors.gold + '30', colors.gold + '08']}
              style={styles.iconBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="sparkles" size={30} color={colors.gold} />
            </LinearGradient>

            <Text style={styles.headline}>You've used your {limit} free solves this week</Text>

            <View style={styles.featureList}>
              {FEATURES.map(f => (
                <View key={f.text} style={styles.featureRow}>
                  <View style={styles.featureIconWrap}>
                    <Ionicons name={f.icon} size={16} color={colors.blue} />
                  </View>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.planRow}>
              <TouchableOpacity
                style={[styles.planCard, plan === 'monthly' && styles.planCardActive]}
                onPress={() => setPlan('monthly')}
                activeOpacity={0.85}
              >
                <Text style={styles.planLabel}>Monthly</Text>
                <Text style={styles.planPrice}>{monthlyPrice}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.planCard, plan === 'annual' && styles.planCardActive]}
                onPress={() => setPlan('annual')}
                activeOpacity={0.85}
              >
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
                <Text style={styles.planLabel}>Annual</Text>
                <Text style={styles.planPrice}>{annualPrice}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleStartTrial} activeOpacity={0.85} disabled={purchasing}>
              <LinearGradient
                colors={[colors.gold, colors.goldDark]}
                style={styles.primaryBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {purchasing ? (
                  <ActivityIndicator color={colors.black} />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Start 7-day free trial</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.black} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.trialFinePrint}>
              Free for 7 days, then {plan === 'annual' ? annualPrice : monthlyPrice}. Cancel anytime before your trial ends and you won't be charged — you'll keep free-tier access, not lose the app.
            </Text>

            {/* Secondary path — must stay visible, not buried, so free users never feel trapped. */}
            <TouchableOpacity onPress={onClose} style={styles.waitBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.waitText}>or wait until {resetDayName(resetsOn)} for more free solves</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} disabled={restoring}>
              <Text style={styles.restoreText}>{restoring ? 'Restoring…' : 'Restore Purchases'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },

  iconBadge: {
    width: 72, height: 72, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.sm, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.gold + '30',
  },
  headline: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },

  featureList: { width: '100%', gap: spacing.md, marginBottom: spacing.xl },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureIconWrap: {
    width: 30, height: 30, borderRadius: radius.sm,
    backgroundColor: colors.blue + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { ...typography.body, color: colors.textPrimary, flex: 1 },

  planRow: { flexDirection: 'row', gap: spacing.sm, width: '100%', marginBottom: spacing.lg },
  planCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  planCardActive: { borderColor: colors.gold, backgroundColor: colors.gold + '12' },
  bestValueBadge: {
    position: 'absolute', top: -10,
    backgroundColor: colors.gold, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  bestValueText: { fontSize: 9, fontWeight: '800', color: colors.black, letterSpacing: 0.4 },
  planLabel: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xs },
  planPrice: { ...typography.caption, color: colors.textSub, marginTop: 2 },

  primaryBtn: { width: '100%', borderRadius: radius.lg, overflow: 'hidden' },
  primaryBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md, gap: spacing.sm, minHeight: 52,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.black, letterSpacing: 0.2 },
  trialFinePrint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },

  waitBtn: { marginTop: spacing.xl, paddingVertical: spacing.xs },
  waitText: { ...typography.body, color: colors.blue, textAlign: 'center' },

  restoreBtn: { marginTop: spacing.md, paddingVertical: spacing.xs },
  restoreText: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
