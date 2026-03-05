import { createLocalPersistence } from '../../data/adapters/localPersistence.js';
import { getRuntimeConfig, hasSupabaseCredentials } from '../../lib/runtimeConfig.js';
import { authWarn } from '../../lib/authDebug.js';
import { getSupabaseClient } from '../../lib/supabaseClient.js';
import { getSession, onAuthStateChange } from '../authService.js';
import { normalizeAccountVisibility, normalizePostVisibility, resolvePostVisibility } from '../../core/visibility.js';

const PROFILE_COLUMNS = 'id,display_name,account_visibility,default_visibility,points,total_calories,completed_runs,last_result,height_cm,weight_kg,sex,step_length_m,arm_length_m,leg_length_m,torso_length_m,step_length_m_mode,arm_length_m_mode,leg_length_m_mode,torso_length_m_mode,updated_at';
const HISTORY_LIMIT = 100;
const MIGRATION_FLAG_PREFIX = 'musclequest:migration:';

const isPromise = (value) => value && typeof value.then === 'function';

const mapHistoryRow = (row) => {
  const result = row?.result || {};
  const createdAt = row?.created_at ? new Date(row.created_at).getTime() : Date.now();
  return {
    id: row?.id || result.id || null,
    user_id: row?.user_id || result.user_id || null,
    questId: result.questId || result.quest_id || null,
    exerciseSlug: result.exerciseSlug || result.exercise_slug || null,
    calories: row?.calories ?? result.calories ?? 0,
    points: row?.points ?? result.points ?? 0,
    mode: result.mode || null,
    difficulty: result.difficulty || null,
    sets: result.sets || null,
    startTime: result.startTime || result.start_time || null,
    endTime: result.endTime || result.end_time || null,
    visibility: normalizePostVisibility(row?.visibility || result.visibility, 'private'),
    published_at: row?.published_at || result.published_at || null,
    note: row?.note || result.note || null,
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
    displayName: row?.display_name || row?.displayName || session?.user?.email || defaultName(),
    account_visibility: normalizeAccountVisibility(row?.account_visibility || row?.default_visibility || row?.defaultVisibility, 'private'),
    default_visibility: normalizeAccountVisibility(row?.account_visibility || row?.default_visibility || row?.defaultVisibility, 'private'),
    points: row?.points ?? 0,
    totalCalories: row?.total_calories ?? row?.totalCalories ?? 0,
    completedRuns: row?.completed_runs ?? row?.completedRuns ?? 0,
    lastResult: row?.last_result || row?.lastResult || null,
    height_cm: row?.height_cm ?? null,
    weight_kg: row?.weight_kg ?? null,
    sex: row?.sex || 'unknown',
    step_length_m: row?.step_length_m ?? null,
    arm_length_m: row?.arm_length_m ?? null,
    leg_length_m: row?.leg_length_m ?? null,
    torso_length_m: row?.torso_length_m ?? null,
    step_length_m_mode: row?.step_length_m_mode || 'auto',
    arm_length_m_mode: row?.arm_length_m_mode || 'auto',
    leg_length_m_mode: row?.leg_length_m_mode || 'auto',
    torso_length_m_mode: row?.torso_length_m_mode || 'auto',
    updatedAt: row?.updated_at || row?.updatedAt || null,
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
      .select('id,user_id,created_at,points,calories,visibility,published_at,note,result')
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
        p_calories: payload.calories || 0,
        p_visibility: payload.visibility || null,
        p_result: payload,
      });

      if (error) throw error;
      return data ? mapProfileRow(data) : null;
    };

    const fallbackInsertAndUpdate = async () => {
      const insertResult = await client
        .from('workout_runs')
        .insert({ user_id: session.user.id, points: payload.points, calories: payload.calories || 0, visibility: payload.visibility, published_at: payload.published_at, note: payload.note, result: payload })
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
        total_calories: (currentProfile?.total_calories || 0) + (payload.calories || 0),
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
        calories: entry.calories || 0,
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

  const getProfile = (_userId) => loadProfile();

  const updateProfile = (_userId, patch = {}) => saveProfile({ ...(patch || {}) });

  const saveProfile = (nextProfile = {}) => {
    const mergedProfile = { ...profile, ...(nextProfile || {}) };
    if (!supabaseEnabled || !session?.user?.id) {
      const saved = local.saveProfile(mergedProfile);
      return setProfile(saved);
    }

    const payload = {
      display_name: mergedProfile.displayName,
      account_visibility: normalizeAccountVisibility(mergedProfile.account_visibility || mergedProfile.default_visibility, 'private'),
      height_cm: mergedProfile.height_cm,
      weight_kg: mergedProfile.weight_kg,
      sex: mergedProfile.sex,
      step_length_m: mergedProfile.step_length_m,
      arm_length_m: mergedProfile.arm_length_m,
      leg_length_m: mergedProfile.leg_length_m,
      torso_length_m: mergedProfile.torso_length_m,
      step_length_m_mode: mergedProfile.step_length_m_mode,
      arm_length_m_mode: mergedProfile.arm_length_m_mode,
      leg_length_m_mode: mergedProfile.leg_length_m_mode,
      torso_length_m_mode: mergedProfile.torso_length_m_mode,
    };

    Object.keys(payload).forEach((key) => {
      if (typeof payload[key] === 'undefined') delete payload[key];
    });

    return client
      .from('profiles')
      .update(payload)
      .eq('id', session.user.id)
      .select(PROFILE_COLUMNS)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          authWarn('profiles save failed', error.message || error);
          return setProfile(mergedProfile);
        }
        if (!data) return setProfile(mergedProfile);
        return setProfile(data);
      });
  };

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

    const effectiveVisibility = resolvePostVisibility(profile.account_visibility || profile.default_visibility, result.visibilityOverride ?? result.visibility ?? null);
    const payload = {
      ...result,
      visibility: effectiveVisibility,
      published_at: effectiveVisibility === 'archived' ? null : (result.published_at || new Date().toISOString()),
      note: result.note || null,
      timestamp: result.endTime || Date.now(),
    };

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


  const getWeeklyPlan = (userId) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.getWeeklyPlan(userId);
    }

    return client
      .from('weekly_plans')
      .select('weekday,items')
      .eq('user_id', session.user.id)
      .then(({ data, error }) => {
        if (error) {
          authWarn('weekly_plans fetch failed', error.message || error);
          return local.getWeeklyPlan(userId);
        }
        const mapped = {};
        (data || []).forEach((row) => {
          mapped[String(row.weekday)] = Array.isArray(row.items) ? row.items : [];
        });
        return mapped;
      });
  };

  const setWeeklyPlan = (userId, weekday, items = []) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.setWeeklyPlan(userId, weekday, items);
    }

    return client
      .from('weekly_plans')
      .upsert({ user_id: session.user.id, weekday, items: Array.isArray(items) ? items : [] }, { onConflict: 'user_id,weekday' })
      .select('items')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          authWarn('weekly_plans upsert failed', error.message || error);
          return local.setWeeklyPlan(userId, weekday, items);
        }
        return data?.items || [];
      });
  };

  const getSpecialPlan = (userId, date) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.getSpecialPlan(userId, date);
    }

    return client
      .from('special_plans')
      .select('items')
      .eq('user_id', session.user.id)
      .eq('date', date)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          authWarn('special_plans fetch failed', error.message || error);
          return local.getSpecialPlan(userId, date);
        }
        return data?.items || null;
      });
  };

  const setSpecialPlan = (userId, date, items = []) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.setSpecialPlan(userId, date, items);
    }

    return client
      .from('special_plans')
      .upsert({ user_id: session.user.id, date, items: Array.isArray(items) ? items : [] }, { onConflict: 'user_id,date' })
      .select('items')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          authWarn('special_plans upsert failed', error.message || error);
          return local.setSpecialPlan(userId, date, items);
        }
        return data?.items || [];
      });
  };


  const followUser = (followerId, followeeId) => {
    if (!followerId || !followeeId || followerId === followeeId) return false;
    if (!supabaseEnabled || !session?.user?.id) {
      return local.followUser(followerId, followeeId);
    }

    return client
      .from('follows')
      .insert({ follower_id: followerId, followee_id: followeeId })
      .then(({ error }) => {
        if (error) {
          authWarn('follows insert failed', error.message || error);
          return local.followUser(followerId, followeeId);
        }
        return true;
      });
  };

  const unfollowUser = (followerId, followeeId) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.unfollowUser(followerId, followeeId);
    }

    return client
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('followee_id', followeeId)
      .then(({ error }) => {
        if (error) {
          authWarn('follows delete failed', error.message || error);
          return local.unfollowUser(followerId, followeeId);
        }
        return true;
      });
  };

  const getFollowing = (userId) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.getFollowing(userId);
    }

    return client
      .from('follows')
      .select('followee_id')
      .eq('follower_id', userId)
      .then(({ data, error }) => {
        if (error) {
          authWarn('follows following fetch failed', error.message || error);
          return local.getFollowing(userId);
        }
        return (data || []).map((row) => row.followee_id);
      });
  };

  const getFollowers = (userId) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.getFollowers(userId);
    }

    return client
      .from('follows')
      .select('follower_id')
      .eq('followee_id', userId)
      .then(({ data, error }) => {
        if (error) {
          authWarn('follows followers fetch failed', error.message || error);
          return local.getFollowers(userId);
        }
        return (data || []).map((row) => row.follower_id);
      });
  };

  const listVisibleWorkouts = (viewerId, targetUserId) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.listVisibleWorkouts(viewerId, targetUserId);
    }

    return Promise.all([
      client
        .from('workout_runs')
        .select('id,user_id,created_at,points,calories,visibility,published_at,note,result')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(HISTORY_LIMIT),
      getFollowing(viewerId),
    ]).then(([runsResult, followingIds]) => {
      if (runsResult.error) {
        authWarn('visible workouts fetch failed', runsResult.error.message || runsResult.error);
        return local.listVisibleWorkouts(viewerId, targetUserId);
      }
      const followingSet = new Set(followingIds || []);
      return (runsResult.data || [])
        .map(mapHistoryRow)
        .filter((entry) => {
          if (entry.user_id === viewerId) return true;
          const vis = normalizePostVisibility(entry.visibility, 'private');
          if (vis === 'public') return true;
          if (vis === 'private') return followingSet.has(entry.user_id);
          return false;
        });
    });
  };

  const updateWorkoutPost = (runId, updates = {}) => {
    if (!runId) return null;
    const nextVisibility = normalizePostVisibility(updates.visibility || 'private', 'private');
    const nextPublishedAt = nextVisibility === 'archived' ? null : (updates.published_at || new Date().toISOString());

    if (!supabaseEnabled || !session?.user?.id) {
      return local.updateWorkoutPost(runId, { ...updates, visibility: nextVisibility, published_at: nextPublishedAt });
    }

    return client
      .from('workout_runs')
      .update({
        visibility: nextVisibility,
        published_at: nextPublishedAt,
        note: typeof updates.note === 'string' ? updates.note : null,
      })
      .eq('id', runId)
      .eq('user_id', session.user.id)
      .select('id,user_id,created_at,points,calories,visibility,published_at,note,result')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          authWarn('workout post update failed', error.message || error);
          return local.updateWorkoutPost(runId, { ...updates, visibility: nextVisibility, published_at: nextPublishedAt });
        }
        if (!data) return null;
        refreshHistoryFromSupabase();
        return mapHistoryRow(data);
      });
  };

  const destroy = () => authUnsubscribe && authUnsubscribe();

  return {
    client,
    ready: supabaseEnabled,
    error: ready ? null : 'Supabase not configured',
    loadProfile,
    getProfile,
    updateProfile,
    saveProfile,
    recordResult,
    updateDisplayName,
    loadLeaderboard,
    loadHistory,
    saveLastPlan,
    getLastPlan,
    getWeeklyPlan,
    setWeeklyPlan,
    getSpecialPlan,
    setSpecialPlan,
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers,
    listVisibleWorkouts,
    updateWorkoutPost,
    subscribe,
    destroy,
  };
};
