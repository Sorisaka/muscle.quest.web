import { runtimeConfig as exampleRuntimeConfig } from '../../config/runtime.example.js';

const loadRuntimeOverrides = () => {
  if (typeof globalThis !== 'undefined' && globalThis.RUNTIME_CONFIG) {
    return globalThis.RUNTIME_CONFIG;
  }
  return {};
};

export const resolveRuntimeConfig = (overrides = {}) => {
  const runtimeOverrides = loadRuntimeOverrides();
  return { ...exampleRuntimeConfig, ...runtimeOverrides, ...overrides };
};

export const createSupabaseClient = (options = {}) => {
  const config = resolveRuntimeConfig(options.runtimeConfig || {});
  return {
    ready: Boolean(config.supabaseUrl && config.supabaseAnonKey),
    config,
    note: 'Supabase client is stubbed for front-end only use. No network calls are made.',
  };
};
