import { getRuntimeConfig } from '../lib/runtimeConfig.js';
import { getSupabaseClient } from '../lib/supabaseClient.js';
import { buildCallbackUrl, inferBasePath } from '../lib/basePath.js';

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
  return client.auth.getSession();
}

export function onAuthStateChange(callback) {
  const { client, error } = requireClient();
  if (!client) {
    callback('CONFIG_ERROR', null, error);
    return () => {};
  }

  return client.auth.onAuthStateChange((event, session) => callback(event, session, null));
}

export async function signInWithOAuth(provider) {
  const { client, error, config } = requireClient();
  if (!client) return { data: null, error };

  const redirectTo = fallbackRedirect(config || getRuntimeConfig());
  return client.auth.signInWithOAuth({ provider, options: { redirectTo } });
}

export async function signOut() {
  const { client, error } = requireClient();
  if (!client) return { error };
  return client.auth.signOut();
}
