import { trainingDefinitions } from '../data/trainingDefinitions.js';

export const EXERCISE_CATEGORIES = ['cardio', 'bodyweight', 'weights', 'unknown'];

export const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes', 'fullbody', 'other'];

export const normalizeCategory = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return EXERCISE_CATEGORIES.includes(normalized) ? normalized : 'unknown';
};

export const normalizeMuscles = (list) => {
  if (!Array.isArray(list)) return [];
  return Array.from(new Set(list
    .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
    .filter((entry) => MUSCLE_GROUPS.includes(entry))));
};

export const getExerciseTags = (slug) => {
  const definition = trainingDefinitions[slug];
  if (!definition) return { category: 'unknown', muscles: [] };
  return {
    category: normalizeCategory(definition.category),
    muscles: normalizeMuscles(definition.muscles),
  };
};

const resolveExerciseSlug = (result = {}) => result.exerciseSlug
  || result.exercise_slug
  || result.slug
  || result.questId
  || result.quest_id
  || null;

export const decorateResultWithTags = (result = {}) => {
  const safeResult = result || {};
  const slug = resolveExerciseSlug(safeResult);
  const defaults = getExerciseTags(slug);
  return {
    ...safeResult,
    category: normalizeCategory(safeResult.category || defaults.category),
    muscles: normalizeMuscles(Array.isArray(safeResult.muscles) ? safeResult.muscles : defaults.muscles),
  };
};
