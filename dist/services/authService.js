import { supabase } from '../lib/supabaseClient.js';

export const DEFAULT_OAUTH_PROVIDER = 'github';
export const OAUTH_REDIRECT_TO = '';

const missingClientError = () =>
  new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in src/lib/supabaseClient.js.');

const getClient = () => {
  if (!supabase) {
    console.warn(
      'Supabase auth is unavailable until SUPABASE_URL and SUPABASE_ANON_KEY are populated in src/lib/supabaseClient.js.'
    );
    return null;
  }
  return supabase;
};

export const getSession = async () => {
  const client = getClient();
  if (!client) {
    return { data: { session: null }, error: missingClientError() };
  }
  return client.auth.getSession();
};

export const onAuthStateChange = (callback) => {
  const client = getClient();
  if (!client) {
    return () => {};
  }
  const { data } = client.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
};

const resolveRedirectTo = (manualRedirectTo) => {
  if (manualRedirectTo) return manualRedirectTo;

  // Fallback: derive callback path from the current location (e.g. GitHub Pages /auth/callback)
  // Supabase Dashboard Redirect URLs should include this resolved URL.
  if (typeof window !== 'undefined') {
    const { origin, pathname } = window.location;
    const basePath = pathname.endsWith('/') ? pathname : pathname.replace(/[^/]*$/, '/');
    return `${origin}${basePath}auth/callback`;
  }

  return '';
};

export const signInWithOAuth = async (provider = DEFAULT_OAUTH_PROVIDER, redirectTo = OAUTH_REDIRECT_TO) => {
  const client = getClient();
  if (!client) {
    return { data: null, error: missingClientError() };
  }
  return client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: resolveRedirectTo(redirectTo),
    },
  });
};

export const signOut = async () => {
  const client = getClient();
  if (!client) {
    return { error: missingClientError() };
  }
  return client.auth.signOut();
};
