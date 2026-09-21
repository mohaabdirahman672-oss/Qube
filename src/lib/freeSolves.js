import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Guests get this many total solves (scan or type-in) before being asked to sign in.
// Server-side, the solve function enforces a much looser per-hour cap on the same
// device ID as an abuse backstop — this number here is the real product limit.
export const FREE_SOLVE_LIMIT = 5;

const USED_KEY      = '@qube/free_solves_used';
const DEVICE_ID_KEY = '@qube/device_id';

export async function getRemainingFreeSolves() {
  const used = await getUsedCount();
  return Math.max(0, FREE_SOLVE_LIMIT - used);
}

export async function consumeFreeSolve() {
  const used = await getUsedCount();
  const next = used + 1;
  await AsyncStorage.setItem(USED_KEY, String(next));
  return Math.max(0, FREE_SOLVE_LIMIT - next);
}

// Called once a guest signs in — the real per-user server-side rate limit takes over,
// so the local guest counter no longer applies (deliberately reset, not carried over,
// so signing in always fully unlocks solving rather than inheriting a used-up guest count).
export async function resetFreeSolves() {
  await AsyncStorage.removeItem(USED_KEY);
}

async function getUsedCount() {
  try {
    const raw = await AsyncStorage.getItem(USED_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

// A stable per-install ID, sent to the solve function so anonymous callers can be
// rate-limited server-side (a coarse abuse backstop, not the real product limit above).
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
    // best-effort persistence; a new ID next launch just means a fresh abuse-backstop bucket
  }
  return id;
}
