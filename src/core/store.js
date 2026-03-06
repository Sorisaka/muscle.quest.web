import { trainingConfig } from '../data/trainingConfig.js';
import { createPersistence } from '../data/persistence.js';
import { calculateCalories, calculatePoints } from './points.js';
import { aggregateCalories, calculateStreak } from './history.js';
import { decorateResultWithTags } from './exerciseTaxonomy.js';
import { defaultHistoryFilter } from './historyFilters.js';

const STORAGE_KEY = 'musclequest:settings';
const TODO_STATE_KEY = 'musclequest:todoState';
const HISTORY_FILTER_KEY = 'musclequest:historyFilter';

const defaultSettings = {
  language: 'en',
  difficulty: 'beginner',
  sfxEnabled: true,
  sfxVolume: 0.6,
  timerTrainingSeconds: trainingConfig.defaults.timerTrainingSeconds,
  timerRestSeconds: trainingConfig.defaults.timerRestSeconds,
  timerSets: trainingConfig.defaults.timerSets,
  mode: trainingConfig.defaults.mode,
  timerType: trainingConfig.defaults.timerType,
};

const defaultProfile = {
  id: 'local-user',
  displayName: 'Guest',
  totalCalories: 0,
  completedRuns: 0,
  lastResult: null,
  account_visibility: 'private',
  default_visibility: 'private',
};

const isPromise = (value) => value && typeof value.then === 'function';

const readTodoState = () => {
  try {
    return JSON.parse(localStorage.getItem(TODO_STATE_KEY) || '{}');
  } catch (error) {
    return {};
  }
};

const writeTodoState = (value) => {
  localStorage.setItem(TODO_STATE_KEY, JSON.stringify(value || {}));
};

const readHistoryFilter = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_FILTER_KEY) || 'null');
    const muscles = Array.isArray(parsed?.muscles)
      ? parsed.muscles.filter((entry) => typeof entry === 'string')
      : [];
    const category = typeof parsed?.category === 'string' ? parsed.category : defaultHistoryFilter.category;
    return { category, muscles };
  } catch (error) {
    return { ...defaultHistoryFilter };
  }
};

const writeHistoryFilter = (value) => {
  localStorage.setItem(HISTORY_FILTER_KEY, JSON.stringify(value || defaultHistoryFilter));
};

const readSettings = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultSettings };

  try {
    const parsed = JSON.parse(raw);
    const normalized = { ...defaultSettings, ...parsed };
    if (typeof parsed.sound === 'boolean' && typeof parsed.sfxEnabled === 'undefined') {
      normalized.sfxEnabled = parsed.sound;
    }
    if (!normalized.timerType) {
      normalized.timerType = normalized.mode || defaultSettings.timerType;
    }
    return normalized;
  } catch (error) {
    console.warn('Failed to parse settings from storage. Falling back to defaults.');
    return { ...defaultSettings };
  }
};

const resolveMaybeAsync = (value, onValue) => {
  if (isPromise(value)) {
    value
      .then((result) => {
        if (typeof onValue === 'function') onValue(result);
      })
      .catch((error) => console.warn('Async persistence operation failed', error));
    return undefined;
  }
  return value;
};

export const createStore = (driver = 'supabase') => {
  const persistence = createPersistence(driver);
  let settings = readSettings();
  const settingsSubscribers = new Set();
  const profileSubscribers = new Set();
  let profile = defaultProfile;
  let history = [];
  let runPlan = {
    questId: null,
    mode: settings.mode,
    trainingSeconds: settings.timerTrainingSeconds,
    restSeconds: settings.timerRestSeconds,
    sets: settings.timerSets,
  };
  let weeklyPlan = {};
  let specialPlans = {};
  let todoState = readTodoState();
  let historyFilter = readHistoryFilter();
  let workoutDatesMonthCache = new Map();
  let timeline = {
    scope: 'following',
    items: [],
    nextBefore: null,
    loading: false,
    error: null,
    loadedOnceByScope: {
      following: false,
      global: false,
    },
    itemsByScope: {
      following: [],
      global: [],
    },
    nextBeforeByScope: {
      following: null,
      global: null,
    },
  };

  const notifySettings = () => {
    settingsSubscribers.forEach((callback) => callback(settings));
  };

  const notifyProfile = () => {
    profileSubscribers.forEach((callback) => callback(profile));
  };

  const applyProfile = (nextProfile) => {
    if (!nextProfile) return;
    profile = { ...defaultProfile, ...nextProfile };
    notifyProfile();
  };

  const applyHistory = (nextHistory) => {
    if (!nextHistory) return;
    history = Array.isArray(nextHistory) ? nextHistory : history;
    notifyProfile();
  };

  const normalizeTimelineItem = (entry = {}) => ({
    runId: entry.runId ?? entry.run_id ?? null,
    userId: entry.userId ?? entry.user_id ?? null,
    authorDisplayName: entry.authorDisplayName ?? entry.author_display_name ?? entry.displayName ?? entry.display_name ?? 'Unknown',
    createdAt: entry.createdAt ?? entry.created_at ?? null,
    publishedAt: entry.publishedAt ?? entry.published_at ?? null,
    visibility: entry.visibility || 'private',
    calories: Number(entry.calories || 0),
    note: entry.note || null,
    result: entry.result || null,
    likeCount: Number(entry.likeCount ?? entry.like_count ?? 0),
    liked: Boolean(entry.liked),
  });

  const deriveNextBefore = (items = []) => {
    if (!Array.isArray(items) || !items.length) return null;
    const last = items[items.length - 1];
    return last?.publishedAt || last?.createdAt || null;
  };

  const applyTimeline = (scope, items = [], options = {}) => {
    const normalizedScope = scope || timeline.scope || 'following';
    const shouldAppend = Boolean(options.append);
    const previousItems = Array.isArray(timeline.itemsByScope?.[normalizedScope])
      ? timeline.itemsByScope[normalizedScope]
      : [];
    const normalizedItems = Array.isArray(items) ? items.map(normalizeTimelineItem) : [];
    const nextItems = shouldAppend
      ? [
        ...previousItems,
        ...normalizedItems.filter((entry) => !previousItems.some((prev) => prev.runId === entry.runId)),
      ]
      : normalizedItems;

    const nextLoaded = {
      following: Boolean(timeline.loadedOnceByScope?.following),
      global: Boolean(timeline.loadedOnceByScope?.global),
      ...(options.loadedOnceByScope || {}),
    };

    if (options.markLoaded) {
      nextLoaded[normalizedScope] = true;
    }

    const nextBefore = shouldAppend
      ? deriveNextBefore(nextItems)
      : (options.nextBefore ?? deriveNextBefore(nextItems));

    timeline = {
      scope: normalizedScope,
      items: nextItems,
      nextBefore,
      loading: typeof options.loading === 'boolean' ? options.loading : timeline.loading,
      error: options.error ?? null,
      loadedOnceByScope: nextLoaded,
      itemsByScope: {
        following: normalizedScope === 'following' ? nextItems : (timeline.itemsByScope?.following || []),
        global: normalizedScope === 'global' ? nextItems : (timeline.itemsByScope?.global || []),
      },
      nextBeforeByScope: {
        following: normalizedScope === 'following' ? nextBefore : (timeline.nextBeforeByScope?.following || null),
        global: normalizedScope === 'global' ? nextBefore : (timeline.nextBeforeByScope?.global || null),
      },
    };
    notifyProfile();
    return timeline;
  };

  const initialProfile = resolveMaybeAsync(persistence.loadProfile(), applyProfile);
  if (initialProfile) {
    profile = { ...defaultProfile, ...initialProfile };
  }

  const initialHistory = resolveMaybeAsync(persistence.loadHistory(), applyHistory);
  if (initialHistory) {
    history = Array.isArray(initialHistory) ? initialHistory : [];
  }

  if (typeof persistence.subscribe === 'function') {
    persistence.subscribe(({ profile: nextProfile, history: nextHistory } = {}) => {
      if (nextProfile) {
        profile = { ...defaultProfile, ...nextProfile };
      }
      if (nextHistory) {
        history = Array.isArray(nextHistory) ? nextHistory : history;
      }
      if (nextProfile || nextHistory) {
        notifyProfile();
      }
    });
  }

  const persistSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  };


  const resolveCurrentUserId = () => profile?.id || defaultProfile.id || 'local-user';

  const clearWorkoutDatesMonthCache = () => {
    workoutDatesMonthCache = new Map();
  };

  const getMonthCacheKey = (userId, year, month) => `${userId}:${year}-${String(month).padStart(2, '0')}`;

  const getSettings = () => settings;

  const updateSettings = (partial) => {
    settings = { ...settings, ...partial };
    persistSettings();
    notifySettings();
  };

  const setRunPlan = (plan) => {
    runPlan = plan;
  };

  const getRunPlan = () => runPlan;

  const rememberPlan = (questId, difficulty, plan) => {
    persistence.saveLastPlan(questId, difficulty, plan);
    runPlan = plan;
  };

  const rememberTimerConfig = (timerConfig) => {
    settings = {
      ...settings,
      timerTrainingSeconds: timerConfig.workSeconds ?? timerConfig.trainingSeconds ?? settings.timerTrainingSeconds,
      timerRestSeconds: timerConfig.restSeconds ?? settings.timerRestSeconds,
      timerSets: timerConfig.sets ?? settings.timerSets,
      timerType: timerConfig.mode || timerConfig.timerType || settings.timerType,
      mode: timerConfig.mode || timerConfig.timerType || settings.mode,
    };
    persistSettings();
    notifySettings();
  };

  const getTimerPreferences = () => ({
    mode: settings.timerType || settings.mode,
    workSeconds: settings.timerTrainingSeconds,
    restSeconds: settings.timerRestSeconds,
    sets: settings.timerSets,
  });

  const getLastPlan = (questId, difficulty) => persistence.getLastPlan(questId, difficulty);

  const getHistoryFilter = () => ({
    category: historyFilter?.category || defaultHistoryFilter.category,
    muscles: Array.isArray(historyFilter?.muscles) ? historyFilter.muscles.slice() : [],
  });

  const setHistoryFilter = (nextFilter = defaultHistoryFilter) => {
    const safeFilter = {
      category: typeof nextFilter?.category === 'string' ? nextFilter.category : defaultHistoryFilter.category,
      muscles: Array.isArray(nextFilter?.muscles)
        ? nextFilter.muscles.filter((entry) => typeof entry === 'string')
        : [],
    };
    historyFilter = safeFilter;
    writeHistoryFilter(safeFilter);
    return getHistoryFilter();
  };

  const getProfile = () => profile;

  const setProfileName = (name) => {
    const result = persistence.updateDisplayName(name);
    const nextProfile = resolveMaybeAsync(result, applyProfile);
    if (nextProfile) {
      applyProfile(nextProfile);
    }
    return nextProfile || profile;
  };


  const saveProfileSettings = (partialProfile = {}) => {
    const mergedProfile = { ...profile, ...partialProfile };
    const result = persistence.updateProfile(profile.id, mergedProfile);
    const nextProfile = resolveMaybeAsync(result, applyProfile);
    if (nextProfile) {
      applyProfile(nextProfile);
      return nextProfile;
    }
    return result || mergedProfile;
  };

  const recordResult = (result) => {
    const taggedResult = decorateResultWithTags(result);
    const calorieResult = calculateCalories(taggedResult, profile);
    const legacyPoints = calculatePoints(taggedResult, profile);
    const enriched = {
      ...taggedResult,
      calories: calorieResult.total,
      breakdown: calorieResult.breakdown,
      points: legacyPoints.total,
      calorieBreakdown: calorieResult.breakdown,
    };
    const resultProfile = resolveMaybeAsync(persistence.recordResult(enriched), applyProfile);
    if (resultProfile) {
      applyProfile(resultProfile);
    }

    const nextHistory = resolveMaybeAsync(persistence.loadHistory(), applyHistory);
    if (nextHistory) {
      applyHistory(nextHistory);
    }
    clearWorkoutDatesMonthCache();
    return enriched;
  };

  const getLeaderboard = (period = 'overall') => persistence.loadLeaderboard(period);

  const getHistory = () => history;

  const getPointSummary = () => ({
    totals: aggregateCalories(history),
    streak: calculateStreak(history),
  });

  const getCalorieSummary = () => ({
    totals: aggregateCalories(history),
    streak: calculateStreak(history),
  });


  const loadWeeklyPlan = (userId) => {
    const result = persistence.getWeeklyPlan(userId);
    return resolveMaybeAsync(result, (next) => {
      weeklyPlan = next || {};
      notifyProfile();
    }) || weeklyPlan;
  };

  const saveWeeklyPlan = (userId, weekday, items) => {
    const result = persistence.setWeeklyPlan(userId, weekday, items);
    const sync = resolveMaybeAsync(result, (savedItems) => {
      weeklyPlan = { ...weeklyPlan, [String(weekday)]: savedItems || [] };
      notifyProfile();
    });
    if (sync) {
      weeklyPlan = { ...weeklyPlan, [String(weekday)]: sync || [] };
      notifyProfile();
    }
    return sync || items;
  };

  const loadSpecialPlan = (userId, date) => {
    const result = persistence.getSpecialPlan(userId, date);
    return resolveMaybeAsync(result, (items) => {
      specialPlans = { ...specialPlans, [date]: items || [] };
      notifyProfile();
    }) || specialPlans[date] || null;
  };

  const saveSpecialPlan = (userId, date, items) => {
    const result = persistence.setSpecialPlan(userId, date, items);
    const sync = resolveMaybeAsync(result, (savedItems) => {
      specialPlans = { ...specialPlans, [date]: savedItems || [] };
      notifyProfile();
    });
    if (sync) {
      specialPlans = { ...specialPlans, [date]: sync || [] };
      notifyProfile();
    }
    return sync || items;
  };

  const getTodayPlan = (userId, now = new Date()) => {
    const weekday = now.getDay();
    const dateKey = now.toISOString().slice(0, 10);
    const special = specialPlans[dateKey];
    const weekly = weeklyPlan[String(weekday)] || [];
    const items = Array.isArray(special) && special.length ? special : weekly;
    return {
      dateKey,
      weekday,
      source: Array.isArray(special) && special.length ? 'special' : 'weekly',
      items,
    };
  };

  const getTodoStateForDate = (dateKey) => todoState[dateKey] || {};

  const setTodoDone = (dateKey, index, done) => {
    const current = { ...(todoState[dateKey] || {}) };
    current[index] = Boolean(done);
    todoState = { ...todoState, [dateKey]: current };
    writeTodoState(todoState);
    notifyProfile();
    return current;
  };



  const upsertBodyMetric = (dateKey, metric = {}) => {
    if (!dateKey) return null;
    const userId = resolveCurrentUserId();
    const payload = { date: dateKey, ...(metric || {}) };
    clearWorkoutDatesMonthCache();
    return persistence.upsertBodyMetric(userId, payload);
  };

  const deleteBodyMetric = (dateKey) => {
    if (!dateKey) return false;
    const userId = resolveCurrentUserId();
    clearWorkoutDatesMonthCache();
    return persistence.deleteBodyMetric(userId, dateKey);
  };

  const getBodyMetricsRange = (fromDateKey = null, toDateKey = null) => {
    const userId = resolveCurrentUserId();
    return persistence.getBodyMetricsRange(userId, fromDateKey, toDateKey);
  };

  const getWorkoutsByDate = (dateKey) => {
    const userId = resolveCurrentUserId();
    return persistence.getWorkoutsByDate(userId, dateKey);
  };

  const listWorkoutDatesInMonth = (year, month) => {
    const userId = resolveCurrentUserId();
    const key = getMonthCacheKey(userId, year, month);
    if (workoutDatesMonthCache.has(key)) {
      return workoutDatesMonthCache.get(key);
    }
    const result = persistence.listWorkoutDatesInMonth(userId, year, month);
    const sync = resolveMaybeAsync(result, (dates) => {
      workoutDatesMonthCache.set(key, Array.isArray(dates) ? dates : []);
    });
    if (sync) {
      workoutDatesMonthCache.set(key, Array.isArray(sync) ? sync : []);
      return workoutDatesMonthCache.get(key);
    }
    return result;
  };

  // backward compatibility for existing UI code
  const getBodyMetrics = () => persistence.loadBodyMetrics(resolveCurrentUserId());

  const saveBodyMetric = (entry = {}) => {
    const dateKey = entry?.date || entry?.dateKey;
    return upsertBodyMetric(dateKey, {
      weight_kg: entry?.weight_kg ?? entry?.weightKg,
      body_fat_pct: entry?.body_fat_pct ?? entry?.bodyFatPct,
      visibility: entry?.visibility,
    });
  };

  const followUser = (followerId, followeeId) => persistence.followUser(followerId, followeeId);

  const unfollowUser = (followerId, followeeId) => persistence.unfollowUser(followerId, followeeId);

  const getFollowing = (userId) => persistence.getFollowing(userId);

  const getFollowers = (userId) => persistence.getFollowers(userId);

  const listVisibleWorkouts = (viewerId, targetUserId) => persistence.listVisibleWorkouts(viewerId, targetUserId);

  const updateWorkoutPost = (runId, updates) => {
    const result = persistence.updateWorkoutPost(runId, updates);
    const sync = resolveMaybeAsync(result, () => {
      const nextHistory = resolveMaybeAsync(persistence.loadHistory(), applyHistory);
      if (nextHistory) applyHistory(nextHistory);
    });
    if (sync) {
      const nextHistory = resolveMaybeAsync(persistence.loadHistory(), applyHistory);
      if (nextHistory) applyHistory(nextHistory);
    }
    return sync || result;
  };


  const fetchTimeline = ({ scope = 'following', limit = 30, before = null, force = false } = {}) => {
    const normalizedScope = scope || 'following';
    const isHeadLoad = before == null;
    const alreadyLoaded = timeline.loadedOnceByScope?.[normalizedScope] === true;

    if (isHeadLoad && !force && alreadyLoaded) {
      return Promise.resolve(applyTimeline(normalizedScope, timeline.itemsByScope?.[normalizedScope] || [], {
        loading: false,
        error: null,
        nextBefore: timeline.nextBeforeByScope?.[normalizedScope] || null,
      }));
    }

    if (isHeadLoad) {
      applyTimeline(normalizedScope, [], {
        loading: true,
        error: null,
      });
    } else {
      applyTimeline(normalizedScope, timeline.itemsByScope?.[normalizedScope] || [], {
        loading: true,
        error: null,
        nextBefore: timeline.nextBeforeByScope?.[normalizedScope] || null,
      });
    }

    return Promise.resolve(persistence.getTimeline({ scope: normalizedScope, limit, before, force }))
      .then((items) => applyTimeline(normalizedScope, items || [], {
        append: !isHeadLoad,
        loading: false,
        error: null,
        markLoaded: isHeadLoad,
      }))
      .catch((error) => {
        const fallbackItems = isHeadLoad ? [] : (timeline.itemsByScope?.[normalizedScope] || []);
        applyTimeline(normalizedScope, fallbackItems, {
          loading: false,
          error: error?.message || 'タイムライン取得に失敗しました。',
          nextBefore: timeline.nextBeforeByScope?.[normalizedScope] || null,
        });
        throw error;
      });
  };

  const toggleLike = (runId) => {
    if (!runId) return { runId, liked: false, likeCount: 0 };

    const previous = timeline.items.slice();
    const idx = previous.findIndex((item) => item.runId === runId);

    if (idx >= 0) {
      const target = previous[idx];
      const optimisticLiked = !target.liked;
      const optimisticCount = Math.max(0, Number(target.likeCount || 0) + (optimisticLiked ? 1 : -1));
      const optimisticItems = previous.slice();
      optimisticItems[idx] = { ...target, liked: optimisticLiked, likeCount: optimisticCount };
      applyTimeline(timeline.scope, optimisticItems);
    }

    const result = persistence.toggleLike(runId);
    const sync = resolveMaybeAsync(result, (next) => {
      if (!next) return;
      const targetIndex = timeline.items.findIndex((item) => item.runId === runId);
      if (targetIndex < 0) return;
      const items = timeline.items.slice();
      items[targetIndex] = {
        ...items[targetIndex],
        liked: Boolean(next.liked),
        likeCount: Number(next.likeCount ?? items[targetIndex].likeCount ?? 0),
      };
      applyTimeline(timeline.scope, items);
    });

    if (sync) {
      const targetIndex = timeline.items.findIndex((item) => item.runId === runId);
      if (targetIndex >= 0) {
        const items = timeline.items.slice();
        items[targetIndex] = {
          ...items[targetIndex],
          liked: Boolean(sync.liked),
          likeCount: Number(sync.likeCount ?? items[targetIndex].likeCount ?? 0),
        };
        applyTimeline(timeline.scope, items);
      }
      return sync;
    }

    return { runId, liked: idx >= 0 ? !previous[idx].liked : false, likeCount: idx >= 0 ? Math.max(0, Number(previous[idx].likeCount || 0) + (!previous[idx].liked ? 1 : -1)) : 0 };
  };

  const getTimelineState = () => timeline;

  const subscribeSettings = (callback) => {
    settingsSubscribers.add(callback);
    return () => settingsSubscribers.delete(callback);
  };

  const subscribeProfile = (callback) => {
    profileSubscribers.add(callback);
    return () => profileSubscribers.delete(callback);
  };

  return {
    getSettings,
    updateSettings,
    subscribe: subscribeSettings,
    setRunPlan,
    getRunPlan,
    getHistoryFilter,
    setHistoryFilter,
    rememberPlan,
    rememberTimerConfig,
    getLastPlan,
    getProfile,
    setProfileName,
    saveProfileSettings,
    recordResult,
    getLeaderboard,
    subscribeProfile,
    getHistory,
    getPointSummary,
    getCalorieSummary,
    loadWeeklyPlan,
    saveWeeklyPlan,
    loadSpecialPlan,
    saveSpecialPlan,
    getTodayPlan,
    getTodoStateForDate,
    setTodoDone,
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers,
    listVisibleWorkouts,
    updateWorkoutPost,
    fetchTimeline,
    toggleLike,
    getTimelineState,
    getTimerPreferences,
    upsertBodyMetric,
    deleteBodyMetric,
    getBodyMetricsRange,
    getWorkoutsByDate,
    listWorkoutDatesInMonth,
    getBodyMetrics,
    saveBodyMetric,
  };
};
