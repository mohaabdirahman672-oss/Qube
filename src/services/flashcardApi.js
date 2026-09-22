import { supabase } from '../lib/supabase';

// Fetches (and server-side caches) a worked example with substituted numbers for a
// flashcard's formula — Premium-only, see supabase/functions/flashcard-example and
// docs/plans/freemium-paywall-v2.md decision 5. Only ever called for a Premium user
// (gated client-side by LockedPreview before this runs, and re-checked server-side).
export async function getWorkedExample({ front, back, tag }) {
  const { data, error } = await supabase.functions.invoke('flashcard-example', {
    body: { front, back, tag },
  });
  if (error) {
    const body = await error.context?.json?.().catch(() => null);
    throw new Error(body?.error || error.message || 'Could not load worked example.');
  }
  return data.workedExample;
}
