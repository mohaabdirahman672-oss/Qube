import { supabase } from '../lib/supabase';

// ── Saved problems ────────────────────────────────────────────────────────────

export async function fetchSavedProblems() {
  const { data, error } = await supabase
    .from('saved_problems')
    .select('*')
    .order('saved_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function insertSavedProblem({ userId, type, title, problemType, difficulty, steps, answer, explanation }) {
  const { data, error } = await supabase
    .from('saved_problems')
    .insert({
      user_id:      userId,
      type,
      title,
      problem_type: problemType,
      difficulty,
      steps,
      answer,
      explanation,
    })
    .select()
    .single();
  return { data, error };
}

export async function deleteSavedProblem(id) {
  const { error } = await supabase
    .from('saved_problems')
    .delete()
    .eq('id', id);
  return { error };
}

export async function clearSavedProblems(userId) {
  const { error } = await supabase
    .from('saved_problems')
    .delete()
    .eq('user_id', userId);
  return { error };
}

// ── Custom flashcards ─────────────────────────────────────────────────────────

export async function fetchCustomCards() {
  const { data, error } = await supabase
    .from('custom_flashcards')
    .select('*')
    .order('created_at', { ascending: true });
  return { data: data ?? [], error };
}

export async function insertCustomCard({ userId, front, back, category, tag }) {
  const { data, error } = await supabase
    .from('custom_flashcards')
    .insert({ user_id: userId, front, back, category, tag })
    .select()
    .single();
  return { data, error };
}

export async function deleteCustomCard(id) {
  const { error } = await supabase
    .from('custom_flashcards')
    .delete()
    .eq('id', id);
  return { error };
}
