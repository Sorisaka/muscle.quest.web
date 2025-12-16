const CONFIG_GLOBAL = '__APP_CONFIG__';

const DEFAULT_CONFIG = {
  supabaseUrl: undefined,
  supabaseAnonKey: undefined,
  oauthRedirectTo: undefined,
  profileDisplayName: 'Guest',
};

const missingMessage = [
  'Runtime configuration was not found on window.__APP_CONFIG__.',
  'Create dist/config.js from dist/config.example.js for local development',
  'or allow CI to inject secrets into dist/config.js before publishing.',
].join(' ');

function normalizeConfig(rawConfig = {}) {
  return {
    ...DEFAULT_CONFIG,
    supabaseUrl: rawConfig.SUPABASE_URL ?? DEFAULT_CONFIG.supabaseUrl,
    supabaseAnonKey: rawConfig.SUPABASE_ANON_KEY ?? DEFAULT_CONFIG.supabaseAnonKey,
    oauthRedirectTo: rawConfig.OAUTH_REDIRECT_TO ?? DEFAULT_CONFIG.oauthRedirectTo,
    profileDisplayName: rawConfig.PROFILE_DISPLAY_NAME ?? DEFAULT_CONFIG.profileDisplayName,
  };
}

function readWindowConfig() {
  if (typeof window === 'undefined') return undefined;
  return window[CONFIG_GLOBAL];
}

export function readRuntimeConfig() {
  const rawConfig = readWindowConfig();

  if (!rawConfig || typeof rawConfig !== 'object') {
    console.warn(missingMessage);
    return { ...DEFAULT_CONFIG };
  }

  return normalizeConfig(rawConfig);
}

export function getRuntimeConfig(overrides = {}) {
  return { ...readRuntimeConfig(), ...overrides };
}

export function hasSupabaseCredentials(config = readRuntimeConfig()) {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}
