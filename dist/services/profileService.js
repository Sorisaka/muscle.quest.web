import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const missingClientError = () =>
  new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in src/lib/supabaseClient.js.');

const requireClient = () => {
  if (!isSupabaseConfigured || !supabase) {
    return { error: missingClientError() };
  }
  return { client: supabase };
};

export const fetchProfileByUserId = async (userId) => {
  const { client, error } = requireClient();
  if (!client) {
    return { data: null, error };
  }
  return client
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('id', userId)
    .maybeSingle();
};

export const updateProfileDisplayName = async (userId, displayName) => {
  const { client, error } = requireClient();
  if (!client) {
    return { data: null, error };
  }

  return client
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', userId)
    .select('id, display_name, created_at')
    .maybeSingle();
};
