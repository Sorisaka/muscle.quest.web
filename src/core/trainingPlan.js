import { trainingDefinitions } from '../data/trainingDefinitions.js';
import { trainingConfig } from '../data/trainingConfig.js';

const clampNumber = (value, min, max) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  if (min == null && max == null) return numeric;
  if (min == null) return Math.min(max, numeric);
  if (max == null) return Math.max(min, numeric);
  return Math.max(min, Math.min(max, numeric));
};

const normalizeInputMode = (mode) => {
  if (mode === 'hold' || mode === 'stopwatch') return 'time';
  return mode;
};

const normalizeTimerMode = (mode, inputMode) => {
  const normalized = mode === 'stopwatch' ? 'time' : mode;
  if (normalized === 'interval' || normalized === 'time' || normalized === 'setRest') return normalized;
  return inputMode === 'time' ? 'time' : 'setRest';
};

const normalizeTimeMode = (mode, fallback = trainingConfig.defaults.timeMode) => {
  const aliases = {
    stopwatch: 'stopwatch',
    timer: 'timer',
    intervalTimer: 'intervalTimer',
    intervalStopwatch: 'intervalStopwatch',
    interval: 'intervalTimer',
    setRest: 'intervalStopwatch',
    hold: 'intervalTimer',
  };
  return aliases[mode] || aliases[fallback] || 'stopwatch';
};

const resolveInputMode = (definition = {}) => {
  if (definition.inputMode) return normalizeInputMode(definition.inputMode);
  return definition.unit === 'time' ? 'time' : 'weightReps';
};

const clampSet = (inputMode, set = {}, limits = {}) => {
  if (inputMode === 'time') {
    const safeTime = clampNumber(set.timeSeconds ?? limits.timeSeconds?.min ?? 0, limits.timeSeconds?.min, limits.timeSeconds?.max);
    return { timeSeconds: safeTime };
  }
  if (inputMode === 'reps') {
    const safeReps = clampNumber(set.reps ?? limits.reps?.min ?? 0, limits.reps?.min, limits.reps?.max);
    return { reps: safeReps };
  }
  if (inputMode === 'weightReps') {
    const safeWeight = clampNumber(set.weight ?? limits.weight?.min ?? 0, limits.weight?.min, limits.weight?.max);
    const safeReps = clampNumber(set.reps ?? limits.reps?.min ?? 0, limits.reps?.min, limits.reps?.max);
    return { weight: safeWeight, reps: safeReps };
  }
  return {};
};

const buildSets = (inputMode, desiredCount, templateSets, limits) => {
  if (inputMode === 'time') return [];
  const safeCount = Math.max(1, Math.min(desiredCount, 50));
  const sets = [];
  for (let i = 0; i < safeCount; i += 1) {
    const template = templateSets[i] || templateSets[templateSets.length - 1] || {};
    sets.push(clampSet(inputMode, template, limits));
  }
  return sets;
};

const resolveMetricGoals = (previousPlan = {}, goalConfig = null) => {
  if (!goalConfig || goalConfig.type !== 'distance') return null;
  const previousDistance = previousPlan?.metricGoals?.distanceMeters ?? previousPlan?.distanceMeters;
  const fallback = goalConfig.defaultValue ?? goalConfig.min ?? 0;
  return {
    distanceMeters: clampNumber(previousDistance ?? fallback, goalConfig.min, goalConfig.max),
  };
};

export const getDefinitionForQuest = (quest) => {
  const slug = quest?.exercises?.[0];
  if (!slug) return undefined;
  return trainingDefinitions[slug];
};

export const createPlanFromDefinition = (quest, difficulty, previousPlan) => {
  const definition = getDefinitionForQuest(quest);
  if (!definition) {
    return {
      questId: quest?.id,
      exerciseSlug: quest?.exercises?.[0] || 'custom',
      difficulty,
      inputMode: 'time',
      defaultTimerMode: 'time',
      timeMode: 'intervalTimer',
      trackingMetrics: [],
      goalConfig: null,
      metricGoals: null,
      unit: 'time',
      mode: 'time',
      restSeconds: trainingConfig.defaults.timerRestSeconds,
      trainingSeconds: trainingConfig.defaults.timerTrainingSeconds,
      sets: [],
      baseSets: trainingConfig.defaults.timerSets,
      maxSets: trainingConfig.limits.sets.max,
      limits: trainingConfig.limits,
      description: 'デフォルト設定が見つからなかったため、共通タイマー設定で実行します。',
    };
  }

  const diffConfig = definition.difficulties[difficulty] || definition.difficulties.beginner;
  const inputMode = resolveInputMode(definition);
  const sourceSets = previousPlan?.sets?.length ? previousPlan.sets : diffConfig.defaultSets;
  const desiredCount = previousPlan?.sets?.length || sourceSets?.length || 1;
  const sets = buildSets(inputMode, desiredCount, sourceSets, diffConfig.limits || {});
  const baseSets = inputMode === 'time' ? 1 : (diffConfig.defaultSets?.length || 1);

  const fallbackMode = inputMode === 'time' ? 'time' : 'setRest';
  const rawMode = definition.defaultTimerMode || previousPlan?.mode || fallbackMode;
  const mode = normalizeTimerMode(rawMode, inputMode);
  const restSeconds = diffConfig.restSeconds || definition.restSeconds || trainingConfig.defaults.timerRestSeconds;
  const goalConfig = definition.goalConfig || null;
  const defaultTimeMode = normalizeTimeMode(
    definition.defaultTimeMode || previousPlan?.timeMode || (rawMode === 'interval' ? 'intervalTimer' : rawMode === 'setRest' ? 'intervalStopwatch' : 'stopwatch'),
    trainingConfig.defaults.timeMode,
  );

  return {
    questId: quest?.id,
    exerciseSlug: definition.id,
    difficulty,
    inputMode,
    defaultTimerMode: mode,
    defaultTimeMode,
    timeMode: defaultTimeMode,
    trackingMetrics: Array.isArray(definition.trackingMetrics) ? definition.trackingMetrics : [],
    goalConfig,
    metricGoals: resolveMetricGoals(previousPlan, goalConfig),
    unit: definition.unit,
    mode,
    restSeconds,
    trainingSeconds: trainingConfig.defaults.timerTrainingSeconds,
    sets,
    baseSets,
    maxSets: diffConfig.maxSets,
    limits: diffConfig.limits,
    points: diffConfig.points,
    description: diffConfig.howto || definition.description,
    baseDefinition: diffConfig.defaultSets,
  };
};
