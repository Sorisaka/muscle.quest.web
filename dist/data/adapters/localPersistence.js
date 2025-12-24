import { aggregatePoints } from '../../core/history.js';

const PROFILE_KEY = 'musclequest:profile';
const HISTORY_KEY = 'musclequest:history';
const LAST_PLAN_KEY = 'musclequest:lastPlans';

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
  points: 0,
  completedRuns: 0,
  lastResult: null,
};

export const createLocalPersistence = () => {
  const loadProfile = () => readJson(PROFILE_KEY, { ...defaultProfile });
  const loadHistory = () => readJson(HISTORY_KEY, []);
  const loadLastPlans = () => readJson(LAST_PLAN_KEY, {});

  const replaceProfile = (nextProfile) => {
    const safeProfile = { ...defaultProfile, ...(nextProfile || {}) };
    writeJson(PROFILE_KEY, safeProfile);
    return safeProfile;
  };

  const replaceHistory = (entries = []) => {
    const safeHistory = Array.isArray(entries) ? entries.slice(0, 100) : [];
    writeJson(HISTORY_KEY, safeHistory);
    return safeHistory;
  };

  const saveProfile = (profile) => {
    writeJson(PROFILE_KEY, profile);
  };

  const saveLastPlan = (questId, difficulty, plan) => {
    if (!questId || !difficulty) return plan;
    const plans = loadLastPlans();
    const key = `${questId}:${difficulty}`;
    plans[key] = { ...plan };
    writeJson(LAST_PLAN_KEY, plans);
    return plan;
  };

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
    const nextProfile = {
      ...profile,
      points: profile.points + result.points,
      completedRuns: profile.completedRuns + 1,
      lastResult: { ...result, recordedAt: timestamp },
    };

    history.unshift({
      questId: result.questId,
      exerciseSlug: result.exerciseSlug,
      points: result.points,
      mode: result.mode,
      difficulty: result.difficulty,
      sets: result.sets,
      startTime: result.startTime,
      endTime: result.endTime,
      timestamp,
    });

    writeJson(PROFILE_KEY, nextProfile);
    writeJson(HISTORY_KEY, history.slice(0, 100));
    if (result.questId && result.difficulty && result.plan) {
      saveLastPlan(result.questId, result.difficulty, result.plan);
    }
    return nextProfile;
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
    const totals = aggregatePoints(history);
    const bots = [
      { id: 'atlas', displayName: 'Atlas', points: 3200, daily: 140, weekly: 860, monthly: 2100 },
      { id: 'valkyrie', displayName: 'Valkyrie', points: 2500, daily: 110, weekly: 640, monthly: 1600 },
      { id: 'nova', displayName: 'Nova', points: 1800, daily: 80, weekly: 420, monthly: 1100 },
    ];
    const getPeriodPoints = (entry) => {
      if (entry.id === profile.id) {
        if (period === 'daily') return totals.daily || 0;
        if (period === 'weekly') return totals.weekly || 0;
        if (period === 'monthly') return totals.monthly || 0;
      }
      if (period === 'daily') return entry.daily ?? entry.points ?? 0;
      if (period === 'weekly') return entry.weekly ?? entry.points ?? 0;
      if (period === 'monthly') return entry.monthly ?? entry.points ?? 0;
      return entry.points || 0;
    };

    const entries = [...bots, profile];
    return entries
      .map((entry) => ({ ...entry, points: Math.max(getPeriodPoints(entry), 0) }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);
  };

  return {
    loadProfile,
    saveProfile,
    recordResult,
    updateDisplayName,
    loadLeaderboard,
    loadHistory,
    saveLastPlan,
    getLastPlan,
    replaceHistory,
    replaceProfile,
  };
};
