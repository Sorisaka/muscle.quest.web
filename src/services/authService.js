import { getRuntimeConfig } from '../lib/runtimeConfig.js';
import { getSupabaseClient } from '../lib/supabaseClient.js';
import { authError, authLog, authWarn } from '../lib/authDebug.js';

function buildRedirectTo(origin) {
  const base = typeof origin === 'string' ? origin : null;
  if (!base) return null;
  return `${base.replace(/\\/+$/, '')}/auth/callback.html`;
}

function fallbackRedirect(config) {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return buildRedirectTo(window.location.origin);
  }
  if (config.oauthRedirectTo) return buildRedirectTo(config.oauthRedirectTo);
  return null;
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

  const redirectTo = fallbackRedirect(config || getRuntimeConfig());
  if (!redirectTo) {
    const redirectError = new Error('OAuth redirect URL is not available.');
    authError('signIn redirect missing', redirectError.message);
    return { data: null, error: redirectError };
  }
  authLog('signIn redirectTo', redirectTo);

  const result = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
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
    authLog('authorize url', parsed.toString());
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
