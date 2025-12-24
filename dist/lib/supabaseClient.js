import { createClient } from '../vendor/supabase-js/dist/index.js';
import { authLog, authWarn } from './authDebug.js';
import { getRuntimeConfig, hasSupabaseCredentials } from './runtimeConfig.js';

/*
  Auth wiring overview

  - authService.signInWithOAuth builds /auth/v1/authorize with PKCE params (code_verifier + challenge).
  - callback.js expects a ?code=... redirect and exchanges it via /auth/v1/token using PKCE.
  - The embedded Supabase client mirrors the PKCE settings to keep session parsing consistent.
*/

let cachedClient = null;
let cachedConfigSignature = null;

const missingCredentialsMessage = [
  'Supabase credentials were not found.',
  'Add SUPABASE_URL and SUPABASE_ANON_KEY to dist/config.js to enable cloud features.',
].join(' ');

function normalizeUrl(value) {
  if (!value) return value;
  return value.replace(/\/+$/, '');
}

function sanitizeConfig(config) {
  return {
    ...config,
    supabaseUrl: normalizeUrl(config.supabaseUrl),
    oauthRedirectTo: normalizeUrl(config.oauthRedirectTo),
  };
}

function logSupabaseHost(config) {
  if (!config?.supabaseUrl) return;
  try {
    const host = new URL(config.supabaseUrl).host;
    authLog('supabaseUrl host', host);
  } catch (_error) {
    authWarn('supabaseUrl invalid', config.supabaseUrl);
  }
}

function createSignature(config) {
  return `${config.supabaseUrl || ''}::${config.supabaseAnonKey || ''}`;
}

function buildClient(config) {
  const authOptions = {
    persistSession: true,
    autoRefreshToken: true,
    // Enable Supabase's URL parsing to catch PKCE fragments without affecting hash routing,
    // because the callback page is a standalone HTML (not a hash route).
    detectSessionInUrl: true,
    flowType: 'pkce',
  };

  authLog('createClient auth options', authOptions);

  const client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: authOptions,
  });

  cachedClient = { client, config, ready: true, error: null };
  cachedConfigSignature = createSignature(config);
  return cachedClient;
}

export function getSupabaseClient(options = {}) {
  const runtimeConfig = sanitizeConfig(getRuntimeConfig(options.runtimeConfig || {}));

  if (!hasSupabaseCredentials(runtimeConfig)) {
    return {
      client: null,
      ready: false,
      config: runtimeConfig,
      error: missingCredentialsMessage,
    };
  }

  logSupabaseHost(runtimeConfig);

  const signature = createSignature(runtimeConfig);
  if (cachedClient && signature === cachedConfigSignature) {
    return cachedClient;
  }

  return buildClient(runtimeConfig);
}
