import { createClient } from '../vendor/supabase-js/dist/index.js';
import { authLog, authWarn } from './authDebug.js';
import { getRuntimeConfig, hasSupabaseCredentials } from './runtimeConfig.js';

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
  const client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Enable Supabase's URL parsing to catch PKCE fragments without affecting hash routing,
      // because the callback page is a standalone HTML (not a hash route).
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
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
