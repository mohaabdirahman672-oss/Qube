import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LegalDocModal from '../components/LegalDocModal';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../context/SubscriptionContext';
import { getOfferings, getIntroEligibility, isTrialEligible, purchasePackage, restorePurchases } from '../lib/iap';
import { resetDayName } from '../lib/weeklyUsage';
import {
  PRIVACY_POLICY_SECTIONS, TERMS_OF_SERVICE_SECTIONS,
  PRIVACY_POLICY_EFFECTIVE, TERMS_OF_SERVICE_EFFECTIVE,
} from '../data/legalContent';
import { colors, spacing, radius, typography } from '../theme';

// Only what a subscriber actually gets today (App Review 2.3 / 3.1.2). "Fair use"
// is defined in the Terms: solve's 100/hour Premium ceiling (PREMIUM_RATE_LIMIT_MAX).
const FEATURES = [
  { icon: 'infinite', text: 'Unlimited solves (fair use)' },
  { icon: 'bulb',     text: 'Worked examples with real numbers on every flashcard' },
];

// Shown separately and muted, so nobody pays believing these exist yet.
const COMING_SOON = [
  'Similar-question generation',
  'Homework sets from what you’ve studied',
  'Graphing (v1.2)',
];

const FALLBACK_PRICE = { monthly: '$9.99', annual: '$79.99' };
const PERIOD_LABEL   = { monthly: 'month', annual: 'year' };

// From the store's intro offer, not hardcoded. trialLength → "7-day" (button),
// trialDuration → "7 days" / "1 week" (fine print).
function trialParts(introPrice) {
  return { n: introPrice?.periodNumberOfUnits ?? 7, unit: (introPrice?.periodUnit || 'DAY').toLowerCase() };
}
function trialLength(introPrice) {
  const { n, unit } = trialParts(introPrice);
  return `${n}-${unit}`;
}
function trialDuration(introPrice) {
  const { n, unit } = trialParts(introPrice);
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
}

// The paywall. reason="limit" when opened because the weekly free-solve cap was
// hit (SolveScreen); otherwise it was opened on purpose (Profile's upgrade row,
// a locked flashcard example), so the headline mustn't claim the limit was hit.
// Primary CTA offers the trial only to users Apple will actually give one;
// the "wait until Monday" free path always stays visible.
export default function PaywallScreen({ visible, onClose, navigation, limit = 20, reason }) {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { resetsOn, refresh } = useSubscription();
  const [plan, setPlan] = useState('annual');
  const [offering, setOffering] = useState(null);
  const [eligibility, setEligibility] = useState({});
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null);

  useEffect(() => {
    if (!visible) return;
    getOfferings()
      .then(async (current) => {
        setOffering(current);
        const ids = [current?.monthly, current?.annual]
          .map(p => p?.product?.identifier)
          .filter(Boolean);
        setEligibility(await getIntroEligibility(ids));
      })
      .catch(() => setOffering(null));
  }, [visible]);

  const pkgs = { monthly: offering?.monthly ?? null, annual: offering?.annual ?? null };
  // Store price strings don't reliably carry a period ("$9.99"), so the period
  // is always appended here — Apple requires the billing period to be clear.
  const priceFor = (p) => `${pkgs[p]?.product?.priceString ?? FALLBACK_PRICE[p]} / ${PERIOD_LABEL[p]}`;

  const selectedProduct = pkgs[plan]?.product ?? null;
  const trialEligible   = isTrialEligible(selectedProduct, eligibility);
  const selectedPrice   = priceFor(plan);

  const ctaLabel = !session
    ? 'Sign in to subscribe'
    : trialEligible
      ? `Start ${trialLength(selectedProduct.introPrice)} free trial`
      : 'Subscribe';

  async function handleSubscribe() {
    if (!session) {
      onClose();
      navigation.navigate('Login');
      return;
    }
    const pkg = pkgs[plan];
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

            <Text style={styles.headline}>
              {reason === 'limit'
                ? `You've used your ${limit} free solves this week`
                : 'Get more out of Qube with Premium'}
            </Text>

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

            <View style={styles.soonWrap}>
              <Text style={styles.soonLabel}>COMING TO PREMIUM</Text>
              {COMING_SOON.map(t => (
                <View key={t} style={styles.soonRow}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.soonText}>{t}</Text>
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonBadgeText}>SOON</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.planRow}>
              {['monthly', 'annual'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.planCard, plan === p && styles.planCardActive]}
                  onPress={() => setPlan(p)}
                  activeOpacity={0.85}
                >
                  {p === 'annual' ? (
                    <View style={styles.bestValueBadge}>
                      <Text style={styles.bestValueText}>BEST VALUE</Text>
                    </View>
                  ) : null}
                  <Text style={styles.planLabel}>{p === 'annual' ? 'Annual' : 'Monthly'}</Text>
                  <Text style={styles.planPrice}>{priceFor(p)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {!session ? (
              <Text style={styles.signInNote}>
                Premium is linked to your Qube account, so it works on every device you sign in on. Signing in with Apple takes a few seconds.
              </Text>
            ) : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubscribe} activeOpacity={0.85} disabled={purchasing}>
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
                    <Text style={styles.primaryBtnText}>{ctaLabel}</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.black} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Required subscription disclosures (App Review 3.1.2). */}
            <Text style={styles.trialFinePrint}>
              {trialEligible
                ? `Free for ${trialDuration(selectedProduct.introPrice)}, then ${selectedPrice}. Payment is charged to your Apple ID when the trial ends — cancel before then and you won't be charged, and you keep free-tier access. `
                : `${selectedPrice}. Payment is charged to your Apple ID at confirmation of purchase. `}
              Subscription renews automatically unless cancelled at least 24 hours before the end of the current period; your account is charged for renewal within 24 hours before the period ends. Manage or cancel anytime in Settings → Apple ID → Subscriptions.
            </Text>
            <View style={styles.legalRow}>
              <TouchableOpacity onPress={() => setLegalDoc('terms')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.legalLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.legalSep}>·</Text>
              <TouchableOpacity onPress={() => setLegalDoc('privacy')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>

            {/* Secondary path — must stay visible, not buried, so free users never feel trapped. */}
            <TouchableOpacity onPress={onClose} style={styles.waitBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.waitText}>or wait until {resetDayName(resetsOn)} for more free solves</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} disabled={restoring}>
              <Text style={styles.restoreText}>{restoring ? 'Restoring…' : 'Restore Purchases'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <LegalDocModal
          visible={legalDoc === 'terms'}
          onClose={() => setLegalDoc(null)}
          title="Terms of Service"
          subtitle={TERMS_OF_SERVICE_EFFECTIVE}
          sections={TERMS_OF_SERVICE_SECTIONS}
        />
        <LegalDocModal
          visible={legalDoc === 'privacy'}
          onClose={() => setLegalDoc(null)}
          title="Privacy Policy"
          subtitle={PRIVACY_POLICY_EFFECTIVE}
          sections={PRIVACY_POLICY_SECTIONS}
        />
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

  soonWrap: {
    width: '100%', gap: spacing.xs + 2, marginTop: -spacing.sm, marginBottom: spacing.xl,
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  soonLabel: { ...typography.label, color: colors.textMuted, marginBottom: 2 },
  soonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  soonText: { ...typography.caption, color: colors.textMuted, flex: 1 },
  soonBadge: {
    borderRadius: radius.full, paddingHorizontal: spacing.xs + 2, paddingVertical: 1,
    borderWidth: 1, borderColor: colors.border,
  },
  soonBadgeText: { fontSize: 8, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.6 },

  signInNote: {
    ...typography.caption, color: colors.textSub, textAlign: 'center',
    lineHeight: 18, marginBottom: spacing.md, paddingHorizontal: spacing.sm,
  },

  legalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  legalLink: { ...typography.caption, color: colors.blue, textDecorationLine: 'underline' },
  legalSep: { ...typography.caption, color: colors.textMuted },

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
