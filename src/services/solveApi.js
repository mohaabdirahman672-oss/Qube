import { supabase } from '../lib/supabase';

export async function solveMathProblem({ text, imageBase64, imageMimeType }) {
  if (!text && !imageBase64) throw new Error('No input provided.');

  const { data, error } = await supabase.functions.invoke('solve', {
    body: { text, imageBase64, imageMimeType },
  });

  if (error) {
    const message = await extractErrorMessage(error);
    throw new Error(message);
  }

  return data;
}

async function extractErrorMessage(error) {
  const body = await error.context?.json?.().catch(() => null);
  return body?.error || error.message || 'Something went wrong. Please try again.';
}
