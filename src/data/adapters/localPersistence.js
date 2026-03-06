import { aggregateCalories } from '../../core/history.js';
import { normalizeAccountVisibility, normalizePostVisibility, resolvePostVisibility } from '../../core/visibility.js';
import { decorateResultWithTags } from '../../core/exerciseTaxonomy.js';
import { normalizeIconConfig } from '../../core/iconOptions.js';
import { toDateKey } from '../../lib/dateKey.js';

const PROFILE_KEY = 'musclequest:profile';
const HISTORY_KEY = 'musclequest:history';
const LAST_PLAN_KEY = 'musclequest:lastPlans';
const WEEKLY_PLAN_KEY = 'musclequest:weeklyPlans';
const SPECIAL_PLAN_KEY = 'musclequest:specialPlans';
const FOLLOWS_KEY = 'musclequest:follows';
const FOLLOW_REQUESTS_KEY = 'musclequest:followRequests';
const LIKES_KEY = 'musclequest:likesByRunId';
const BODY_METRICS_KEY = 'musclequest:bodyMetrics';
const BODY_METRICS_NS = 'mq:bodyMetrics';

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
  displayName: 'ゲスト',
  totalCalories: 0,
  points: 0,
  completedRuns: 0,
  lastResult: null,
  account_visibility: 'private',
  icon_border: 'ring-slate',
  icon_background: 'bg-night',
  icon_center_object: 'dot',
};

export const createLocalPersistence = () => {
  const loadProfile = () => readJson(PROFILE_KEY, { ...defaultProfile });
  const loadHistory = () => readJson(HISTORY_KEY, []);
  const loadLastPlans = () => readJson(LAST_PLAN_KEY, {});
  const loadWeeklyPlans = () => readJson(WEEKLY_PLAN_KEY, {});
  const loadSpecialPlans = () => readJson(SPECIAL_PLAN_KEY, {});
  const loadFollows = () => readJson(FOLLOWS_KEY, []);
  const loadFollowRequests = () => readJson(FOLLOW_REQUESTS_KEY, []);
  const loadLikes = () => readJson(LIKES_KEY, {});
  const getBodyMetricsStorageKey = (userId) => `${BODY_METRICS_NS}:${userId || loadProfile().id || 'local-user'}`;
  const loadBodyMetricsData = (userId) => {
    const scoped = readJson(getBodyMetricsStorageKey(userId), null);
    if (Array.isArray(scoped)) return scoped;
    const legacy = readJson(BODY_METRICS_KEY, []);
    return Array.isArray(legacy) ? legacy : [];
  };

  const replaceProfile = (nextProfile) => {
    const safeProfile = { ...defaultProfile, ...(nextProfile || {}) };
    const accountVisibility = normalizeAccountVisibility(safeProfile.account_visibility || safeProfile.default_visibility, 'private');
    safeProfile.account_visibility = accountVisibility;
    safeProfile.default_visibility = accountVisibility;
    Object.assign(safeProfile, normalizeIconConfig(safeProfile));
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
    Object.assign(next, normalizeIconConfig(next));
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
    const taggedResult = decorateResultWithTags(result);
    const profile = loadProfile();
    const history = loadHistory();
    const timestamp = Date.now();
    const calories = Number(taggedResult.calories || 0);
    const nextProfile = {
      ...profile,
      totalCalories: (profile.totalCalories || 0) + calories,
      points: profile.points || 0,
      completedRuns: profile.completedRuns + 1,
      lastResult: { ...taggedResult, recordedAt: timestamp },
    };

    const effectiveVisibility = resolvePostVisibility(profile.account_visibility || profile.default_visibility, taggedResult.visibilityOverride);

    history.unshift({
      id: taggedResult.id || `${timestamp}:${Math.random().toString(36).slice(2, 8)}`,
      user_id: profile.id || 'local-user',
      questId: taggedResult.questId,
      exerciseSlug: taggedResult.exerciseSlug,
      calories,
      points: taggedResult.points || 0,
      mode: taggedResult.mode,
      difficulty: taggedResult.difficulty,
      sets: taggedResult.sets,
      startTime: taggedResult.startTime,
      endTime: taggedResult.endTime,
      timestamp,
      visibility: effectiveVisibility,
      published_at: effectiveVisibility === 'archived' ? null : (taggedResult.published_at || new Date(timestamp).toISOString()),
      note: taggedResult.note || null,
      breakdown: taggedResult.breakdown || null,
      category: taggedResult.category || 'unknown',
      muscles: Array.isArray(taggedResult.muscles) ? taggedResult.muscles : [],
      result: { ...taggedResult },
    });

    writeJson(PROFILE_KEY, nextProfile);
    writeJson(HISTORY_KEY, history.slice(0, 100));
    if (taggedResult.questId && taggedResult.difficulty && taggedResult.plan) {
      saveLastPlan(taggedResult.questId, taggedResult.difficulty, taggedResult.plan);
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
    const next = { ...profile, displayName: name || 'ゲスト' };
    saveProfile(next);
    return next;
  };

  const loadLeaderboard = (period = 'overall') => {
    const profile = loadProfile();
    const history = loadHistory();
    const totals = aggregateCalories(history);
    const calories = period === 'daily'
      ? totals.daily || 0
      : period === 'weekly'
        ? totals.weekly || 0
        : period === 'monthly'
          ? totals.monthly || 0
          : profile.totalCalories || 0;

    return [{
      id: profile.id,
      displayName: profile.displayName || 'ゲスト',
      account_visibility: normalizeAccountVisibility(profile.account_visibility || profile.default_visibility, 'private'),
      icon_border: profile.icon_border || null,
      icon_background: profile.icon_background || null,
      icon_center_object: profile.icon_center_object || null,
      calories: Math.max(Number(calories || 0), 0),
      is_self: true,
    }];
  };


  const ensureLocalProfile = (userId) => {
    if (!userId) return null;
    const profile = loadProfile();
    if (profile.id === userId) {
      return {
        id: profile.id,
        display_name: profile.displayName || 'ゲスト',
        account_visibility: normalizeAccountVisibility(profile.account_visibility || profile.default_visibility, 'private'),
        icon_border: profile.icon_border || null,
        icon_background: profile.icon_background || null,
        icon_center_object: profile.icon_center_object || null,
      };
    }
    return {
      id: userId,
      display_name: userId,
      account_visibility: 'private',
      icon_border: null,
      icon_background: null,
      icon_center_object: null,
    };
  };

  const getFollowing = (userId) => loadFollows()
    .filter((row) => row.follower_id === userId)
    .map((row) => ensureLocalProfile(row.followee_id))
    .filter(Boolean);

  const getFollowers = (userId) => loadFollows()
    .filter((row) => row.followee_id === userId)
    .map((row) => ensureLocalProfile(row.follower_id))
    .filter(Boolean);

  const getFollowState = (viewerId, targetId) => {
    const follows = loadFollows();
    const requests = loadFollowRequests();
    const following = follows.some((row) => row.follower_id === viewerId && row.followee_id === targetId);
    const incomingPending = requests.some((row) => row.requester_id === targetId && row.target_id === viewerId && row.status === 'pending');
    const outgoing = requests.find((row) => row.requester_id === viewerId && row.target_id === targetId && row.status === 'pending');
    const targetProfile = ensureLocalProfile(targetId);
    return {
      targetId,
      accountVisibility: targetProfile?.account_visibility || 'public',
      isFollowing: following,
      hasPendingRequest: Boolean(outgoing),
      hasIncomingRequest: incomingPending,
      requestStatus: outgoing?.status || null,
    };
  };

  const followUser = (followerId, followeeId) => {
    if (!followerId || !followeeId || followerId === followeeId) {
      return { ok: false, code: 'SELF_FOLLOW_NOT_ALLOWED' };
    }
    const follows = loadFollows();
    const exists = follows.some((row) => row.follower_id === followerId && row.followee_id === followeeId);
    if (exists) return { ok: true, code: 'ALREADY_FOLLOWING' };
    follows.push({ follower_id: followerId, followee_id: followeeId, created_at: new Date().toISOString() });
    writeJson(FOLLOWS_KEY, follows);
    return { ok: true, code: 'FOLLOWED' };
  };

  const unfollowUser = (followerId, followeeId) => {
    const follows = loadFollows();
    const next = follows.filter((row) => !(row.follower_id === followerId && row.followee_id === followeeId));
    writeJson(FOLLOWS_KEY, next);
    return { ok: true, code: 'UNFOLLOWED' };
  };

  const requestFollow = (requesterId, targetId) => {
    if (!requesterId || !targetId || requesterId === targetId) return { ok: false, code: 'SELF_FOLLOW_NOT_ALLOWED' };
    const target = ensureLocalProfile(targetId);
    if ((target?.account_visibility || 'public') === 'public') {
      return followUser(requesterId, targetId);
    }
    const requests = loadFollowRequests();
    const existing = requests.find((row) => row.requester_id === requesterId && row.target_id === targetId && row.status === 'pending');
    if (existing) return { ok: true, code: 'REQUEST_PENDING' };
    requests.push({ requester_id: requesterId, target_id: targetId, status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    writeJson(FOLLOW_REQUESTS_KEY, requests);
    return { ok: true, code: 'REQUESTED' };
  };

  const cancelFollowRequest = (requesterId, targetId) => {
    const requests = loadFollowRequests();
    let changed = false;
    const next = requests.map((row) => {
      if (row.requester_id === requesterId && row.target_id === targetId && row.status === 'pending') {
        changed = true;
        return { ...row, status: 'cancelled', updated_at: new Date().toISOString() };
      }
      return row;
    });
    writeJson(FOLLOW_REQUESTS_KEY, next);
    return { ok: changed, code: changed ? 'REQUEST_CANCELLED' : 'REQUEST_NOT_FOUND' };
  };

  const respondFollowRequest = (targetId, requesterId, action = 'reject') => {
    const decision = action === 'approve' ? 'accepted' : 'rejected';
    const requests = loadFollowRequests();
    let changed = false;
    const next = requests.map((row) => {
      if (row.requester_id === requesterId && row.target_id === targetId && row.status === 'pending') {
        changed = true;
        return { ...row, status: decision, updated_at: new Date().toISOString() };
      }
      return row;
    });
    writeJson(FOLLOW_REQUESTS_KEY, next);
    if (!changed) return { ok: false, code: 'REQUEST_NOT_FOUND' };
    if (decision === 'accepted') {
      return followUser(requesterId, targetId);
    }
    return { ok: true, code: 'REQUEST_REJECTED' };
  };

  const listFollowRequests = (userId, direction = 'incoming') => {
    const requests = loadFollowRequests();
    const filtered = requests.filter((row) => direction === 'incoming' ? row.target_id === userId : row.requester_id === userId);
    return filtered
      .filter((row) => row.status === 'pending')
      .map((row) => ({
        ...row,
        requester: ensureLocalProfile(row.requester_id),
        target: ensureLocalProfile(row.target_id),
      }));
  };

  const searchAccounts = (query = '', _viewerId = null, limit = 20) => {
    const profile = ensureLocalProfile(loadProfile().id);
    const ids = new Set([profile.id]);
    loadFollows().forEach((row) => {
      ids.add(row.follower_id);
      ids.add(row.followee_id);
    });
    loadFollowRequests().forEach((row) => {
      ids.add(row.requester_id);
      ids.add(row.target_id);
    });
    const list = Array.from(ids).map((id) => ensureLocalProfile(id)).filter(Boolean);
    const q = String(query || '').trim().toLowerCase();
    const matched = q
      ? list.filter((row) => String(row.id).toLowerCase().includes(q) || String(row.display_name || '').toLowerCase().includes(q))
      : list;
    return matched.slice(0, Math.max(1, Number(limit) || 20));
  };

  const getFollowCounts = (userId) => ({
    following: getFollowing(userId).length,
    followers: getFollowers(userId).length,
    pendingIncoming: listFollowRequests(userId, 'incoming').length,
    pendingOutgoing: listFollowRequests(userId, 'outgoing').length,
  });

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

  const deleteWorkoutPost = (runId) => {
    if (!runId) return false;
    const history = loadHistory();
    const nextHistory = history.filter((entry) => entry.id !== runId);
    if (nextHistory.length === history.length) return false;
    writeJson(HISTORY_KEY, nextHistory);

    const likes = loadLikes();
    if (likes[String(runId)]) {
      const nextLikes = { ...likes };
      delete nextLikes[String(runId)];
      writeJson(LIKES_KEY, nextLikes);
    }
    return true;
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
          authorDisplayName: profile.displayName || 'ゲスト',
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



  const normalizeBodyMetric = (metric = {}) => ({
    date: metric.date || metric.dateKey || null,
    weight_kg: metric.weight_kg == null ? null : Number(metric.weight_kg),
    body_fat_pct: metric.body_fat_pct == null ? null : Number(metric.body_fat_pct),
    visibility: metric.visibility || 'private',
    updated_at: metric.updated_at || new Date().toISOString(),
  });

  const upsertBodyMetric = (userId, metric = {}) => {
    const normalized = normalizeBodyMetric(metric);
    if (!normalized.date) return null;
    if (normalized.weight_kg == null && normalized.body_fat_pct == null) {
      return { ok: false, code: 'BODY_METRIC_EMPTY_NOT_ALLOWED' };
    }
    const rows = loadBodyMetricsData(userId);
    const next = Array.isArray(rows) ? rows.slice() : [];
    const idx = next.findIndex((row) => row.date === normalized.date);
    if (idx >= 0) next[idx] = { ...next[idx], ...normalized };
    else next.push(normalized);
    next.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    writeJson(getBodyMetricsStorageKey(userId), next);
    return normalized;
  };

  const deleteBodyMetric = (userId, date) => {
    if (!date) return false;
    const rows = loadBodyMetricsData(userId);
    const next = (Array.isArray(rows) ? rows : []).filter((row) => row?.date !== date);
    writeJson(getBodyMetricsStorageKey(userId), next);
    return true;
  };

  const getBodyMetricsRange = (userId, fromDate, toDate) => {
    const rows = loadBodyMetricsData(userId);
    return (Array.isArray(rows) ? rows : [])
      .filter((entry) => entry && entry.date)
      .filter((entry) => (!fromDate || entry.date >= fromDate) && (!toDate || entry.date <= toDate))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
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

  const getWorkoutsByDate = (_userId, date) => {
    if (!date) return [];
    const history = loadHistory();
    return history.filter((entry) => getWorkoutDateKey(entry) === date);
  };

  const listWorkoutDatesInMonth = (_userId, year, month) => {
    const mm = String(month).padStart(2, '0');
    const prefix = `${year}-${mm}-`;
    const history = loadHistory();
    const dateSet = new Set();
    history.forEach((entry) => {
      const dateKey = getWorkoutDateKey(entry);
      if (dateKey && dateKey.startsWith(prefix)) dateSet.add(dateKey);
    });
    return Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  };

  // backward compatibility for existing callers
  const loadBodyMetrics = (userId) => getBodyMetricsRange(userId, null, null)
    .map((entry) => ({
      dateKey: entry.date,
      weightKg: entry.weight_kg,
      bodyFatPct: entry.body_fat_pct,
      visibility: entry.visibility,
      recordedAt: entry.updated_at,
    }));

  const saveBodyMetric = (userId, entry = {}) => upsertBodyMetric(userId, {
    date: entry.date || entry.dateKey,
    weight_kg: entry.weight_kg ?? entry.weightKg,
    body_fat_pct: entry.body_fat_pct ?? entry.bodyFatPct,
    visibility: entry.visibility,
    updated_at: entry.updated_at || entry.recordedAt,
  });

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
    requestFollow,
    cancelFollowRequest,
    respondFollowRequest,
    getFollowState,
    listFollowRequests,
    searchAccounts,
    getFollowCounts,
    getFollowing,
    getFollowers,
    listVisibleWorkouts,
    updateWorkoutPost,
    deleteWorkoutPost,
    getTimeline,
    toggleLike,
    upsertBodyMetric,
    deleteBodyMetric,
    getBodyMetricsRange,
    getWorkoutsByDate,
    listWorkoutDatesInMonth,
    loadBodyMetrics,
    saveBodyMetric,
    replaceHistory,
    replaceProfile,
  };
};
