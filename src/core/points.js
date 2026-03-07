import { trainingDefinitions } from '../data/trainingDefinitions.js';
import { MET_CALCULATION } from './calorie/constants.js';
import { applyAutoProfileEstimation } from './calorie/estimateProfile.js';
import { getBodyweightMet, getCardioMet, getResistanceMet, getSpeedIntensity } from './calorie/metTable.js';

const WEIGHT_DEFAULT_KG = 60;

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const getExerciseDefinition = (exerciseSlug) => trainingDefinitions[exerciseSlug] || null;

const resolveDurationSeconds = (result = {}) => {
  const start = toNumber(result.startTime, 0);
  const end = toNumber(result.endTime, 0);
  if (start > 0 && end > start) {
    return Math.max(Math.round((end - start) / 1000), 0);
  }
  if (toNumber(result.elapsedSeconds, 0) > 0) {
    return Math.max(Math.round(toNumber(result.elapsedSeconds, 0)), 0);
  }
  if (toNumber(result.trainingSeconds, 0) > 0) {
    return Math.max(Math.round(toNumber(result.trainingSeconds, 0)), 0);
  }
  if (!Array.isArray(result.sets)) return 0;
  return result.sets.reduce((total, set) => total + Math.max(toNumber(set.timeSeconds, 0), 0), 0);
};

const inferIntensity = (result, volumeScore) => {
  const explicit = result.intensity || result.effort;
  if (['light', 'moderate', 'vigorous'].includes(explicit)) return explicit;
  if (result.difficulty === 'advanced') return 'vigorous';
  if (result.difficulty === 'intermediate') return 'moderate';
  if (volumeScore >= 1800) return 'vigorous';
  if (volumeScore >= 600) return 'moderate';
  return 'light';
};

const deriveMovementType = (exerciseSlug, mode) => {
  const slug = String(exerciseSlug || '').toLowerCase();
  if (slug.includes('run') || slug.includes('jog')) return 'cardio-run';
  if (slug.includes('cycl')) return 'cardio-cycle';
  if (slug.includes('walk')) return 'cardio-walk';
  if (mode === 'interval' || slug.includes('climber') || slug.includes('burpee')) return 'bodyweight';
  return 'resistance';
};

const computeVolumeScore = (inputMode, sets = []) => {
  if (!Array.isArray(sets)) return 0;
  if (inputMode === 'time') {
    return sets.reduce((sum, set) => sum + Math.max(toNumber(set.timeSeconds, 0), 0), 0);
  }
  if (inputMode === 'reps') {
    return sets.reduce((sum, set) => sum + Math.max(toNumber(set.reps, 0), 0), 0);
  }
  if (inputMode === 'weightReps') {
    return sets.reduce((sum, set) => {
      const weight = Math.max(toNumber(set.weight, 0), 0);
      const reps = Math.max(toNumber(set.reps, 0), 0);
      return sum + weight * reps;
    }, 0);
  }
  return 0;
};

const computeSpeedKmh = ({ seconds, result, profile }) => {
  if (!seconds) return null;
  const distanceMeters = toNumber(result.distanceMeters, 0);
  if (distanceMeters > 0) {
    const speedKmh = (distanceMeters / 1000) / (seconds / 3600);
    return Number.isFinite(speedKmh) ? speedKmh : null;
  }
  const steps = toNumber(result.steps, 0);
  const stepLengthM = toNumber(profile.step_length_m, 0);
  if (!steps || !stepLengthM) return null;
  const speedKmh = (stepLengthM * steps / seconds) * 3.6;
  return Number.isFinite(speedKmh) ? speedKmh : null;
};

const resolveMet = ({ movementType, intensity, speedKmh }) => {
  if (movementType === 'cardio-run') {
    const derived = getSpeedIntensity(speedKmh || 0, 'run');
    return { met: getCardioMet('run', speedKmh ? derived : intensity), intensity: speedKmh ? derived : intensity };
  }

  if (movementType === 'cardio-walk') {
    const derived = getSpeedIntensity(speedKmh || 0, 'walk');
    return { met: getCardioMet('walk', speedKmh ? derived : intensity), intensity: speedKmh ? derived : intensity };
  }

  if (movementType === 'cardio-cycle') {
    const derived = getSpeedIntensity(speedKmh || 0, 'cycle');
    return { met: getCardioMet('cycle', speedKmh ? derived : intensity), intensity: speedKmh ? derived : intensity };
  }

  if (movementType === 'bodyweight') {
    return { met: getBodyweightMet(intensity), intensity };
  }

  return { met: getResistanceMet(intensity), intensity };
};

export const calculateCalories = (result = {}, userProfile = {}) => {
  const definition = getExerciseDefinition(result.exerciseSlug);
  const inputMode = definition?.inputMode || (definition?.unit === 'time' ? 'time' : 'weightReps');
  const normalizedProfile = applyAutoProfileEstimation(userProfile, userProfile);
  const weightKg = Math.max(toNumber(normalizedProfile.weight_kg, WEIGHT_DEFAULT_KG), 1);
  const seconds = resolveDurationSeconds(result);
  const minutes = seconds / 60;
  const volumeScore = computeVolumeScore(inputMode, result.sets || []);
  const movementType = deriveMovementType(result.exerciseSlug, result.mode);
  const intensity = inferIntensity(result, volumeScore);
  const speedKmh = computeSpeedKmh({ seconds, result, profile: normalizedProfile });
  const { met, intensity: resolvedIntensity } = resolveMet({ movementType, intensity, speedKmh });
  const caloriesRaw = met * MET_CALCULATION.oxygenFactor * weightKg / MET_CALCULATION.bodyMassDivisor * minutes;
  const total = Math.max(Number(caloriesRaw.toFixed(2)), 0);

  return {
    total,
    breakdown: {
      formula: 'kcal = MET * 3.5 * weight_kg / 200 * minutes',
      met,
      movementType,
      intensity: resolvedIntensity,
      weightKg,
      seconds,
      minutes: Number(minutes.toFixed(2)),
      speedKmh,
      stepLengthM: normalizedProfile.step_length_m || null,
      steps: result.steps || null,
      volumeScore,
      estimated: true,
    },
  };
};

export const calculatePoints = (result = {}, profile = {}) => {
  const calories = calculateCalories(result, profile);
  return {
    total: Math.max(Math.round(calories.total), 0),
    breakdown: {
      legacy: true,
      basedOnCalories: calories.total,
      ...calories.breakdown,
    },
  };
};
