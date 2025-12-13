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

const clampSet = (unit, set, limits) => {
  if (unit === 'time') {
    const safeTime = clampNumber(set.timeSeconds ?? limits.timeSeconds?.min ?? 0, limits.timeSeconds?.min, limits.timeSeconds?.max);
    return { timeSeconds: safeTime };
  }
  const safeWeight = clampNumber(set.weight ?? limits.weight?.min ?? 0, limits.weight?.min, limits.weight?.max);
  const safeReps = clampNumber(set.reps ?? limits.reps?.min ?? 0, limits.reps?.min, limits.reps?.max);
  return { weight: safeWeight, reps: safeReps };
};

const buildSets = (unit, desiredCount, templateSets, limits) => {
  const safeCount = Math.max(1, Math.min(desiredCount, 50));
  const sets = [];
  for (let i = 0; i < safeCount; i += 1) {
    const template = templateSets[i] || templateSets[templateSets.length - 1] || {};
    sets.push(clampSet(unit, template, limits));
  }
  return sets;
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
      unit: 'time',
      mode: 'interval',
      restSeconds: trainingConfig.defaults.timerRestSeconds,
      trainingSeconds: trainingConfig.defaults.timerTrainingSeconds,
      sets: buildSets('time', trainingConfig.defaults.timerSets, [{ timeSeconds: trainingConfig.defaults.timerTrainingSeconds }], {
        timeSeconds: trainingConfig.limits.trainingSeconds,
      }),
      baseSets: trainingConfig.defaults.timerSets,
      maxSets: trainingConfig.limits.sets.max,
      limits: trainingConfig.limits,
      description: 'デフォルト設定が見つからなかったため、共通タイマー設定で実行します。',
    };
  }

  const diffConfig = definition.difficulties[difficulty] || definition.difficulties.beginner;
  const sourceSets = previousPlan?.sets?.length ? previousPlan.sets : diffConfig.defaultSets;
  const desiredCount = previousPlan?.sets?.length || sourceSets.length;
  const sets = buildSets(definition.unit, desiredCount, sourceSets, diffConfig.limits || {});
  const baseSets = diffConfig.defaultSets.length;

  const primaryTime = definition.unit === 'time' ? sets[0].timeSeconds : trainingConfig.defaults.timerTrainingSeconds;
  const mode = definition.unit === 'time' ? 'interval' : 'stopwatch';
  const restSeconds = diffConfig.restSeconds || definition.restSeconds || trainingConfig.defaults.timerRestSeconds;

  return {
    questId: quest?.id,
    exerciseSlug: definition.id,
    difficulty,
    unit: definition.unit,
    mode,
    restSeconds,
    trainingSeconds: primaryTime,
    sets,
    baseSets,
    maxSets: diffConfig.maxSets,
    limits: diffConfig.limits,
    points: diffConfig.points,
    description: diffConfig.howto || definition.description,
    baseDefinition: diffConfig.defaultSets,
  };
};
