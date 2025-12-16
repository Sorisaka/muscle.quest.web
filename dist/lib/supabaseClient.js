import { createClient } from '@supabase/supabase-js';
import { getRuntimeConfig, hasSupabaseCredentials } from './runtimeConfig.js';

let cachedClient = null;
let cachedConfigSignature = null;

const missingCredentialsMessage = [
  'Supabase credentials were not found.',
  'Add SUPABASE_URL and SUPABASE_ANON_KEY to dist/config.js to enable cloud features.',
].join(' ');

function createSignature(config) {
  return `${config.supabaseUrl || ''}::${config.supabaseAnonKey || ''}`;
}

function buildClient(config) {
  const client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      options: {
        redirectTo: config.oauthRedirectTo,
      },
    },
  });

  cachedClient = { client, config, ready: true, error: null };
  cachedConfigSignature = createSignature(config);
  return cachedClient;
}

export function getSupabaseClient(options = {}) {
  const runtimeConfig = getRuntimeConfig(options.runtimeConfig || {});

  if (!hasSupabaseCredentials(runtimeConfig)) {
    return {
      client: null,
      ready: false,
      config: runtimeConfig,
      error: missingCredentialsMessage,
    };
  }

  const signature = createSignature(runtimeConfig);
  if (cachedClient && signature === cachedConfigSignature) {
    return cachedClient;
  }

  return buildClient(runtimeConfig);
}
