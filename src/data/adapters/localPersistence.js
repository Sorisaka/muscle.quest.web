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

  const loadLeaderboard = () => {
    const profile = loadProfile();
    const bots = [
      { id: 'atlas', displayName: 'Atlas', points: 3200 },
      { id: 'valkyrie', displayName: 'Valkyrie', points: 2500 },
      { id: 'nova', displayName: 'Nova', points: 1800 },
    ];
    const entries = [...bots, profile];
    return entries
      .map((entry) => ({ ...entry, points: Math.max(entry.points || 0, 0) }))
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
  };
};
