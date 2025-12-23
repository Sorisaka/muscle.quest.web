import { getSupabaseClient } from './supabaseClient.js';
import { authError, authLog } from './authDebug.js';

const AUTH_KEYS = ['code', 'state', 'error', 'error_description'];

function parseAuthParams(search, hash) {
  const params = new URLSearchParams(search || '');
  const hadCodeInSearch = params.has('code');

  const fragment = (hash || '').replace(/^#/, '');
  let cleanHash = fragment;

  if (fragment) {
    const hasQueryMarker = fragment.includes('?');
    const hasQueryPairs = fragment.includes('=');
    const fragmentPath = hasQueryMarker ? fragment.split('?')[0] : hasQueryPairs ? '' : fragment;
    const fragmentQuery = hasQueryMarker ? fragment.slice(fragment.indexOf('?') + 1) : hasQueryPairs ? fragment : '';

    if (fragmentQuery) {
      const hashParams = new URLSearchParams(fragmentQuery);
      AUTH_KEYS.forEach((key) => {
        if (!params.has(key) && hashParams.has(key)) {
          params.set(key, hashParams.get(key));
        }
      });

      AUTH_KEYS.forEach((key) => hashParams.delete(key));
      const remainingHashQuery = hashParams.toString();
      cleanHash = remainingHashQuery ? `${fragmentPath}?${remainingHashQuery}` : fragmentPath;
    } else {
      cleanHash = fragmentPath;
    }
  }

  const codeFromHash = !hadCodeInSearch && params.has('code');

  return { params, codeFromHash, cleanHash };
}

function cleanAuthFromUrl(cleanHash) {
  try {
    const url = new URL(window.location.href);
    AUTH_KEYS.forEach((key) => url.searchParams.delete(key));
    url.hash = cleanHash ? `#${cleanHash}` : '';
    history.replaceState(null, '', url.toString());
  } catch (error) {
    authError('oauthReturn clean failed', error?.message || error);
  }
}

export async function handleOAuthReturn() {
  if (typeof window === 'undefined') return;

  const { client, ready, error } = getSupabaseClient();
  if (!client || !ready) {
    authLog('oauthReturn client not ready', error || 'client unavailable');
    return;
  }

  const { params, codeFromHash, cleanHash } = parseAuthParams(
    window.location.search,
    window.location.hash,
  );
  const code = params.get('code');
  const state = params.get('state');
  const oauthError = params.get('error');
  const oauthErrorDescription = params.get('error_description');
  const hasCode = Boolean(code);

  const initialSessionResult = await client.auth.getSession();
  const hasInitialSession = Boolean(initialSessionResult?.data?.session);

  authLog('oauthReturn parsed', { hasCode, codeFromHash, hasInitialSession });

  if (!hasCode) {
    if (oauthError) {
      authError('oauthReturn oauth error', oauthErrorDescription || oauthError);
      cleanAuthFromUrl(cleanHash);
    }
    return;
  }

  if (hasInitialSession) {
    cleanAuthFromUrl(cleanHash);
    return;
  }

  const exchangeUrl = (() => {
    const url = new URL(window.location.href);
    AUTH_KEYS.forEach((key) => url.searchParams.delete(key));
    url.hash = '';
    url.searchParams.set('code', code);
    if (state) url.searchParams.set('state', state);
    return url.toString();
  })();

  try {
    const exchangeResult = await client.auth.exchangeCodeForSession(exchangeUrl);
    const exchangeError = exchangeResult?.error || null;
    if (exchangeError) {
      authError('oauthReturn exchange error', exchangeError?.message || exchangeError);
    } else {
      authLog('oauthReturn exchange success', exchangeUrl);
    }
  } catch (caught) {
    authError('oauthReturn exchange threw', caught?.message || caught);
  } finally {
    cleanAuthFromUrl(cleanHash);
  }
}
