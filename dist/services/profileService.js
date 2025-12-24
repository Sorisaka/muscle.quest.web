import { authLog } from '../lib/authDebug.js';
import { getSupabaseClient } from '../lib/supabaseClient.js';

const PROFILES_COLUMNS = 'id,display_name,points,completed_runs,last_result,created_at,updated_at';

function requireClient() {
  const { client, error } = getSupabaseClient();
  if (!client) {
    return { client: null, error: error ? new Error(error) : new Error('Supabase client unavailable.') };
  }
  return { client, error: null };
}

async function getAccessToken(client) {
  const { data, error } = await client.auth.getSession();
  if (error) return { token: null, error };

  const token = data?.session?.access_token;
  if (!token) return { token: null, error: new Error('No active session found.') };

  return { token, error: null };
}

async function handleRestResponse(response) {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = payload.message;
      }
    } catch (_error) {
      // ignore JSON parsing errors
    }
    return { data: null, error: new Error(message) };
  }

  const json = await response.json();
  if (!Array.isArray(json)) return { data: json, error: null };
  if (json.length === 0) return { data: null, error: null };
  if (json.length > 1) return { data: null, error: new Error('Multiple profiles returned.') };
  return { data: json[0], error: null };
}

function buildHeaders(client, token) {
  return {
    apikey: client.supabaseKey,
    Authorization: `Bearer ${token}`,
  };
}

function selectParam(columns) {
  return encodeURIComponent(columns);
}

export async function fetchProfile(userId) {
  const { client, error } = requireClient();
  if (!client) return { data: null, error };

  const { token, error: sessionError } = await getAccessToken(client);
  if (!token) return { data: null, error: sessionError };

  const query = `id=eq.${encodeURIComponent(userId)}&select=${selectParam(PROFILES_COLUMNS)}`;
  const url = `${client.supabaseUrl}/rest/v1/profiles?${query}`;
  authLog('profiles:fetch url', url.split('?')[0]);

  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(client, token),
  });

  return handleRestResponse(response);
}

export async function upsertProfile(updates) {
  const { client, error } = requireClient();
  if (!client) return { data: null, error };

  const { token, error: sessionError } = await getAccessToken(client);
  if (!token) return { data: null, error: sessionError };

  const url = `${client.supabaseUrl}/rest/v1/profiles?on_conflict=id&select=${selectParam(PROFILES_COLUMNS)}`;
  authLog('profiles:upsert url', url.split('?')[0]);

  const body = JSON.stringify({ id: updates.id, display_name: updates.display_name });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...buildHeaders(client, token),
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body,
  });

  return handleRestResponse(response);
}
