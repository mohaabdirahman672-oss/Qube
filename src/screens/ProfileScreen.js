import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Switch, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingSymbols from '../components/FloatingSymbols';
import { useAuth } from '../hooks/useAuth';
import { fetchSavedProblems, clearSavedProblems, fetchCustomCards } from '../services/dbService';
import { colors, spacing, radius, typography } from '../theme';

const STATS = [
  { icon: 'book-outline',       label: 'Topics Available',  value: '500+', color: colors.blue   },
  { icon: 'calculator-outline', label: 'Practice Problems', value: '15',   color: colors.purple },
  { icon: 'layers-outline',     label: 'Flashcards',        value: '30',   color: colors.gold   },
  { icon: 'star-outline',       label: 'AI Accuracy',       value: '98%',  color: colors.green  },
];

const PRIVACY_URL = 'https://spot-hurricane-661.notion.site/Qube-Privacy-Policy-Last-updated-August-2026-3b838d7712fc803a8025f809d0fca230';

const MENU = [
  { icon: 'information-circle-outline', label: 'About Qube',       sub: 'Version 1.0.0 · Beta',          url: null },
  { icon: 'shield-checkmark-outline',   label: 'Privacy Policy',   sub: 'How we handle your data',        url: PRIVACY_URL },
  { icon: 'document-text-outline',      label: 'Terms of Service', sub: 'Usage terms and conditions',     url: PRIVACY_URL },
];

export default function ProfileScreen({ navigation }) {
  const { session, user, signOut, updateDisplayName, sendPasswordReset } = useAuth();
  const [savedCount,      setSavedCount]      = useState(0);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [nameInput,       setNameInput]       = useState('');
  const [nameSaving,      setNameSaving]      = useState(false);
  const [showStats,          setShowStats]          = useState(false);
  const [statsData,          setStatsData]          = useState(null);
  const [statsLoading,       setStatsLoading]       = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings,      setShowSettings]      = useState(false);
  const [showHelp,          setShowHelp]          = useState(false);
  const [openFaq,           setOpenFaq]           = useState(null);
  const [notifPrefs, setNotifPrefs] = useState({
    dailyReminder:    false,
    weeklySummary:    false,
    tipsAndTricks:    false,
    practiceReminder: false,
  });
  const notifLoaded = useRef(false);

  // Load persisted prefs once on mount
  useEffect(() => {
    AsyncStorage.getItem('@qube/notif_prefs').then(raw => {
      if (raw) setNotifPrefs(JSON.parse(raw));
      notifLoaded.current = true;
    }).catch(() => { notifLoaded.current = true; });
  }, []);

  // Save whenever prefs change (skip the initial load cycle)
  useEffect(() => {
    if (!notifLoaded.current) return;
    AsyncStorage.setItem('@qube/notif_prefs', JSON.stringify(notifPrefs)).catch(() => {});
  }, [notifPrefs]);

  const isGuest = !session;

  useFocusEffect(
    useCallback(() => {
      if (!session) { setSavedCount(0); return; }
      fetchSavedProblems()
        .then(({ data }) => setSavedCount(data.length))
        .catch(() => {});
    }, [session])
  );

  async function openStats() {
    setShowStats(true);
    if (!session) return;
    setStatsLoading(true);
    const [{ data: problems }, { data: cards }] = await Promise.all([
      fetchSavedProblems(),
      fetchCustomCards(),
    ]);
    const types   = problems.map(p => p.problem_type).filter(Boolean);
    const unique  = [...new Set(types)];
    const counts  = {};
    types.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    const breakdown = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count }));
    const topTopic = breakdown[0]?.topic ?? null;
    setStatsData({
      problemsSolved:    problems.length,
      flashcardsCreated: cards.length,
      topicsExplored:    unique.length,
      topTopic,
      breakdown,
    });
    setStatsLoading(false);
  }

  function openEditName() {
    setNameInput(displayName || '');
    setEditNameVisible(true);
  }

  async function saveDisplayName() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setNameSaving(true);
    const { error } = await updateDisplayName(trimmed);
    setNameSaving(false);
    if (error) {
      Alert.alert('Error', error);
    } else {
      setEditNameVisible(false);
    }
  }

  function handleClearSaved() {
    Alert.alert('Clear Saved', 'Delete all saved problems? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All', style: 'destructive',
        onPress: async () => {
          setSavedCount(0);
          await clearSavedProblems(user.id);
        },
      },
    ]);
  }

  async function handleChangePassword() {
    Alert.alert(
      'Change Password',
      `We'll send a password reset link to:\n${user?.email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Link',
          onPress: async () => {
            const { error } = await sendPasswordReset(user.email);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Email Sent', 'Check your inbox for the password reset link.');
            }
          },
        },
      ]
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'To permanently delete your account and all data, contact us at support@qube.app.\n\nThis action cannot be undone.',
      [{ text: 'OK' }]
    );
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('Error', 'Could not sign out. Please try again.');
          }
        },
      },
    ]);
  }

  // Prefer display_name set in Supabase metadata; fall back to email prefix
  const metaName   = user?.user_metadata?.display_name || user?.user_metadata?.full_name || null;
  const emailName  = user?.email
    ? user.email.split('@')[0].split(/[._-]/)[0].replace(/^./, c => c.toUpperCase())
    : null;
  const displayName  = metaName || emailName;
  const avatarLetter = displayName ? displayName[0].toUpperCase() : 'Q';

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <View style={styles.root}>
      <FloatingSymbols />
      <View style={styles.bgGlowBlue} />
      <View style={styles.bgGlowGold} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Avatar ──────────────────────────────────────────────────── */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={!isGuest ? openEditName : undefined}
              activeOpacity={isGuest ? 1 : 0.8}
              style={styles.avatarWrap}
            >
              <LinearGradient
                colors={[colors.blue, colors.blueDark]}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarLetter}>{avatarLetter}</Text>
              </LinearGradient>

              {/* Edit pencil badge — only for logged-in users */}
              {!isGuest && (
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="pencil" size={10} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>

            {isGuest ? (
              <>
                <Text style={styles.profileName}>Guest User</Text>
                <View style={styles.betaTag}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={openEditName} activeOpacity={0.7}>
                  <Text style={styles.profileName}>{displayName ?? 'Qube Student'}</Text>
                </TouchableOpacity>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                {joinDate ? (
                  <Text style={styles.joinDate}>Member since {joinDate}</Text>
                ) : null}
                <View style={[styles.betaTag, { marginTop: spacing.sm }]}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              </>
            )}
          </View>

          {/* ── Guest CTA ────────────────────────────────────────────────── */}
          {isGuest ? (
            <View style={styles.guestCta}>
              <View style={styles.guestCtaLeft}>
                <Ionicons name="bookmark-outline" size={18} color={colors.gold} />
                <Text style={styles.guestCtaText}>Sign in to save your progress</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.guestCtaBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.guestCtaBtnText}>Sign In →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.savedStat}>
              <Ionicons name="bookmark" size={18} color={colors.blue} />
              <Text style={styles.savedStatText}>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{savedCount} </Text>
                problem{savedCount !== 1 ? 's' : ''} saved
              </Text>
            </View>
          )}

          {/* ── My Activity ──────────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>MY ACTIVITY</Text>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={openStats}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.blue + '18', borderColor: colors.blue + '30' }]}>
              <Ionicons name="bar-chart-outline" size={18} color={colors.blue} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>Statistics</Text>
              <Text style={styles.menuSub}>
                {isGuest ? 'Sign in to track your progress' : `${savedCount} problem${savedCount !== 1 ? 's' : ''} solved`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowNotifications(true)}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.purple + '18', borderColor: colors.purple + '30' }]}>
              <Ionicons name="notifications-outline" size={18} color={colors.purple} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>Notifications</Text>
              <Text style={styles.menuSub}>
                {Object.values(notifPrefs).filter(Boolean).length === 0
                  ? 'All notifications off'
                  : `${Object.values(notifPrefs).filter(Boolean).length} notification${Object.values(notifPrefs).filter(Boolean).length !== 1 ? 's' : ''} on`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.gold + '18', borderColor: colors.gold + '30' }]}>
              <Ionicons name="settings-outline" size={18} color={colors.gold} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>Settings</Text>
              <Text style={styles.menuSub}>Account, password &amp; more</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowHelp(true)}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.green + '18', borderColor: colors.green + '30' }]}>
              <Ionicons name="help-circle-outline" size={18} color={colors.green} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>Help &amp; Support</Text>
              <Text style={styles.menuSub}>FAQs, contact &amp; feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {/* ── App stats ────────────────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>APP STATS</Text>
          <View style={styles.statsGrid}>
            {STATS.map(row => (
              <View key={row.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: row.color + '18', borderColor: row.color + '30' }]}>
                  <Ionicons name={row.icon} size={18} color={row.color} />
                </View>
                <Text style={[styles.statValue, { color: row.color }]}>{row.value}</Text>
                <Text style={styles.statLabel}>{row.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Data ─────────────────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>DATA</Text>
          {!isGuest && (
            <TouchableOpacity style={styles.menuRow} onPress={handleClearSaved} activeOpacity={0.75}>
              <View style={[styles.menuIcon, { backgroundColor: '#EF444418', borderColor: '#EF444430' }]}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Clear Saved Problems</Text>
                <Text style={styles.menuSub}>{savedCount} problem{savedCount !== 1 ? 's' : ''} saved to cloud</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {/* ── Sign Out (logged-in only) ─────────────────────────────────── */}
          {!isGuest && (
            <TouchableOpacity style={styles.menuRow} onPress={handleSignOut} activeOpacity={0.75}>
              <View style={[styles.menuIcon, { backgroundColor: '#EF444418', borderColor: '#EF444430' }]}>
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Sign Out</Text>
                <Text style={styles.menuSub}>{user?.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {/* ── Info ─────────────────────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>INFO</Text>
          {MENU.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              onPress={() => item.url && Linking.openURL(item.url)}
              activeOpacity={item.url ? 0.7 : 1}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}>
                <Ionicons name={item.icon} size={18} color={colors.textSub} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}

          {/* ── Create Account CTA for guests (bottom) ─────────────────── */}
          {isGuest && (
            <View style={styles.guestBottomCta}>
              <Text style={styles.guestBottomTitle}>Join QUBE</Text>
              <Text style={styles.guestBottomSub}>Create a free account to save your work and sync across devices.</Text>
              <TouchableOpacity
                style={styles.guestBottomBtn}
                onPress={() => navigation.navigate('SignUp')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.gold, colors.goldDark]}
                  style={styles.guestBottomBtnGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.guestBottomBtnText}>Create Free Account</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.black} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ── Help & Support Modal ────────────────────────────────────── */}
      <Modal
        visible={showHelp}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowHelp(false); setOpenFaq(null); }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => { setShowHelp(false); setOpenFaq(null); }}
          />
          <View style={[styles.modalSheet, { paddingBottom: spacing.xl, maxHeight: '85%' }]}>
            <View style={styles.modalHandle} />
            <View style={styles.statsModalHeader}>
              <Text style={styles.modalTitle}>Help &amp; Support</Text>
              <TouchableOpacity
                onPress={() => { setShowHelp(false); setOpenFaq(null); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.sm }}>
              <Text style={styles.faqSectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>

              {[
                {
                  q: 'How do I scan a math problem?',
                  a: 'Open the Scan tab and choose Camera mode. Point your camera at any handwritten or printed math problem and Qube will solve it step-by-step using AI.',
                },
                {
                  q: 'Why isn\'t my saved problem showing up?',
                  a: 'Problems are saved to your account in the cloud. Make sure you\'re signed in — guest users cannot save problems. Try switching to the Saved tab after signing in.',
                },
                {
                  q: 'How do I create my own flashcards?',
                  a: 'Go to the Practice tab and tap the + button in the Flashcards section. You must be signed in to create and save custom cards.',
                },
                {
                  q: 'Is Qube free to use?',
                  a: 'Yes! All core features — AI solving, flashcards, and problem saving — are free. Pro features with advanced analytics and unlimited history are coming soon.',
                },
                {
                  q: 'How accurate is the AI solver?',
                  a: 'Qube\'s AI achieves approximately 98% accuracy on standard algebra, calculus, trigonometry, and arithmetic problems. Very advanced proofs or ambiguous handwriting may occasionally produce errors.',
                },
                {
                  q: 'How do I reset my password?',
                  a: 'Go to Profile → Settings → Change Password. We\'ll send a reset link to your registered email address. Check your spam folder if you don\'t see it within a few minutes.',
                },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.faqItem, openFaq === i && styles.faqItemOpen]}
                  onPress={() => setOpenFaq(openFaq === i ? null : i)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, openFaq === i && { color: colors.green }]}>
                      {item.q}
                    </Text>
                    <Ionicons
                      name={openFaq === i ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={openFaq === i ? colors.green : colors.textMuted}
                    />
                  </View>
                  {openFaq === i && (
                    <Text style={styles.faqAnswer}>{item.a}</Text>
                  )}
                </TouchableOpacity>
              ))}
              {/* Contact & info */}
              <Text style={[styles.faqSectionLabel, { marginTop: spacing.lg }]}>CONTACT &amp; INFO</Text>

              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL('mailto:support@qube.app?subject=Qube%20Support')}
                activeOpacity={0.75}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.blue + '18', borderColor: colors.blue + '30' }]}>
                  <Ionicons name="mail-outline" size={18} color={colors.blue} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Contact Us</Text>
                  <Text style={styles.menuSub}>support@qube.app</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Alert.alert('Coming Soon', 'App Store rating will be available when Qube launches publicly.')}
                activeOpacity={0.75}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.gold + '18', borderColor: colors.gold + '30' }]}>
                  <Ionicons name="star-outline" size={18} color={colors.gold} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Rate Qube</Text>
                  <Text style={styles.menuSub}>Coming soon on the App Store</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Version footer */}
              <View style={styles.versionFooter}>
                <LinearGradient
                  colors={[colors.blue, colors.blueDark]}
                  style={styles.versionLogo}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.versionLogoText}>Q</Text>
                </LinearGradient>
                <Text style={styles.versionName}>Qube</Text>
                <Text style={styles.versionNumber}>Version 1.0.0 · Beta</Text>
                <Text style={styles.versionTagline}>Math. Every Dimension.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Settings Modal ──────────────────────────────────────────── */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowSettings(false)} />
          <View style={[styles.modalSheet, { paddingBottom: spacing.xl }]}>
            <View style={styles.modalHandle} />
            <View style={styles.statsModalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Account section */}
            <Text style={styles.settingsSectionLabel}>ACCOUNT</Text>

            {/* Email — read-only */}
            <View style={styles.settingsRow}>
              <View style={[styles.menuIcon, { backgroundColor: colors.blue + '18', borderColor: colors.blue + '30' }]}>
                <Ionicons name="mail-outline" size={18} color={colors.blue} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>Email</Text>
                <Text style={styles.menuSub}>{isGuest ? 'Not signed in' : user?.email}</Text>
              </View>
              <View style={styles.readOnlyBadge}>
                <Text style={styles.readOnlyText}>READ ONLY</Text>
              </View>
            </View>

            {/* Display name */}
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => { setShowSettings(false); setTimeout(openEditName, 300); }}
              activeOpacity={0.75}
              disabled={isGuest}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.purple + '18', borderColor: colors.purple + '30' }]}>
                <Ionicons name="person-outline" size={18} color={colors.purple} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>Display Name</Text>
                <Text style={styles.menuSub}>{displayName ?? (isGuest ? 'Sign in to set a name' : 'Not set')}</Text>
              </View>
              {!isGuest && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
            </TouchableOpacity>

            {/* Change password */}
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleChangePassword}
              activeOpacity={0.75}
              disabled={isGuest}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.gold + '18', borderColor: colors.gold + '30' }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.gold} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuLabel, isGuest && { color: colors.textMuted }]}>Change Password</Text>
                <Text style={styles.menuSub}>Send a reset link to your email</Text>
              </View>
              {!isGuest && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
            </TouchableOpacity>

            {/* Pro upgrade placeholder */}
            <Text style={[styles.settingsSectionLabel, { marginTop: spacing.lg }]}>PLAN</Text>
            <View style={styles.proCard}>
              <LinearGradient
                colors={[colors.goldDark + '22', colors.gold + '12']}
                style={styles.proCardGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.proCardTop}>
                  <View>
                    <View style={styles.proComingSoonBadge}>
                      <Text style={styles.proComingSoonText}>COMING SOON</Text>
                    </View>
                    <Text style={styles.proCardTitle}>Upgrade to Pro</Text>
                    <Text style={styles.proCardSub}>Unlock everything Qube has to offer</Text>
                  </View>
                  <Ionicons name="rocket-outline" size={32} color={colors.gold} style={{ opacity: 0.7 }} />
                </View>

                <View style={styles.proFeatureList}>
                  {[
                    'Unlimited problem saves',
                    'Advanced statistics & insights',
                    'Priority AI solving',
                    'Offline flashcard access',
                  ].map(f => (
                    <View key={f} style={styles.proFeatureRow}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.gold} style={{ opacity: 0.6 }} />
                      <Text style={styles.proFeatureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.proBtn}>
                  <Text style={styles.proBtnText}>Coming Soon</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Danger zone */}
            <Text style={[styles.settingsSectionLabel, { marginTop: spacing.lg }]}>DANGER ZONE</Text>
            <TouchableOpacity style={styles.settingsRow} onPress={handleDeleteAccount} activeOpacity={0.75}>
              <View style={[styles.menuIcon, { backgroundColor: '#EF444418', borderColor: '#EF444430' }]}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Delete Account</Text>
                <Text style={styles.menuSub}>Permanently remove your account &amp; data</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Notifications Modal ─────────────────────────────────────── */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowNotifications(false)} />
          <View style={[styles.modalSheet, { paddingBottom: spacing.xl }]}>
            <View style={styles.modalHandle} />
            <View style={styles.statsModalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Choose which notifications you want to receive.</Text>

            {[
              { key: 'dailyReminder',    icon: 'alarm-outline',          color: colors.blue,   label: 'Daily Study Reminder',    sub: 'A nudge each day to keep your streak' },
              { key: 'weeklySummary',    icon: 'bar-chart-outline',      color: colors.purple, label: 'Weekly Progress Summary',  sub: 'Your stats every Sunday morning' },
              { key: 'tipsAndTricks',    icon: 'bulb-outline',           color: colors.gold,   label: 'Tips & Tricks',            sub: 'Quick math tips to boost your skills' },
              { key: 'practiceReminder', icon: 'school-outline',         color: colors.green,  label: 'Practice Reminders',       sub: 'Reminders to review your flashcards' },
            ].map(item => (
              <View key={item.key} style={styles.notifRow}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '18', borderColor: item.color + '30' }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Switch
                  value={notifPrefs[item.key]}
                  onValueChange={val => setNotifPrefs(prev => ({ ...prev, [item.key]: val }))}
                  trackColor={{ false: colors.border, true: colors.blue + '80' }}
                  thumbColor={notifPrefs[item.key] ? colors.blue : colors.textMuted}
                  ios_backgroundColor={colors.border}
                />
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {/* ── Statistics Modal ────────────────────────────────────────── */}
      <Modal
        visible={showStats}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStats(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowStats(false)}
          />
          <View style={[styles.modalSheet, { paddingBottom: spacing.xl }]}>
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.statsModalHeader}>
              <Text style={styles.modalTitle}>Your Statistics</Text>
              <TouchableOpacity onPress={() => setShowStats(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {!session ? (
              <View style={styles.statsGuestWrap}>
                <Ionicons name="bar-chart-outline" size={36} color={colors.textMuted} />
                <Text style={styles.statsGuestText}>Sign in to track your statistics</Text>
              </View>
            ) : statsLoading ? (
              <View style={styles.statsGuestWrap}>
                <ActivityIndicator color={colors.blue} size="large" />
                <Text style={styles.statsGuestText}>Loading your stats…</Text>
              </View>
            ) : statsData ? (
              <>
                <View style={styles.statsModalGrid}>
                  {[
                    { icon: 'checkmark-circle-outline', label: 'Problems Solved',     value: statsData.problemsSolved,    color: colors.blue   },
                    { icon: 'layers-outline',            label: 'Flashcards Created',  value: statsData.flashcardsCreated, color: colors.purple },
                    { icon: 'compass-outline',           label: 'Topics Explored',     value: statsData.topicsExplored,    color: colors.gold   },
                    { icon: 'star-outline',              label: 'AI Accuracy',         value: '98%',                       color: colors.green  },
                  ].map(s => (
                    <View key={s.label} style={styles.statsModalCard}>
                      <View style={[styles.statsModalIcon, { backgroundColor: s.color + '18', borderColor: s.color + '30' }]}>
                        <Ionicons name={s.icon} size={20} color={s.color} />
                      </View>
                      <Text style={[styles.statsModalValue, { color: s.color }]}>{s.value}</Text>
                      <Text style={styles.statsModalLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>

                {statsData.topTopic ? (
                  <View style={styles.topTopicRow}>
                    <Ionicons name="trophy-outline" size={16} color={colors.gold} />
                    <Text style={styles.topTopicText}>
                      Most practiced: <Text style={{ color: colors.gold, fontWeight: '700' }}>{statsData.topTopic}</Text>
                    </Text>
                  </View>
                ) : null}

                {statsData.breakdown?.length > 0 ? (
                  <View style={styles.breakdownWrap}>
                    <Text style={styles.breakdownTitle}>BREAKDOWN BY TOPIC</Text>
                    {statsData.breakdown.map(({ topic, count }) => {
                      const pct = statsData.problemsSolved > 0 ? count / statsData.problemsSolved : 0;
                      return (
                        <View key={topic} style={styles.breakdownRow}>
                          <Text style={styles.breakdownTopic} numberOfLines={1}>{topic}</Text>
                          <View style={styles.breakdownBarTrack}>
                            <View style={[styles.breakdownBarFill, { width: `${Math.round(pct * 100)}%` }]} />
                          </View>
                          <Text style={styles.breakdownCount}>{count}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : null}

                {statsData.problemsSolved === 0 && (
                  <Text style={styles.statsEmptyHint}>
                    Solve your first problem in the Scan tab to start tracking progress.
                  </Text>
                )}
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* ── Edit Display Name Modal ─────────────────────────────────── */}
      <Modal
        visible={editNameVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditNameVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setEditNameVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Display Name</Text>
            <Text style={styles.modalSub}>
              This is how your name appears in the app. It does not change your login email.
            </Text>

            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="e.g. Alex, Math Student…"
              placeholderTextColor={colors.textMuted}
              maxLength={30}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveDisplayName}
            />
            <Text style={styles.nameCount}>{nameInput.length}/30</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditNameVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, (!nameInput.trim() || nameSaving) && { opacity: 0.5 }]}
                onPress={saveDisplayName}
                disabled={!nameInput.trim() || nameSaving}
              >
                <LinearGradient
                  colors={[colors.blue, colors.blueMid]}
                  style={styles.modalSaveBtnGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {nameSaving
                    ? <ActivityIndicator color={colors.white} size="small" />
                    : <Text style={styles.modalSaveText}>Save</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.bg },
  bgGlowBlue: { position: 'absolute', top: -100, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: colors.blue, opacity: 0.06 },
  bgGlowGold: { position: 'absolute', bottom: 200, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: colors.gold, opacity: 0.04 },
  safe:       { flex: 1 },
  scroll:     { paddingHorizontal: spacing.md, paddingTop: spacing.md },

  avatarSection:   { alignItems: 'center', paddingVertical: spacing.xl },
  avatarWrap:      { marginBottom: spacing.md },
  avatar:          { width: 88, height: 88, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', shadowColor: colors.blue, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 10 },
  avatarLetter:    { fontSize: 44, fontWeight: '900', color: colors.white, letterSpacing: -2 },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg },
  profileName:   { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  profileEmail:  { fontSize: 13, color: colors.textSub, marginBottom: spacing.sm },
  betaTag:       { backgroundColor: colors.blue + '22', borderRadius: radius.full, paddingHorizontal: spacing.sm + 2, paddingVertical: 2, borderWidth: 1, borderColor: colors.blue + '40' },
  betaText:      { fontSize: 9, fontWeight: '800', color: colors.blue, letterSpacing: 1.5 },
  joinDate:      { fontSize: 12, color: colors.textMuted, marginTop: 3, marginBottom: spacing.xs },

  // Guest sign-in CTA bar
  guestCta:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.gold + '12', borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.gold + '30' },
  guestCtaLeft:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  guestCtaText:   { fontSize: 13, color: colors.gold, fontWeight: '500', flex: 1 },
  guestCtaBtn:    { backgroundColor: colors.gold, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2 },
  guestCtaBtnText:{ fontSize: 12, fontWeight: '700', color: colors.black },

  savedStat:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: spacing.sm + 2, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  savedStatText: { ...typography.body, color: colors.textSub },

  sectionLabel: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.2, marginBottom: spacing.sm },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard:  { flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statIcon:  { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, borderWidth: 1 },
  statValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginBottom: 2 },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', textAlign: 'center' },

  menuRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  menuIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  menuText: { flex: 1 },
  menuLabel:{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  menuSub:  { fontSize: 12, color: colors.textMuted },

  // Help & FAQ
  faqSectionLabel: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.2, marginBottom: spacing.sm },
  faqItem:         { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  faqItemOpen:     { borderColor: colors.green + '50', backgroundColor: colors.green + '08' },
  faqHeader:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  faqQuestion:     { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1, lineHeight: 20 },
  faqAnswer:       { fontSize: 13, color: colors.textSub, lineHeight: 20, marginTop: spacing.sm },
  contactRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  versionFooter:   { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs },
  versionLogo:     { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  versionLogoText: { fontSize: 22, fontWeight: '900', color: colors.white },
  versionName:     { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  versionNumber:   { fontSize: 12, color: colors.textMuted },
  versionTagline:  { fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 },

  // Settings modal
  settingsSectionLabel: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.2, marginBottom: spacing.sm, marginTop: spacing.xs },
  settingsRow:          { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: colors.border },
  readOnlyBadge:        { backgroundColor: colors.surfaceHigh, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: colors.border },
  readOnlyText:         { fontSize: 8, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8 },
  proCard:              { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.gold + '30', marginBottom: spacing.sm },
  proCardGrad:          { padding: spacing.md },
  proCardTop:           { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md },
  proComingSoonBadge:   { backgroundColor: colors.gold + '25', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: colors.gold + '40', alignSelf: 'flex-start', marginBottom: spacing.xs },
  proComingSoonText:    { fontSize: 8, fontWeight: '800', color: colors.gold, letterSpacing: 1.2 },
  proCardTitle:         { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 3 },
  proCardSub:           { fontSize: 12, color: colors.textSub },
  proFeatureList:       { gap: spacing.xs, marginBottom: spacing.md },
  proFeatureRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  proFeatureText:       { fontSize: 12, color: colors.textSub },
  proBtn:               { backgroundColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  proBtnText:           { fontSize: 13, fontWeight: '700', color: colors.textMuted },

  // Notifications modal
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: colors.border },

  // Statistics modal
  statsModalHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  statsModalGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statsModalCard:    { flex: 1, minWidth: '45%', backgroundColor: colors.bg, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statsModalIcon:    { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, borderWidth: 1 },
  statsModalValue:   { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 3 },
  statsModalLabel:   { fontSize: 11, color: colors.textMuted, fontWeight: '500', textAlign: 'center' },
  topTopicRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.gold + '12', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.gold + '25', marginBottom: spacing.sm },
  topTopicText:      { fontSize: 13, color: colors.textSub },
  statsGuestWrap:    { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  statsGuestText:    { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  statsEmptyHint:    { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.sm },
  breakdownWrap:     { marginTop: spacing.sm, backgroundColor: colors.bg, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  breakdownTitle:    { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.2, marginBottom: spacing.xs },
  breakdownRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  breakdownTopic:    { fontSize: 12, fontWeight: '600', color: colors.textSub, width: 90 },
  breakdownBarTrack: { flex: 1, height: 6, backgroundColor: colors.surface, borderRadius: 3, overflow: 'hidden' },
  breakdownBarFill:  { height: 6, backgroundColor: colors.blue, borderRadius: 3 },
  breakdownCount:    { fontSize: 12, fontWeight: '700', color: colors.blue, width: 24, textAlign: 'right' },

  // Edit name modal
  modalOverlay:     { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet:       { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xxl ?? spacing.xl + spacing.lg, borderTopWidth: 1, borderColor: colors.border },
  modalHandle:      { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  modalTitle:       { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  modalSub:         { ...typography.caption, color: colors.textSub, lineHeight: 18, marginBottom: spacing.lg },
  nameInput:        { backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, color: colors.textPrimary, fontSize: 16, marginBottom: spacing.xs },
  nameCount:        { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.lg },
  modalActions:     { flexDirection: 'row', gap: spacing.sm },
  modalCancelBtn:   { flex: 1, height: 50, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  modalCancelText:  { fontSize: 15, fontWeight: '600', color: colors.textSub },
  modalSaveBtn:     { flex: 2, height: 50, borderRadius: radius.lg, overflow: 'hidden' },
  modalSaveBtnGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalSaveText:    { fontSize: 15, fontWeight: '700', color: colors.white },

  // Guest bottom CTA card
  guestBottomCta:    { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.gold + '25', marginTop: spacing.lg },
  guestBottomTitle:  { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  guestBottomSub:    { ...typography.body, color: colors.textSub, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  guestBottomBtn:    { width: '100%', borderRadius: radius.lg, overflow: 'hidden' },
  guestBottomBtnGrad:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  guestBottomBtnText:{ fontSize: 15, fontWeight: '700', color: colors.black },
});
