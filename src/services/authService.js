import { supabase } from '../lib/supabase';

export function signUpWithEmail(email, password) {
  return supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'qube://' } });
}

export function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signOutUser() {
  return supabase.auth.signOut();
}

export function sendPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: 'qube://reset-password' });
}

export function updatePassword(password) {
  return supabase.auth.updateUser({ password });
}

export function getSession() {
  return supabase.auth.getSession();
}
