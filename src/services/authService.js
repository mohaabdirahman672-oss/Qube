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

// Server-side deletion (supabase/functions/delete-account). The access token is
// attached automatically; the uid is resolved from it on the server.
export function deleteAccountRemote({ appleAuthorizationCode } = {}) {
  return supabase.functions.invoke('delete-account', {
    body: appleAuthorizationCode ? { appleAuthorizationCode } : {},
  });
}

export function getSession() {
  return supabase.auth.getSession();
}
