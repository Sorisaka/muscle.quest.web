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
  language: 'ja',
  difficulty: 'beginner',
  sfxEnabled: true,
  sfxVolume: 0.6,
  timerTrainingSeconds: trainingConfig.defaults.timerTrainingSeconds,
  timerRestSeconds: trainingConfig.defaults.timerRestSeconds,
  timerSets: trainingConfig.defaults.timerSets,
  mode: trainingConfig.defaults.mode,
  timerType: trainingConfig.defaults.timerType,
  timeMode: trainingConfig.defaults.timeMode,
};

const defaultProfile = {
  id: 'local-user',
  displayName: 'ゲスト',
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
    if (normalized.timerType === 'stopwatch') normalized.timerType = 'time';
    if (normalized.mode === 'stopwatch') normalized.mode = 'time';
    if (normalized.timerType === 'hold') normalized.timerType = 'time';
    if (normalized.mode === 'hold') normalized.mode = 'time';
    if (normalized.timeMode === 'hold') normalized.timeMode = 'intervalTimer';
    normalized.timeMode = normalized.timeMode || (parsed.timerType === 'stopwatch' || parsed.mode === 'stopwatch' ? 'stopwatch' : parsed.timerType === 'hold' || parsed.mode === 'hold' ? 'intervalTimer' : defaultSettings.timeMode);
    normalized.language = 'ja';
    return normalized;
  } catch (error) {
    console.warn('設定データの解析に失敗したため、初期値に戻します。');
    return { ...defaultSettings };
  }
};

const resolveMaybeAsync = (value, onValue) => {
  if (isPromise(value)) {
    value
      .then((result) => {
        if (typeof onValue === 'function') onValue(result);
      })
      .catch((error) => console.warn('非同期保存処理に失敗しました', error));
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

  let notifications = {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
    lastFetchedAt: null,
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
    authorDisplayName: entry.authorDisplayName ?? entry.author_display_name ?? entry.displayName ?? entry.display_name ?? '不明',
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
    settings = { ...settings, ...partial, language: 'ja' };
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
      timeMode: timerConfig.timeMode || settings.timeMode,
    };
    persistSettings();
    notifySettings();
  };

  const getTimerPreferences = () => ({
    mode: settings.timerType || settings.mode,
    timeMode: settings.timeMode || trainingConfig.defaults.timeMode,
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


  const refreshProfile = () => {
    const result = persistence.loadProfile();
    const sync = resolveMaybeAsync(result, applyProfile);
    if (sync) applyProfile(sync);
    return sync || profile;
  };

  const refreshSocialGraph = () => {
    notifyProfile();
  };

  const setProfileName = (name) => {
    const result = persistence.updateDisplayName(name);
    const nextProfile = resolveMaybeAsync(result, applyProfile);
    if (nextProfile) {
      applyProfile(nextProfile);
      refreshSocialGraph();
    }
    if (!nextProfile) refreshProfile();
    return nextProfile || profile;
  };


  const saveProfileSettings = (partialProfile = {}) => {
    const mergedProfile = { ...profile, ...partialProfile };
    const result = persistence.updateProfile(profile.id, mergedProfile);
    const nextProfile = resolveMaybeAsync(result, applyProfile);
    if (nextProfile) {
      applyProfile(nextProfile);
      refreshSocialGraph();
      return nextProfile;
    }
    refreshProfile();
    refreshSocialGraph();
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
    const sync = resolveMaybeAsync(result, (next) => {
      weeklyPlan = next || {};
      notifyProfile();
    });
    if (sync) {
      weeklyPlan = sync || {};
      notifyProfile();
    }
    return sync || weeklyPlan;
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
    const sync = resolveMaybeAsync(result, (items) => {
      specialPlans = { ...specialPlans, [date]: items || [] };
      notifyProfile();
    });
    if (typeof sync !== 'undefined') {
      specialPlans = { ...specialPlans, [date]: sync || [] };
      notifyProfile();
    }
    return typeof sync !== 'undefined' ? sync : (specialPlans[date] || null);
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
    const weight = metric?.weight_kg ?? metric?.weightKg ?? null;
    const bodyFat = metric?.body_fat_pct ?? metric?.bodyFatPct ?? null;
    if (weight == null && bodyFat == null) {
      return { ok: false, code: 'BODY_METRIC_EMPTY_NOT_ALLOWED' };
    }
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

  const followUser = (followerId, followeeId) => {
    const result = persistence.followUser(followerId, followeeId);
    const sync = resolveMaybeAsync(result, (value) => {
      refreshProfile();
      refreshSocialGraph();
      return value;
    });
    if (sync) {
      refreshProfile();
      refreshSocialGraph();
    }
    return sync || result;
  };

  const unfollowUser = (followerId, followeeId) => {
    const result = persistence.unfollowUser(followerId, followeeId);
    const sync = resolveMaybeAsync(result, (value) => {
      refreshProfile();
      refreshSocialGraph();
      return value;
    });
    if (sync) {
      refreshProfile();
      refreshSocialGraph();
    }
    return sync || result;
  };

  const requestFollow = (requesterId, targetId) => {
    const result = persistence.requestFollow(requesterId, targetId);
    const sync = resolveMaybeAsync(result, (value) => {
      refreshSocialGraph();
      return value;
    });
    if (sync) refreshSocialGraph();
    return sync || result;
  };

  const cancelFollowRequest = (requesterId, targetId) => {
    const result = persistence.cancelFollowRequest(requesterId, targetId);
    const sync = resolveMaybeAsync(result, (value) => {
      refreshSocialGraph();
      return value;
    });
    if (sync) refreshSocialGraph();
    return sync || result;
  };

  const respondFollowRequest = (targetId, requesterId, action) => {
    const result = persistence.respondFollowRequest(targetId, requesterId, action);
    const sync = resolveMaybeAsync(result, (value) => {
      refreshProfile();
      refreshSocialGraph();
      return value;
    });
    if (sync) {
      refreshProfile();
      refreshSocialGraph();
    }
    return sync || result;
  };

  const getFollowState = (viewerId, targetId) => persistence.getFollowState(viewerId, targetId);

  const listFollowRequests = (userId, direction = 'incoming') => persistence.listFollowRequests(userId, direction);

  const searchAccounts = (query = '', viewerId = null, limit = 20) => persistence.searchAccounts(query, viewerId, limit);

  const getFollowCounts = (userId) => persistence.getFollowCounts(userId);

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




  const applyNotificationState = (items = [], extra = {}) => {
    const unreadCount = (Array.isArray(items) ? items : []).filter((entry) => !entry?.read_at).length;
    notifications = {
      ...notifications,
      items: Array.isArray(items) ? items : [],
      unreadCount,
      loading: false,
      error: null,
      lastFetchedAt: new Date().toISOString(),
      ...extra,
    };
    notifyProfile();
    return notifications;
  };

  const fetchNotificationUnreadCount = ({ force = false } = {}) => {
    if (!force && notifications.lastFetchedAt) {
      return Promise.resolve(notifications.unreadCount);
    }
    return Promise.resolve(persistence.getUnreadNotificationCount(resolveCurrentUserId()))
      .then((count) => {
        notifications = {
          ...notifications,
          unreadCount: Math.max(Number(count) || 0, 0),
          error: null,
        };
        notifyProfile();
        return notifications.unreadCount;
      })
      .catch((error) => {
        notifications = {
          ...notifications,
          error: error?.message || '通知件数の取得に失敗しました。',
        };
        notifyProfile();
        throw error;
      });
  };

  const markAllNotificationsRead = () => Promise.resolve(persistence.markAllNotificationsRead(resolveCurrentUserId()))
    .then(() => {
      const now = new Date().toISOString();
      notifications = {
        ...notifications,
        unreadCount: 0,
        items: (notifications.items || []).map((entry) => ({ ...entry, read_at: entry.read_at || now })),
      };
      notifyProfile();
      return notifications;
    });

  const fetchNotifications = ({ limit = 30, before = null, force = false } = {}) => {
    if (!force && notifications.lastFetchedAt && notifications.items.length && !before) {
      return Promise.resolve(notifications);
    }
    notifications = { ...notifications, loading: true, error: null };
    notifyProfile();
    return Promise.resolve(persistence.listNotifications(resolveCurrentUserId(), limit, before))
      .then((items) => applyNotificationState(items || []))
      .catch((error) => {
        notifications = {
          ...notifications,
          loading: false,
          error: error?.message || '通知取得に失敗しました。',
        };
        notifyProfile();
        throw error;
      });
  };

  const getNotificationState = () => notifications;

  const getLikeCountsByWorkoutRunIds = (runIds = []) => Promise.resolve(persistence.getTimelineLikeSummaries(runIds || []));

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
      .then(async (items) => {
        const timelineItems = Array.isArray(items) ? items : [];
        const runIds = timelineItems.map((entry) => entry?.runId || entry?.run_id).filter(Boolean);
        let likeMap = new Map();
        if (runIds.length) {
          const likeRows = await Promise.resolve(persistence.getTimelineLikeSummaries(runIds));
          likeMap = new Map((likeRows || []).map((row) => [String(row.runId || row.run_id), row]));
        }
        const merged = timelineItems.map((entry) => {
          const key = String(entry?.runId || entry?.run_id || '');
          const like = likeMap.get(key);
          if (!like) return entry;
          return {
            ...entry,
            liked: Boolean(like.liked),
            likeCount: Number(like.likeCount ?? 0),
          };
        });
        return applyTimeline(normalizedScope, merged, {
          append: !isHeadLoad,
          loading: false,
          error: null,
          markLoaded: isHeadLoad,
        });
      })
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

  const applyLikeResultToTimeline = (runId, likeResult = {}) => {
    const normalizedRunId = Number(runId);
    if (!Number.isFinite(normalizedRunId) || normalizedRunId <= 0) return;

    const nextLiked = Boolean(likeResult.liked);
    const nextLikeCount = Math.max(0, Number(likeResult.likeCount ?? 0));

    const patchItems = (items = []) => {
      if (!Array.isArray(items)) return [];
      return items.map((item) => {
        if (Number(item?.runId) !== normalizedRunId) return item;
        return {
          ...item,
          liked: nextLiked,
          likeCount: nextLikeCount,
        };
      });
    };

    const nextItemsByScope = {
      following: patchItems(timeline.itemsByScope?.following || []),
      global: patchItems(timeline.itemsByScope?.global || []),
    };

    const activeScope = timeline.scope || 'following';
    timeline = {
      ...timeline,
      itemsByScope: nextItemsByScope,
      items: patchItems(nextItemsByScope[activeScope] || []),
    };

    notifyProfile();
  };

  const toggleLike = (runId) => {
    if (!runId) return Promise.resolve({ runId, liked: false, likeCount: 0 });

    return Promise.resolve(persistence.toggleLike(runId)).then((next) => {
      if (!next) return { runId, liked: false, likeCount: 0 };
      applyLikeResultToTimeline(runId, next);
      return next;
    });
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
    fetchTimeline,
    toggleLike,
    getTimelineState,
    getLikeCountsByWorkoutRunIds,
    fetchNotificationUnreadCount,
    fetchNotifications,
    getNotificationState,
    markAllNotificationsRead,
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
