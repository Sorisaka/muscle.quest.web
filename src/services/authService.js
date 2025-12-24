import { getRuntimeConfig } from '../lib/runtimeConfig.js';
import { getSupabaseClient } from '../lib/supabaseClient.js';
import { buildCallbackUrl, inferBasePath } from '../lib/basePath.js';
import { authError, authLog, authWarn, sanitizeUrlForLog } from '../lib/authDebug.js';

/*
  OAuth flow overview (expected PKCE vs implicit fallback)

  - Expected PKCE
    1) signInWithOAuth() builds /auth/v1/authorize with a code_challenge.
    2) Provider redirects to /auth/callback.html?code=...&state=...
    3) callback.js exchanges the code via /auth/v1/token (grant_type=pkce) and persists the session.

  - Current implicit fallback (what we are observing)
    1) signInWithOAuth() builds /auth/v1/authorize without PKCE parameters.
    2) Supabase redirects to /auth/v1/callback#access_token=...&refresh_token=...
    3) callback.js cannot exchange a code, session stays null, and /auth/v1/token is never called.
*/

function normalizeCallbackUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location?.origin : undefined);
    parsed.pathname = parsed.pathname.replace(/\/auth\/callback\/?$/, '/auth/callback.html');
    return parsed.toString();
  } catch (_error) {
    if (typeof url === 'string' && url.includes('/auth/callback')) {
      return url.replace(/\/auth\/callback\/?$/, '/auth/callback.html');
    }
    return null;
  }
}

function buildRedirectTo(config) {
  const normalizedConfigRedirect = normalizeCallbackUrl(config?.oauthRedirectTo);
  if (normalizedConfigRedirect) return normalizedConfigRedirect;

  if (typeof window !== 'undefined' && window.location?.origin) {
    const basePath = inferBasePath(window.location.pathname || '/');
    return buildCallbackUrl(basePath, window.location.origin);
  }

  return null;
}

function resolveRedirect(config) {
  const mergedConfig = { ...getRuntimeConfig(), ...(config || {}) };
  return buildRedirectTo(mergedConfig);
}

function requireClient() {
  const { client, ready, error, config } = getSupabaseClient();

  if (!ready || !client) {
    const message = error || 'Supabase client is not ready.';
    return { client: null, error: new Error(message), config };
  }

  return { client, error: null, config };
}

export async function getSession() {
  const { client, error } = requireClient();
  if (!client) return { data: { session: null }, error };
  const result = await client.auth.getSession();
  authLog('getSession', result?.data?.session ? 'session present' : 'no session');
  return result;
}

export function onAuthStateChange(callback) {
  const { client, error } = requireClient();
  if (!client) {
    callback('CONFIG_ERROR', null, error);
    return () => {};
  }

  return client.auth.onAuthStateChange((event, session) => {
    authLog('auth state change', event);
    callback(event, session, null);
  });
}

export async function signInWithOAuth(provider) {
  const { client, error, config } = requireClient();
  if (!client) return { data: null, error };

  const redirectTo = resolveRedirect(config);
  if (!redirectTo) {
    const redirectError = new Error('OAuth redirect URL is not available.');
    authError('signIn redirect missing', redirectError.message);
    return { data: null, error: redirectError };
  }
  authLog('signIn redirectTo', redirectTo);

  const result = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true, flowType: 'pkce' },
  });

  if (result?.error) {
    authError('signInWithOAuth error', result.error?.message || result.error);
    return result;
  }

  const authorizeUrl = result?.data?.url;
  if (!authorizeUrl) {
    const missingUrlError = new Error('Authorize URL was not returned from Supabase.');
    authError('missing authorize url', missingUrlError.message);
    return { data: null, error: missingUrlError };
  }

  try {
    const parsed = new URL(authorizeUrl);
    const authorizeLog = {
      origin: sanitizeUrlForLog(parsed.toString()),
      queryKeys: Array.from(parsed.searchParams.keys()),
      hasPkceParams:
        parsed.searchParams.has('code_challenge') || parsed.searchParams.has('code_challenge_method'),
      responseType: parsed.searchParams.get('response_type') || 'default',
    };
    authLog('authorize url', authorizeLog);
    if (!parsed.pathname.includes('/auth/v1/authorize')) {
      const badUrlError = new Error('Unexpected authorize URL returned.');
      authWarn('authorize pathname', parsed.pathname);
      return { data: null, error: badUrlError };
    }
  } catch (parseError) {
    authError('authorize url parse failed', parseError);
    return { data: null, error: parseError };
  }

  if (typeof window !== 'undefined') {
    window.location.assign(authorizeUrl);
  }

  return result;
}

export async function signOut() {
  const { client, error } = requireClient();
  if (!client) return { error };
  return client.auth.signOut();
}
