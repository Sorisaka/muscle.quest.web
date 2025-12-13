import { trainingDefinitions } from '../data/trainingDefinitions.js';

const getDefinition = (exerciseSlug, difficulty) => {
  const definition = trainingDefinitions[exerciseSlug];
  if (!definition) return null;
  return { definition, config: definition.difficulties[difficulty] || definition.difficulties.beginner };
};

const volumeFromSets = (unit, sets) => {
  if (!Array.isArray(sets)) return 0;
  return sets.reduce((total, set) => {
    if (unit === 'time') {
      const seconds = Number(set.timeSeconds || 0);
      return total + Math.max(seconds, 0);
    }
    const weight = Number(set.weight || 0);
    const reps = Number(set.reps || 0);
    return total + Math.max(weight * reps, 0);
  }, 0);
};

export const calculatePoints = (result) => {
  const lookup = getDefinition(result.exerciseSlug, result.difficulty);
  if (!lookup) {
    return { total: 0, breakdown: { note: 'ポイント計算の対象設定が見つかりませんでした。' } };
  }

  const { definition, config } = lookup;
  const unit = definition.unit;
  const baseVolume = volumeFromSets(unit, config.defaultSets);
  const actualVolume = volumeFromSets(unit, result.sets || config.defaultSets);
  const completedSets = Array.isArray(result.sets) ? result.sets.length : config.defaultSets.length;
  const baseSets = config.defaultSets.length;

  const base = config.points.base;
  const challengeVolume = Math.max(actualVolume - baseVolume, 0);
  const challengePoints = challengeVolume * (config.points.perWork || 0);
  const setBonus = Math.max(completedSets - baseSets, 0) * (config.points.setBonus || 0);
  const completionBonus = (result.finished ? config.points.completion : 0) || 0;

  const advancedBoost = result.difficulty === 'advanced' ? actualVolume * (config.points.challengeScale || 0) : 0;
  const total = Math.max(Math.round(base + challengePoints + setBonus + completionBonus + advancedBoost), 0);

  return {
    total,
    breakdown: {
      unit,
      base,
      challengePoints,
      setBonus,
      completionBonus,
      advancedBoost,
      baseVolume,
      actualVolume,
    },
  };
};
