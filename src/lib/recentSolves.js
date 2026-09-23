import AsyncStorage from '@react-native-async-storage/async-storage';

// Home's "Recent" list — the last few solutions, exactly as Solve returned them.
// On-device only and text only (never the photo): works for guests, never
// leaves the phone, and is cleared on sign-out (AuthContext) so a shared device
// doesn't show the previous user's work. Separate from Saved, which is
// deliberate, account-bound, and synced via Supabase.
const RECENT_SOLVES_KEY = '@qube/recent_solves';
export const MAX_RECENT_SOLVES = 5;

export async function getRecentSolves() {
  try {
    const raw = await AsyncStorage.getItem(RECENT_SOLVES_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// source: 'camera' | 'upload' | 'type'; typedText is the user's own input for
// typed solves (preferred over the AI's transcription, which is for photos).
export async function addRecentSolve({ result, source, typedText }) {
  const entry = {
    id:       `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    solvedAt: new Date().toISOString(),
    source,
    problem:  typedText || result.problem || null,
    result: {
      problemType:      result.problemType,
      difficulty:       result.difficulty,
      explanation:      result.explanation,
      steps:            result.steps,
      answer:           result.answer,
      commonMistake:    result.commonMistake,
      formula:          result.formula,
      practiceQuestion: result.practiceQuestion,
    },
  };
  try {
    const list = await getRecentSolves();
    await AsyncStorage.setItem(
      RECENT_SOLVES_KEY,
      JSON.stringify([entry, ...list].slice(0, MAX_RECENT_SOLVES)),
    );
  } catch {}
  return entry;
}

export async function clearRecentSolves() {
  try { await AsyncStorage.removeItem(RECENT_SOLVES_KEY); } catch {}
}

export function recentSolveTitle(entry) {
  return entry.problem || entry.result?.problemType || 'Solved problem';
}
