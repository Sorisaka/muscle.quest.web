import { createLocalPersistence } from '../../data/adapters/localPersistence.js';
import { getRuntimeConfig, hasSupabaseCredentials } from '../../lib/runtimeConfig.js';
import { authWarn } from '../../lib/authDebug.js';
import { getSupabaseClient } from '../../lib/supabaseClient.js';
import { getSession, onAuthStateChange } from '../authService.js';
import { normalizeAccountVisibility, normalizePostVisibility, resolvePostVisibility } from '../../core/visibility.js';
import { toDateKey, startOfDay, endOfDay } from '../../lib/dateKey.js';
import { decorateResultWithTags, getExerciseTags, normalizeCategory, normalizeMuscles } from '../../core/exerciseTaxonomy.js';

const PROFILE_COLUMNS = 'id,display_name,account_visibility,default_visibility,points,total_calories,completed_runs,last_result,height_cm,weight_kg,sex,step_length_m,arm_length_m,leg_length_m,torso_length_m,step_length_m_mode,arm_length_m_mode,leg_length_m_mode,torso_length_m_mode,updated_at';
const HISTORY_LIMIT = 100;
const MIGRATION_FLAG_PREFIX = 'musclequest:migration:';


const WORKOUT_RUNS_COLUMNS_BASE = 'id,user_id,created_at,points,calories,visibility,published_at,note,result';
const WORKOUT_RUNS_COLUMNS_WITH_TAGS = 'id,user_id,created_at,points,calories,visibility,published_at,note,category,muscles,result';

const isWorkoutRunTagColumnError = (error) => {
  const message = String(error?.message || error || '').toLowerCase();
  return message.includes('category') || message.includes('muscles');
};

const selectWorkoutRunsWithFallback = async (buildQuery) => {
  const withTags = await buildQuery(WORKOUT_RUNS_COLUMNS_WITH_TAGS);
  if (!withTags?.error) return withTags;
  if (!isWorkoutRunTagColumnError(withTags.error)) return withTags;

  const fallback = await buildQuery(WORKOUT_RUNS_COLUMNS_BASE);
  if (fallback?.error) return fallback;
  const patched = (fallback?.data || []).map((row) => ({ ...row, category: null, muscles: null }));
  return { ...fallback, data: patched };
};

const isPromise = (value) => value && typeof value.then === 'function';


const buildEqFilter = (value) => `eq.${encodeURIComponent(value)}`;

const normalizeSingleResult = (result) => {
  if (result?.error) return result;
  if (Array.isArray(result?.data)) {
    if (result.data.length === 0) return { data: null, error: null };
    return { data: result.data[0], error: null };
  }
  return result;
};

const fetchSingleByKeys = async (client, table, keys, selectColumns = '*') => {
  let query = client.from(table).select(selectColumns).limit(1);
  Object.entries(keys || {}).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  const result = await query;
  return normalizeSingleResult(result);
};


const mapHistoryRow = (row) => {
  const rawResult = row?.result || {};
  const taggedResult = decorateResultWithTags(rawResult);
  const createdAt = row?.created_at ? new Date(row.created_at).getTime() : Date.now();
  const fallbackTags = getExerciseTags(taggedResult.exerciseSlug || taggedResult.exercise_slug || taggedResult.questId || taggedResult.quest_id);
  return {
    id: row?.id || taggedResult.id || null,
    user_id: row?.user_id || taggedResult.user_id || null,
    questId: taggedResult.questId || taggedResult.quest_id || null,
    exerciseSlug: taggedResult.exerciseSlug || taggedResult.exercise_slug || null,
    calories: row?.calories ?? taggedResult.calories ?? 0,
    points: row?.points ?? taggedResult.points ?? 0,
    mode: taggedResult.mode || null,
    difficulty: taggedResult.difficulty || null,
    sets: taggedResult.sets || null,
    startTime: taggedResult.startTime || taggedResult.start_time || null,
    endTime: taggedResult.endTime || taggedResult.end_time || null,
    visibility: normalizePostVisibility(row?.visibility || taggedResult.visibility, 'private'),
    published_at: row?.published_at || taggedResult.published_at || null,
    note: row?.note || taggedResult.note || null,
    timestamp: createdAt,
    category: normalizeCategory(row?.category || taggedResult.category || fallbackTags.category),
    muscles: normalizeMuscles(row?.muscles || taggedResult.muscles || fallbackTags.muscles),
    result: taggedResult,
  };
};


const mapTimelineRow = (row) => {
  const taggedResult = decorateResultWithTags(row?.result || {});
  const fallbackTags = getExerciseTags(taggedResult.exerciseSlug || taggedResult.exercise_slug || taggedResult.questId || taggedResult.quest_id);
  return ({
  runId: row?.run_id ?? row?.runId ?? null,
  userId: row?.user_id ?? row?.userId ?? null,
  authorDisplayName: row?.author_display_name ?? row?.authorDisplayName ?? row?.display_name ?? row?.displayName ?? null,
  createdAt: row?.created_at ?? row?.createdAt ?? null,
  publishedAt: row?.published_at ?? row?.publishedAt ?? null,
  visibility: normalizePostVisibility(row?.visibility, 'private'),
  calories: Number(row?.calories ?? 0),
  note: row?.note ?? null,
  result: taggedResult,
  category: normalizeCategory(row?.category || taggedResult.category || fallbackTags.category),
  muscles: normalizeMuscles(row?.muscles || taggedResult.muscles || fallbackTags.muscles),
  likeCount: Number(row?.like_count ?? row?.likeCount ?? 0),
  liked: Boolean(row?.liked),
});
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


  const upsertWithFallback = async ({ table, keys, payload, selectColumns = '*' }) => {
    if (!client || !session?.user?.id) {
      return { data: null, error: new Error('Supabase client unavailable.') };
    }

    const existing = await fetchSingleByKeys(client, table, keys, selectColumns);
    if (existing.error) return existing;

    if (existing.data) {
      let updateQuery = client.from(table).update(payload);
      Object.entries(keys || {}).forEach(([key, value]) => {
        updateQuery = updateQuery.eq(key, value);
      });
      const updated = await updateQuery.select(selectColumns);
      return normalizeSingleResult(updated);
    }

    const inserted = await client.from(table).insert(payload).select(selectColumns);
    return normalizeSingleResult(inserted);
  };

  const deleteWithFallback = async ({ table, keys }) => {
    if (!client || !session?.user?.id) {
      return { data: null, error: new Error('Supabase client unavailable.') };
    }

    const sessionResult = await getSession();
    const token = sessionResult?.data?.session?.access_token || null;
    const url = new URL(`${client.supabaseUrl}/rest/v1/${table}`);
    Object.entries(keys || {}).forEach(([key, value]) => {
      url.searchParams.set(key, buildEqFilter(value));
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          apikey: client.supabaseKey,
          Authorization: `Bearer ${token || client.supabaseKey}`,
          Prefer: 'return=minimal',
        },
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return { data: null, error: new Error(text || `delete failed (${response.status})`) };
      }
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };


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
    const { data, error } = await selectWorkoutRunsWithFallback((columns) => client
      .from('workout_runs')
      .select(columns)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT));

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
        p_points: Number(payload.points || 0),
        p_calories: Number(payload.calories || 0),
        p_visibility: payload.visibility || null,
        p_result: payload,
        p_category: payload.category || 'unknown',
        p_muscles: Array.isArray(payload.muscles) ? payload.muscles : [],
      });

      if (error) throw error;
      return data ? mapProfileRow(data) : null;
    };

    const fallbackInsertAndUpdate = async () => {
      const insertResult = await client
        .from('workout_runs')
.insert({ user_id: session.user.id, points: payload.points, calories: payload.calories || 0, visibility: payload.visibility, published_at: payload.published_at, note: payload.note, category: payload.category || 'unknown', muscles: Array.isArray(payload.muscles) ? payload.muscles : [], result: payload })
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
    const taggedResult = decorateResultWithTags(result);
    const payload = {
      ...taggedResult,
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

    return upsertWithFallback({
      table: 'weekly_plans',
      keys: { user_id: session.user.id, weekday },
      payload: { user_id: session.user.id, weekday, items: Array.isArray(items) ? items : [] },
      selectColumns: 'items',
    }).then(({ data, error }) => {
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
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          authWarn('special_plans fetch failed', error.message || error);
          return local.getSpecialPlan(userId, date);
        }
        const row = Array.isArray(data) ? data[0] : data;
        return row?.items || null;
      });
  };

  const setSpecialPlan = (userId, date, items = []) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.setSpecialPlan(userId, date, items);
    }

    return upsertWithFallback({
      table: 'special_plans',
      keys: { user_id: session.user.id, date },
      payload: { user_id: session.user.id, date, items: Array.isArray(items) ? items : [] },
      selectColumns: 'items',
    }).then(({ data, error }) => {
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

    return deleteWithFallback({
      table: 'follows',
      keys: { follower_id: followerId, followee_id: followeeId },
    }).then(({ error }) => {
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
      selectWorkoutRunsWithFallback((columns) => client
        .from('workout_runs')
        .select(columns)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(HISTORY_LIMIT)),
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


  const getTimeline = ({ scope = 'following', limit = 30, before = null } = {}) => {
    const safeLimit = Math.max(Number(limit) || 30, 1);
    const beforeValue = before ? new Date(before).toISOString() : null;

    if (!supabaseEnabled || !session?.user?.id) {
      return local.getTimeline({ scope, limit: safeLimit, before: beforeValue });
    }

    return client
      .rpc('get_timeline', {
        p_scope: scope || 'following',
        p_limit: safeLimit,
        p_before: beforeValue,
      })
      .then(({ data, error }) => {
        if (error) {
          authWarn('get_timeline failed', error.message || error);
          return local.getTimeline({ scope, limit: safeLimit, before: beforeValue });
        }
        return (data || []).map(mapTimelineRow);
      });
  };

  const toggleLike = (runId) => {
    if (!runId) return { runId, liked: false, likeCount: 0 };
    if (!supabaseEnabled || !session?.user?.id) {
      return local.toggleLike(runId);
    }

    return client
      .rpc('toggle_like', { p_run_id: runId })
      .then(({ data, error }) => {
        if (error) {
          authWarn('toggle_like failed', error.message || error);
          return local.toggleLike(runId);
        }
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) return { runId, liked: false, likeCount: 0 };
        return {
          runId: row.run_id ?? runId,
          liked: Boolean(row.liked),
          likeCount: Number(row.like_count ?? 0),
        };
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
      .select(WORKOUT_RUNS_COLUMNS_WITH_TAGS)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error && isWorkoutRunTagColumnError(error)) {
          const fallback = await client
            .from('workout_runs')
            .update({
              visibility: nextVisibility,
              published_at: nextPublishedAt,
              note: typeof updates.note === 'string' ? updates.note : null,
            })
            .eq('id', runId)
            .eq('user_id', session.user.id)
            .select(WORKOUT_RUNS_COLUMNS_BASE)
            .maybeSingle();
          data = fallback.data ? { ...fallback.data, category: null, muscles: null } : data;
          error = fallback.error;
        }
        if (error) {
          authWarn('workout post update failed', error.message || error);
          return local.updateWorkoutPost(runId, { ...updates, visibility: nextVisibility, published_at: nextPublishedAt });
        }
        if (!data) return null;
        refreshHistoryFromSupabase();
        return mapHistoryRow(data);
      });
  };



  const toBodyMetricPayload = (metric = {}) => ({
    user_id: session?.user?.id,
    date: metric.date || metric.dateKey,
    weight_kg: metric.weight_kg == null ? (metric.weightKg == null ? null : Number(metric.weightKg)) : Number(metric.weight_kg),
    body_fat_pct: metric.body_fat_pct == null ? (metric.bodyFatPct == null ? null : Number(metric.bodyFatPct)) : Number(metric.body_fat_pct),
    visibility: metric.visibility || 'private',
  });

  const mapBodyMetricRow = (row = {}) => ({
    date: row.date,
    weight_kg: row.weight_kg == null ? null : Number(row.weight_kg),
    body_fat_pct: row.body_fat_pct == null ? null : Number(row.body_fat_pct),
    visibility: row.visibility || 'private',
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  });

  const upsertBodyMetric = (userId, metric = {}) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.upsertBodyMetric(userId, metric);
    }

    const payload = toBodyMetricPayload(metric);
    if (!payload.date) return null;

    return client
      .from('body_metrics')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select('user_id,date,weight_kg,body_fat_pct,visibility,created_at,updated_at')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          authWarn('body_metrics upsert failed', error.message || error);
          return local.upsertBodyMetric(userId, metric);
        }
        return data ? mapBodyMetricRow(data) : mapBodyMetricRow(payload);
      });
  };

  const deleteBodyMetric = (userId, date) => {
    if (!date) return false;
    if (!supabaseEnabled || !session?.user?.id) {
      return local.deleteBodyMetric(userId, date);
    }

    return deleteWithFallback({
      table: 'body_metrics',
      keys: { user_id: session.user.id, date },
    }).then(({ error }) => {
      if (error) {
        authWarn('body_metrics delete failed', error.message || error);
        return local.deleteBodyMetric(userId, date);
      }
      return true;
    });
  };

  const getBodyMetricsRange = (userId, fromDate, toDate) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.getBodyMetricsRange(userId, fromDate, toDate);
    }

    let query = client
      .from('body_metrics')
      .select('user_id,date,weight_kg,body_fat_pct,visibility,created_at,updated_at')
      .eq('user_id', userId || session.user.id);

    const supportsRange = typeof query?.gte === 'function' && typeof query?.lte === 'function';
    if (supportsRange) {
      if (fromDate) query = query.gte('date', fromDate);
      if (toDate) query = query.lte('date', toDate);
    }

    return query.order('date', { ascending: true }).then(({ data, error }) => {
      if (error) {
        authWarn('body_metrics range fetch failed', error.message || error);
        return local.getBodyMetricsRange(userId, fromDate, toDate);
      }
      const mapped = (data || []).map(mapBodyMetricRow);
      if (supportsRange) return mapped;
      return mapped.filter((row) => (!fromDate || row.date >= fromDate) && (!toDate || row.date <= toDate));
    });
  };

  const getWorkoutDateKey = (entry = {}) => {
    const source = entry?.timestamp
      || entry?.result?.timestamp
      || entry?.endTime
      || entry?.result?.endTime
      || entry?.created_at
      || entry?.published_at
      || null;
    return source ? toDateKey(source) : null;
  };

  const getWorkoutsByDate = (userId, date) => {
    if (!date) return [];
    if (!supabaseEnabled || !session?.user?.id) {
      return local.getWorkoutsByDate(userId, date);
    }

    const from = startOfDay(date).toISOString();
    const to = endOfDay(date).toISOString();

    const buildQuery = (columns) => {
      let query = client
        .from('workout_runs')
        .select(columns)
        .eq('user_id', userId || session.user.id);

      const supportsRange = typeof query?.gte === 'function' && typeof query?.lte === 'function';
      if (supportsRange) {
        query = query.gte('created_at', from).lte('created_at', to);
      }

      return query.order('created_at', { ascending: false });
    };

    return selectWorkoutRunsWithFallback(buildQuery)
      .then(({ data, error }) => {
        if (error) {
          authWarn('workout_runs by date fetch failed', error.message || error);
          return local.getWorkoutsByDate(userId, date);
        }
        const mapped = (data || []).map(mapHistoryRow).filter((entry) => getWorkoutDateKey(entry) === date);
        return mapped;
      });
  };

  const listWorkoutDatesInMonth = (userId, year, month) => {
    if (!supabaseEnabled || !session?.user?.id) {
      return local.listWorkoutDatesInMonth(userId, year, month);
    }

    const mm = String(month).padStart(2, '0');
    const first = `${year}-${mm}-01`;
    const nextMonth = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const buildQuery = (columns) => {
      let query = client
        .from('workout_runs')
        .select(columns)
        .eq('user_id', userId || session.user.id);

      const supportsRange = typeof query?.gte === 'function' && typeof query?.lt === 'function';
      if (supportsRange) {
        query = query.gte('created_at', startOfDay(first).toISOString())
          .lt('created_at', startOfDay(nextMonth).toISOString());
      }

      return query.order('created_at', { ascending: false });
    };

    return selectWorkoutRunsWithFallback(buildQuery)
      .then(({ data, error }) => {
        if (error) {
          authWarn('workout_runs month dates fetch failed', error.message || error);
          return local.listWorkoutDatesInMonth(userId, year, month);
        }
        const mapped = (data || []).map(mapHistoryRow).map(getWorkoutDateKey).filter(Boolean);
        const monthPrefix = `${year}-${mm}-`;
        const set = new Set(mapped.filter((dateKey) => dateKey.startsWith(monthPrefix)));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
      });
  };

  // backward compatibility
  const loadBodyMetrics = (userId) => Promise.resolve(getBodyMetricsRange(userId, null, null)).then((rows) => (rows || []).map((entry) => ({
    dateKey: entry.date,
    weightKg: entry.weight_kg,
    bodyFatPct: entry.body_fat_pct,
    visibility: entry.visibility,
    recordedAt: entry.updated_at || entry.created_at,
  })));

  const saveBodyMetric = (userId, entry = {}) => upsertBodyMetric(userId, {
    date: entry.date || entry.dateKey,
    weight_kg: entry.weight_kg ?? entry.weightKg,
    body_fat_pct: entry.body_fat_pct ?? entry.bodyFatPct,
    visibility: entry.visibility,
    updated_at: entry.updated_at || entry.recordedAt,
  });

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
    getTimeline,
    toggleLike,
    upsertBodyMetric,
    deleteBodyMetric,
    getBodyMetricsRange,
    getWorkoutsByDate,
    listWorkoutDatesInMonth,
    loadBodyMetrics,
    saveBodyMetric,
    subscribe,
    destroy,
  };
};
