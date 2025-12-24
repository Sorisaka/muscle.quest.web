import { getRuntimeConfig, hasSupabaseCredentials } from '../../lib/runtimeConfig.js';

export const resolveRuntimeConfig = (overrides = {}) => {
  return getRuntimeConfig(overrides);
};

export const createSupabaseClient = (options = {}) => {
  const config = resolveRuntimeConfig(options.runtimeConfig || {});
  return {
    ready: hasSupabaseCredentials(config),
    config,
    note: 'Supabase client is stubbed for front-end only use. No network calls are made.',
  };
};
