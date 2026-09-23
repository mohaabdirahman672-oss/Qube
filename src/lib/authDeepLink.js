// Supabase's auth redirect links carry tokens after a `#` fragment, e.g.
// qube://reset-password#access_token=...&refresh_token=...&type=recovery
// Native URL parsers only handle the `?query` part, so this is parsed by hand.
//
// An expired/already-used link comes back the same way but with an error instead,
// e.g. qube://reset-password#error=access_denied&error_code=otp_expired&error_description=...
// — returned here as { error } rather than null, so the caller can tell "not an
// auth link at all" apart from "was an auth link, but it failed" and show the user
// something instead of silently doing nothing (see AuthContext.js's handleUrl).
export function parseAuthDeepLink(url) {
  if (!url) return null;

  const fragmentIndex = url.indexOf('#');
  const queryIndex    = url.indexOf('?');
  const paramsStart   = fragmentIndex !== -1 ? fragmentIndex : queryIndex;
  if (paramsStart === -1) return null;

  const params = new URLSearchParams(url.slice(paramsStart + 1));

  const errorCode = params.get('error_code') || params.get('error');
  if (errorCode) {
    return { error: errorCode, errorDescription: params.get('error_description')?.replace(/\+/g, ' ') };
  }

  const access_token  = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return null;

  return { access_token, refresh_token, type: params.get('type') };
}
