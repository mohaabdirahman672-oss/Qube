import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

// Server-side weekly free-solve tracking (supabase/functions/weekly-usage +
// solve/index.js). Replaces the old client-only lifetime counter from
// src/lib/freeSolves.js (KI-R20) — that counter reset on reinstall/clear-storage,
// which the spec explicitly calls out to prevent this time around. The actual
// count now lives in public.weekly_solve_usage, keyed by device id (guests) or
// auth uid (signed in); this module just reads/displays it and merges on sign-in.
// See docs/plans/freemium-paywall-v2.md.

const DEVICE_ID_KEY = '@qube/device_id';
const MERGE_PENDING_KEY = '@qube/weekly_merge_pending';

// A stable per-install ID. Used as the rate-limit/weekly-cap key for guests, and
// briefly again right after sign-in so that week's guest usage can be merged into
// the new account instead of quietly resetting to a full week's allowance (see
// mergeGuestUsageIntoAccount below).
export async function getDeviceId() {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
  } catch {
    // fall through and mint a fresh one
  }
  const id = Crypto.randomUUID();
  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  } catch {
    // best-effort persistence; a new ID next launch just means a fresh guest bucket
  }
  return id;
}

// Fetches { remaining, limit, isPremium, resetsOn } without consuming a solve.
// Call whenever the paywall/pill needs to display current state (screen focus,
// after a solve, after sign-in) — the server is the source of truth, not local state.
export async function fetchWeeklyUsage() {
  const deviceId = await getDeviceId();
  const { data, error } = await supabase.functions.invoke('weekly-usage', {
    body: { deviceId },
  });
  if (error) throw error;
  return data;
}

// Call once, right after a guest signs in, so this week's guest usage merges into
// the new account (capped at the weekly limit) instead of the account starting a
// fresh, unearned allowance — closes the "use it up as a guest, sign in, get more" loop now
// that signing in no longer bypasses the cap on its own.
export async function mergeGuestUsageIntoAccount() {
  try {
    const alreadyMerged = await AsyncStorage.getItem(MERGE_PENDING_KEY);
    if (alreadyMerged === 'done') return;

    const deviceId = await getDeviceId();
    const { data, error } = await supabase.functions.invoke('weekly-usage', {
      body: { deviceId, mergeDeviceId: deviceId },
    });
    if (error) throw error;

    await AsyncStorage.setItem(MERGE_PENDING_KEY, 'done');
    return data;
  } catch (e) {
    // Best-effort — worst case a user keeps a little unmerged guest usage once.
    // Not worth blocking sign-in over.
    console.log('[weeklyUsage] merge failed, continuing anyway', e?.message);
  }
}

// Shared by SolveScreen's low-balance pill and PaywallScreen's "wait until..."
// line — was duplicated in PaywallScreen.js only; extracted here so both read
// the same reset-day name from the same `resetsOn` value.
export function resetDayName(resetsOn) {
  if (!resetsOn) return 'Monday';
  try {
    return new Date(resetsOn).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  } catch {
    return 'Monday';
  }
}
