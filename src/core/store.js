import { trainingConfig } from '../data/trainingConfig.js';
import { createPersistence } from '../data/persistence.js';
import { calculatePoints } from './points.js';
import { aggregatePoints, calculateStreak } from './history.js';

const STORAGE_KEY = 'musclequest:settings';

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
  points: 0,
  completedRuns: 0,
  lastResult: null,
};

const isPromise = (value) => value && typeof value.then === 'function';

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

  const getProfile = () => profile;

  const setProfileName = (name) => {
    const result = persistence.updateDisplayName(name);
    const nextProfile = resolveMaybeAsync(result, applyProfile);
    if (nextProfile) {
      applyProfile(nextProfile);
    }
    return nextProfile || profile;
  };

  const recordResult = (result) => {
    const pointsResult = calculatePoints(result);
    const enriched = { ...result, points: pointsResult.total, breakdown: pointsResult.breakdown };
    const resultProfile = resolveMaybeAsync(persistence.recordResult(enriched), applyProfile);
    if (resultProfile) {
      applyProfile(resultProfile);
    }

    const nextHistory = resolveMaybeAsync(persistence.loadHistory(), applyHistory);
    if (nextHistory) {
      applyHistory(nextHistory);
    }
    return enriched;
  };

  const getLeaderboard = (period = 'overall') => persistence.loadLeaderboard(period);

  const getHistory = () => history;

  const getPointSummary = () => ({
    totals: aggregatePoints(history),
    streak: calculateStreak(history),
  });

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
    rememberPlan,
    rememberTimerConfig,
    getLastPlan,
    getProfile,
    setProfileName,
    recordResult,
    getLeaderboard,
    subscribeProfile,
    getHistory,
    getPointSummary,
    getTimerPreferences,
  };
};
