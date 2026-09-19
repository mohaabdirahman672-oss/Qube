// Supabase's auth redirect links carry tokens after a `#` fragment, e.g.
// qube://reset-password#access_token=...&refresh_token=...&type=recovery
// Native URL parsers only handle the `?query` part, so this is parsed by hand.
export function parseAuthDeepLink(url) {
  if (!url) return null;

  const fragmentIndex = url.indexOf('#');
  const queryIndex    = url.indexOf('?');
  const paramsStart   = fragmentIndex !== -1 ? fragmentIndex : queryIndex;
  if (paramsStart === -1) return null;

  const params = new URLSearchParams(url.slice(paramsStart + 1));
  const access_token  = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return null;

  return { access_token, refresh_token, type: params.get('type') };
}
