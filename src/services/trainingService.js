import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const missingClientError = () =>
  new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in src/lib/supabaseClient.js.');

const requireSession = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return { session: null, error: missingClientError() };
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return { session: null, error };
  }
  const session = data?.session;
  if (!session?.user?.id) {
    return { session: null, error: new Error('サインインが必要です。') };
  }
  return { session, error: null };
};

export const insertWorkoutEvent = async ({ event_type, points, occurred_at, metadata } = {}) => {
  const { session, error } = await requireSession();
  if (!session) {
    return { data: null, error };
  }

  const payload = {
    user_id: session.user.id,
    event_type: event_type || 'test_insert',
    points: typeof points === 'number' ? points : 1,
    occurred_at: occurred_at || new Date().toISOString(),
    metadata: metadata ?? null,
  };

  return supabase
    .from('workout_events')
    .insert(payload)
    .select('id, user_id, event_type, points, occurred_at, metadata')
    .maybeSingle();
};

export const getPointSum = async ({ since, until } = {}) => {
  const { session, error } = await requireSession();
  if (!session) {
    return { data: null, error };
  }

  let query = supabase
    .from('workout_events')
    .select('points, occurred_at')
    .eq('user_id', session.user.id);

  if (since) {
    query = query.gte('occurred_at', since);
  }
  if (until) {
    query = query.lte('occurred_at', until);
  }

  const { data, error: fetchError } = await query;
  if (fetchError) {
    return { data: null, error: fetchError };
  }

  const sum = (data || []).reduce((total, row) => total + (row.points || 0), 0);
  return { data: { sum, events: data || [] }, error: null };
};

export const getRanking = async ({ window = 'day' } = {}) => {
  const { session, error } = await requireSession();
  if (!session) {
    return { data: null, error };
  }

  // TODO: Implement ranking aggregation once a stable table/view exists.
  // Suggested approach: maintain a materialized view that groups workout_events by date_trunc(window, occurred_at)
  // and sums points per user_id, then order by points desc. For now, return an empty list to keep the API stable.
  return { data: [], error: null, note: `Ranking for window="${window}" is not implemented yet.` };
};
