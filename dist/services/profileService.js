import { getSupabaseClient } from '../lib/supabaseClient.js';

function requireClient() {
  const { client, error } = getSupabaseClient();
  if (!client) {
    return { client: null, error: error ? new Error(error) : new Error('Supabase client unavailable.') };
  }
  return { client, error: null };
}

export async function fetchProfile(userId) {
  const { client, error } = requireClient();
  if (!client) return { data: null, error };

  return client.from('profiles').select('id, display_name, created_at, updated_at').eq('id', userId).maybeSingle();
}

export async function upsertProfile(updates) {
  const { client, error } = requireClient();
  if (!client) return { data: null, error };

  return client.from('profiles').upsert(updates).select('id, display_name, created_at, updated_at').maybeSingle();
}
