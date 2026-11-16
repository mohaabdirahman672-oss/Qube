import AsyncStorage from '@react-native-async-storage/async-storage';

// The math keypad's History tab: the last problems typed on this phone, stored as
// the field's LaTeX so they reload as editable math. On-device only (owner
// decision 2026-10-25, like Recent) and cleared on sign-out by AuthContext so a
// shared device doesn't show the previous user's problems.
const KEY = '@qube/typed_history';
export const MAX_TYPED_HISTORY = 20;

export async function getTypedHistory() {
  try {
    const list = JSON.parse((await AsyncStorage.getItem(KEY)) || '[]');
    return Array.isArray(list) ? list.filter((h) => h && typeof h.latex === 'string') : [];
  } catch {
    return [];
  }
}

// Newest first; re-typing a problem moves it to the top instead of duplicating it.
export async function addTypedHistory(latex) {
  const value = String(latex || '').trim();
  if (!value) return getTypedHistory();
  const list = (await getTypedHistory()).filter((h) => h.latex !== value);
  const next = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, latex: value }, ...list].slice(0, MAX_TYPED_HISTORY);
  try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}

export async function clearTypedHistory() {
  try { await AsyncStorage.removeItem(KEY); } catch {}
}
