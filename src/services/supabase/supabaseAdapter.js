import { createLocalPersistence } from '../../data/adapters/localPersistence.js';
import { getRuntimeConfig, hasSupabaseCredentials } from '../../lib/runtimeConfig.js';
import { authWarn } from '../../lib/authDebug.js';
import { getSupabaseClient } from '../../lib/supabaseClient.js';
import { getSession, onAuthStateChange } from '../authService.js';

const PROFILE_COLUMNS = 'id,display_name,points,completed_runs,last_result,updated_at';
const HISTORY_LIMIT = 100;
const MIGRATION_FLAG_PREFIX = 'musclequest:migration:';

const isPromise = (value) => value && typeof value.then === 'function';

const mapHistoryRow = (row) => {
  const result = row?.result || {};
  const createdAt = row?.created_at ? new Date(row.created_at).getTime() : Date.now();
  return {
    questId: result.questId || result.quest_id || null,
    exerciseSlug: result.exerciseSlug || result.exercise_slug || null,
    points: row?.points ?? result.points ?? 0,
    mode: result.mode || null,
    difficulty: result.difficulty || null,
    sets: result.sets || null,
    startTime: result.startTime || result.start_time || null,
    endTime: result.endTime || result.end_time || null,
    timestamp: createdAt,
  };
};

export const createSupabaseAdapter = (options = {}) => {
  const local = createLocalPersistence();
  const runtimeConfig = getRuntimeConfig(options.runtimeConfig || {});
  const { client, ready, config } = getSupabaseClient(options);
  const supabaseEnabled = ready && hasSupabaseCredentials(config) && !!client;

  let session = null;
  let profile = local.loadProfile();
  let history = local.loadHistory();
  const legacyHistory = Array.isArray(history) ? history.slice() : [];
  const subscribers = new Set();
  let authUnsubscribe = null;

  const notify = () => {
    subscribers.forEach((callback) => callback({ profile, history }));
  };

  const subscribe = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };

  const defaultName = () => runtimeConfig.profileDisplayName || 'Guest';

  const mapProfileRow = (row) => ({
    id: row?.id || session?.user?.id || profile?.id || 'supabase-user',
    displayName: row?.display_name || session?.user?.email || defaultName(),
    points: row?.points ?? 0,
    completedRuns: row?.completed_runs ?? 0,
    lastResult: row?.last_result || null,
    updatedAt: row?.updated_at || null,
  });

  const setProfile = (nextProfile) => {
    profile = local.replaceProfile(mapProfileRow(nextProfile));
    notify();
    return profile;
  };

  const setHistory = (entries) => {
    history = local.replaceHistory(entries || []);
    notify();
    return history;
  };

  const refreshHistoryFromSupabase = async () => {
    if (!client || !session?.user?.id) return history;
    const { data, error } = await client
      .from('workout_runs')
      .select('id,created_at,points,result')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT);

    if (error) {
      authWarn('workout_runs fetch failed', error.message || error);
      return history;
    }

    const mapped = (data || []).map(mapHistoryRow).slice(0, HISTORY_LIMIT);
    return setHistory(mapped);
  };

  const refreshProfileFromSupabase = async () => {
    if (!client || !session?.user?.id) return profile;
    const { data, error } = await client
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      authWarn('profiles fetch failed', error.message || error);
      return profile;
    }

    if (!data) return profile;
    return setProfile(data);
  };

  const getMigrationFlagKey = (userId) => `${MIGRATION_FLAG_PREFIX}${userId}`;

  const hasMigrationFlag = (userId) => {
    if (!userId) return true;
    try {
      return localStorage.getItem(getMigrationFlagKey(userId)) === '1';
    } catch (error) {
      authWarn('migration flag read failed', error.message || error);
      return true;
    }
  };

  const markMigrationComplete = (userId) => {
    if (!userId) return;
    try {
      localStorage.setItem(getMigrationFlagKey(userId), '1');
    } catch (error) {
      authWarn('migration flag write failed', error.message || error);
    }
  };

  const addResultWithFallback = async (payload) => {
    if (!client || !session?.user?.id) return null;

    const tryRpc = async () => {
      const { data, error } = await client.rpc('add_workout_result', {
        p_points: payload.points,
        p_result: payload,
      });

      if (error) throw error;
      return data ? mapProfileRow(data) : null;
    };

    const fallbackInsertAndUpdate = async () => {
      const insertResult = await client
        .from('workout_runs')
        .insert({ user_id: session.user.id, points: payload.points, result: payload })
        .select('id')
        .maybeSingle();

      if (insertResult.error) throw insertResult.error;

      const { data: currentProfile, error: profileError } = await client
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const nextProfile = {
        points: (currentProfile?.points || 0) + payload.points,
        completed_runs: (currentProfile?.completed_runs || 0) + 1,
        last_result: payload,
      };

      const { data: updatedProfile, error: updateError } = await client
        .from('profiles')
        .update(nextProfile)
        .eq('id', session.user.id)
        .select(PROFILE_COLUMNS)
        .maybeSingle();

      if (updateError) throw updateError;
      return updatedProfile ? mapProfileRow(updatedProfile) : null;
    };

    try {
      const rpcProfile = await tryRpc();
      if (rpcProfile) return rpcProfile;
    } catch (error) {
      authWarn('add_workout_result failed', error.message || error);
    }

    try {
      return await fallbackInsertAndUpdate();
    } catch (error) {
      authWarn('workout_runs fallback failed', error.message || error);
      return null;
    }
  };

  const maybeMigrateLocalData = async () => {
    if (!session?.user?.id || !supabaseEnabled) return;
    if (hasMigrationFlag(session.user.id)) return;

    const localHistory = Array.isArray(legacyHistory) ? legacyHistory.slice() : [];
    if (!localHistory.length) {
      markMigrationComplete(session.user.id);
      return;
    }

    if (Array.isArray(history) && history.length > 0) {
      markMigrationComplete(session.user.id);
      return;
    }

    for (const entry of localHistory.slice().reverse()) {
      const migratedPayload = {
        questId: entry.questId,
        exerciseSlug: entry.exerciseSlug,
        points: entry.points,
        mode: entry.mode,
        difficulty: entry.difficulty,
        sets: entry.sets,
        startTime: entry.startTime,
        endTime: entry.endTime || entry.timestamp,
        timestamp: entry.timestamp,
        migratedFromLocal: true,
      };

      const profileResult = await addResultWithFallback(migratedPayload);
      if (!profileResult) {
        authWarn('local migration aborted after failure', entry.questId || 'unknown');
        return;
      }
      setProfile(profileResult);
    }

    await refreshHistoryFromSupabase();
    markMigrationComplete(session.user.id);
  };

  const refreshFromSupabase = async () => {
    const { data, error } = await getSession();
    if (error || !data?.session) return;
    session = data.session;
    await Promise.all([refreshProfileFromSupabase(), refreshHistoryFromSupabase()]);
    await maybeMigrateLocalData();
  };

  if (supabaseEnabled) {
    refreshFromSupabase();
    authUnsubscribe = onAuthStateChange((event, nextSession, error) => {
      if (error) {
        authWarn('auth state change error', error.message || error);
        return;
      }
      if (event === 'SIGNED_OUT') {
        session = null;
        setProfile(local.loadProfile());
        setHistory(local.loadHistory());
        return;
      }
      if (nextSession?.user) {
        session = nextSession;
        refreshFromSupabase();
      }
    });
  }

  const loadProfile = () => {
    if (supabaseEnabled && !isPromise(profile)) refreshFromSupabase();
    return profile;
  };

  const saveProfile = (nextProfile) => setProfile(nextProfile || profile);

  const updateDisplayName = (name) => {
    const nextName = name || defaultName();
    if (!supabaseEnabled || !session?.user?.id) {
      return setProfile(local.updateDisplayName(nextName));
    }

    const updatePromise = client
      .from('profiles')
      .update({ display_name: nextName })
      .eq('id', session.user.id)
      .select(PROFILE_COLUMNS)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          authWarn('profiles update failed', error.message || error);
          return setProfile({ ...profile, displayName: nextName });
        }
        if (!data) return setProfile({ ...profile, displayName: nextName });
        return setProfile(data);
      });

    return updatePromise;
  };

  const loadHistory = () => {
    if (supabaseEnabled && !isPromise(history)) refreshHistoryFromSupabase();
    return history;
  };

  const persistResultLocally = (result) => {
    const localProfile = local.recordResult(result);
    setProfile({ ...localProfile, id: session?.user?.id || localProfile.id });
    setHistory(local.loadHistory());
    return profile;
  };

  const recordResult = (result) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return persistResultLocally(result);
    }

    const payload = { ...result, timestamp: result.endTime || Date.now() };
    const syncPromise = addResultWithFallback(payload)
      .then(async (nextProfile) => {
        if (nextProfile) {
          setProfile(nextProfile);
          await refreshHistoryFromSupabase();
          return profile;
        }
        return persistResultLocally(payload);
      })
      .catch((error) => {
        authWarn('recordResult fallback to local', error.message || error);
        return persistResultLocally(payload);
      });

    return syncPromise;
  };

  const loadLeaderboard = (period = 'overall') => local.loadLeaderboard(period);

  const saveLastPlan = (questId, difficulty, plan) => local.saveLastPlan(questId, difficulty, plan);
  const getLastPlan = (questId, difficulty) => local.getLastPlan(questId, difficulty);

  const destroy = () => authUnsubscribe && authUnsubscribe();

  return {
    client,
    ready: supabaseEnabled,
    error: ready ? null : 'Supabase not configured',
    loadProfile,
    saveProfile,
    recordResult,
    updateDisplayName,
    loadLeaderboard,
    loadHistory,
    saveLastPlan,
    getLastPlan,
    subscribe,
    destroy,
  };
};
