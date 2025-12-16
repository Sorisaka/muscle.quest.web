import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';

const authOptions = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
};

export const createSupabase = (url = SUPABASE_URL, key = SUPABASE_ANON_KEY, options = {}) => {
  const { auth, ...clientOptions } = options;
  return createClient(url, key, {
    ...clientOptions,
    auth: { ...authOptions, ...auth },
  });
};

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createSupabase() : null;

export const isSupabaseConfigured = Boolean(supabase);
