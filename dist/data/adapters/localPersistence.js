import { aggregateCalories } from '../../core/history.js';
import { normalizeAccountVisibility, normalizePostVisibility, resolvePostVisibility } from '../../core/visibility.js';

const PROFILE_KEY = 'musclequest:profile';
const HISTORY_KEY = 'musclequest:history';
const LAST_PLAN_KEY = 'musclequest:lastPlans';
const WEEKLY_PLAN_KEY = 'musclequest:weeklyPlans';
const SPECIAL_PLAN_KEY = 'musclequest:specialPlans';
const FOLLOWS_KEY = 'musclequest:follows';
const LIKES_KEY = 'musclequest:likesByRunId';

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const defaultProfile = {
  id: 'local-user',
  displayName: 'Guest',
  totalCalories: 0,
  points: 0,
  completedRuns: 0,
  lastResult: null,
  account_visibility: 'private',
};

export const createLocalPersistence = () => {
  const loadProfile = () => readJson(PROFILE_KEY, { ...defaultProfile });
  const loadHistory = () => readJson(HISTORY_KEY, []);
  const loadLastPlans = () => readJson(LAST_PLAN_KEY, {});
  const loadWeeklyPlans = () => readJson(WEEKLY_PLAN_KEY, {});
  const loadSpecialPlans = () => readJson(SPECIAL_PLAN_KEY, {});
  const loadFollows = () => readJson(FOLLOWS_KEY, []);
  const loadLikes = () => readJson(LIKES_KEY, {});

  const replaceProfile = (nextProfile) => {
    const safeProfile = { ...defaultProfile, ...(nextProfile || {}) };
    const accountVisibility = normalizeAccountVisibility(safeProfile.account_visibility || safeProfile.default_visibility, 'private');
    safeProfile.account_visibility = accountVisibility;
    safeProfile.default_visibility = accountVisibility;
    writeJson(PROFILE_KEY, safeProfile);
    return safeProfile;
  };

  const replaceHistory = (entries = []) => {
    const safeHistory = Array.isArray(entries) ? entries.slice(0, 100) : [];
    writeJson(HISTORY_KEY, safeHistory);
    return safeHistory;
  };

  const saveProfile = (profile) => {
    const next = { ...defaultProfile, ...(profile || {}) };
    const accountVisibility = normalizeAccountVisibility(next.account_visibility || next.default_visibility, 'private');
    next.account_visibility = accountVisibility;
    next.default_visibility = accountVisibility;
    writeJson(PROFILE_KEY, next);
    return next;
  };

  const saveLastPlan = (questId, difficulty, plan) => {
    if (!questId || !difficulty) return plan;
    const plans = loadLastPlans();
    const key = `${questId}:${difficulty}`;
    plans[key] = { ...plan };
    writeJson(LAST_PLAN_KEY, plans);
    return plan;
  };

  const getProfile = (_userId) => loadProfile();

  const updateProfile = (_userId, patch = {}) => saveProfile({ ...loadProfile(), ...(patch || {}) });

  const getLastPlan = (questId, difficulty) => {
    if (!questId || !difficulty) return null;
    const plans = loadLastPlans();
    const key = `${questId}:${difficulty}`;
    return plans[key] || null;
  };

  const recordResult = (result) => {
    const profile = loadProfile();
    const history = loadHistory();
    const timestamp = Date.now();
    const calories = Number(result.calories || 0);
    const nextProfile = {
      ...profile,
      totalCalories: (profile.totalCalories || 0) + calories,
      points: profile.points || 0,
      completedRuns: profile.completedRuns + 1,
      lastResult: { ...result, recordedAt: timestamp },
    };

    const effectiveVisibility = resolvePostVisibility(profile.account_visibility || profile.default_visibility, result.visibilityOverride);

    history.unshift({
      id: result.id || `${timestamp}:${Math.random().toString(36).slice(2, 8)}`,
      user_id: profile.id || 'local-user',
      questId: result.questId,
      exerciseSlug: result.exerciseSlug,
      calories,
      points: result.points || 0,
      mode: result.mode,
      difficulty: result.difficulty,
      sets: result.sets,
      startTime: result.startTime,
      endTime: result.endTime,
      timestamp,
      visibility: effectiveVisibility,
      published_at: effectiveVisibility === 'archived' ? null : (result.published_at || new Date(timestamp).toISOString()),
      note: result.note || null,
      breakdown: result.breakdown || null,
    });

    writeJson(PROFILE_KEY, nextProfile);
    writeJson(HISTORY_KEY, history.slice(0, 100));
    if (result.questId && result.difficulty && result.plan) {
      saveLastPlan(result.questId, result.difficulty, result.plan);
    }
    return nextProfile;
  };


  const getWeeklyPlan = () => loadWeeklyPlans();

  const setWeeklyPlan = (_userId, weekday, items = []) => {
    if (weekday == null) return [];
    const weekly = loadWeeklyPlans();
    weekly[String(weekday)] = Array.isArray(items) ? items : [];
    writeJson(WEEKLY_PLAN_KEY, weekly);
    return weekly[String(weekday)];
  };

  const getSpecialPlan = (_userId, date) => {
    if (!date) return null;
    const special = loadSpecialPlans();
    return special[date] || null;
  };

  const setSpecialPlan = (_userId, date, items = []) => {
    if (!date) return null;
    const special = loadSpecialPlans();
    special[date] = Array.isArray(items) ? items : [];
    writeJson(SPECIAL_PLAN_KEY, special);
    return special[date];
  };

  const updateDisplayName = (name) => {
    const profile = loadProfile();
    const next = { ...profile, displayName: name || 'Guest' };
    saveProfile(next);
    return next;
  };

  const loadLeaderboard = (period = 'overall') => {
    const profile = loadProfile();
    const history = loadHistory();
    const totals = aggregateCalories(history);
    const bots = [
      { id: 'atlas', displayName: 'Atlas', calories: 3200, daily: 140, weekly: 860, monthly: 2100 },
      { id: 'valkyrie', displayName: 'Valkyrie', calories: 2500, daily: 110, weekly: 640, monthly: 1600 },
      { id: 'nova', displayName: 'Nova', calories: 1800, daily: 80, weekly: 420, monthly: 1100 },
    ];

    const getPeriodCalories = (entry) => {
      if (entry.id === profile.id) {
        if (period === 'daily') return totals.daily || 0;
        if (period === 'weekly') return totals.weekly || 0;
        if (period === 'monthly') return totals.monthly || 0;
      }
      if (period === 'daily') return entry.daily ?? entry.calories ?? 0;
      if (period === 'weekly') return entry.weekly ?? entry.calories ?? 0;
      if (period === 'monthly') return entry.monthly ?? entry.calories ?? 0;
      return entry.calories || 0;
    };

    const entries = [...bots, { ...profile, calories: profile.totalCalories || 0 }];
    return entries
      .map((entry) => ({ ...entry, calories: Math.max(getPeriodCalories(entry), 0) }))
      .sort((a, b) => b.calories - a.calories)
      .slice(0, 20);
  };


  const followUser = (followerId, followeeId) => {
    if (!followerId || !followeeId || followerId === followeeId) return false;
    const follows = loadFollows();
    const exists = follows.some((row) => row.follower_id === followerId && row.followee_id === followeeId);
    if (!exists) {
      follows.push({ follower_id: followerId, followee_id: followeeId, created_at: new Date().toISOString() });
      writeJson(FOLLOWS_KEY, follows);
    }
    return true;
  };

  const unfollowUser = (followerId, followeeId) => {
    const follows = loadFollows();
    const next = follows.filter((row) => !(row.follower_id === followerId && row.followee_id === followeeId));
    writeJson(FOLLOWS_KEY, next);
    return true;
  };

  const getFollowing = (userId) => loadFollows().filter((row) => row.follower_id === userId).map((row) => row.followee_id);

  const getFollowers = (userId) => loadFollows().filter((row) => row.followee_id === userId).map((row) => row.follower_id);

  const canView = (viewerId, entry) => {
    if (!entry) return false;
    if (viewerId && entry.user_id === viewerId) return true;
    if (normalizePostVisibility(entry.visibility) === 'public') return true;
    if (normalizePostVisibility(entry.visibility) === 'private') {
      const follows = loadFollows();
      return follows.some((row) => row.follower_id === viewerId && row.followee_id === entry.user_id);
    }
    return false;
  };

  const listVisibleWorkouts = (viewerId, targetUserId) => {
    const history = loadHistory();
    return history
      .filter((entry) => !targetUserId || entry.user_id === targetUserId)
      .filter((entry) => canView(viewerId, entry));
  };

  const updateWorkoutPost = (runId, updates = {}) => {
    if (!runId) return null;
    const profile = loadProfile();
    const history = loadHistory();
    const idx = history.findIndex((entry) => entry.id === runId);
    if (idx < 0) return null;
    const visibility = resolvePostVisibility(profile.account_visibility || profile.default_visibility, updates.visibility || history[idx].visibility || 'private');
    const publishedAt = visibility === 'archived' ? null : (updates.published_at || history[idx].published_at || new Date().toISOString());
    const next = {
      ...history[idx],
      visibility,
      published_at: publishedAt,
      note: typeof updates.note === 'string' ? updates.note : history[idx].note,
    };
    history[idx] = next;
    writeJson(HISTORY_KEY, history);
    return next;
  };

  const getTimeline = ({ scope: _scope = 'following', limit = 30, before = null } = {}) => {
    const profile = loadProfile();
    const history = loadHistory();
    const likesByRunId = loadLikes();
    const beforeTime = before ? new Date(before).getTime() : null;
    const safeLimit = Math.max(Number(limit) || 30, 1);

    return history
      .filter((entry) => entry.user_id === profile.id)
      .map((entry) => {
        const createdAt = entry.created_at || new Date(entry.timestamp || Date.now()).toISOString();
        const publishedAt = entry.published_at || null;
        const sortAt = new Date(publishedAt || createdAt).getTime();
        const liked = Boolean(likesByRunId[String(entry.id)]);
        return {
          runId: entry.id,
          userId: entry.user_id,
          authorDisplayName: profile.displayName || 'Guest',
          createdAt,
          publishedAt,
          visibility: entry.visibility || 'private',
          calories: Number(entry.calories || 0),
          note: entry.note || null,
          result: entry.result || null,
          likeCount: liked ? 1 : 0,
          liked,
          __sortAt: sortAt,
        };
      })
      .filter((entry) => (beforeTime == null ? true : entry.__sortAt < beforeTime))
      .sort((a, b) => b.__sortAt - a.__sortAt)
      .slice(0, safeLimit)
      .map(({ __sortAt, ...entry }) => entry);
  };

  const toggleLike = (runId) => {
    if (!runId) {
      return { runId, liked: false, likeCount: 0 };
    }
    const key = String(runId);
    const likesByRunId = loadLikes();
    const nextLiked = !Boolean(likesByRunId[key]);
    likesByRunId[key] = nextLiked;
    writeJson(LIKES_KEY, likesByRunId);
    return { runId, liked: nextLiked, likeCount: nextLiked ? 1 : 0 };
  };

  return {
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
    replaceHistory,
    replaceProfile,
  };
};
