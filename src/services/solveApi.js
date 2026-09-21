import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/freeSolves';

const REQUEST_TIMEOUT_MS = 45000;

export async function solveMathProblem({ text, imageBase64, imageMimeType }) {
  if (!text && !imageBase64) throw new Error('No input provided.');

  console.log('[solveApi] invoking solve function', {
    hasText: !!text,
    hasImage: !!imageBase64,
    imageBytes: imageBase64?.length ?? 0,
  });

  // Sent for every call, but only consulted server-side for unauthenticated callers —
  // it's an abuse backstop, not the real free-solve limit (that's enforced client-side).
  const deviceId = await getDeviceId();

  let data, error;
  try {
    ({ data, error } = await supabase.functions.invoke('solve', {
      body: { text, imageBase64, imageMimeType, deviceId },
      timeout: REQUEST_TIMEOUT_MS,
    }));
  } catch (e) {
    console.log('[solveApi] invoke threw synchronously', e);
    throw new Error(e?.message || 'Something went wrong. Please try again.');
  }

  if (error) {
    console.log('[solveApi] invoke returned an error', error, error?.name, error?.context?.status);
    if (error.name === 'AbortError') {
      throw new Error('This is taking longer than expected. Please check your connection and try again.');
    }
    const message = await extractErrorMessage(error);
    throw new Error(message);
  }

  console.log('[solveApi] invoke succeeded', { hasMath: data?.hasMath });
  return data;
}

async function extractErrorMessage(error) {
  const body = await error.context?.json?.().catch(() => null);
  return body?.error || error.message || 'Something went wrong. Please try again.';
}
