import { getRuntimeConfig } from '../lib/runtimeConfig.js';
import { getSupabaseClient } from '../lib/supabaseClient.js';
import { buildCallbackUrl, inferBasePath } from '../lib/basePath.js';
import { authError, authLog, authWarn } from '../lib/authDebug.js';

function normalizeCallbackUrl(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location?.origin : undefined);
    if (parsed.pathname.endsWith('/auth/callback/')) {
      parsed.pathname = parsed.pathname.replace(/\/auth\/callback\/$/, '/auth/callback.html');
    } else if (parsed.pathname.endsWith('/auth/callback')) {
      parsed.pathname = `${parsed.pathname}.html`;
    }
    return parsed.toString();
  } catch (error) {
    if (typeof url === 'string' && url.endsWith('/auth/callback/')) {
      return url.replace(/\/auth\/callback\/$/, '/auth/callback.html');
    }
    return url;
  }
}

function fallbackRedirect(config) {
  if (config.oauthRedirectTo) return normalizeCallbackUrl(config.oauthRedirectTo);

  if (typeof window === 'undefined' || !window.location) return undefined;

  const basePath = inferBasePath(window.location.pathname || '/');
  return buildCallbackUrl(basePath, window.location.origin);
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
