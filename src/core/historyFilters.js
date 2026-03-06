import { getExerciseTags, normalizeCategory, normalizeMuscles } from './exerciseTaxonomy.js';

export const defaultHistoryFilter = {
  category: 'all',
  muscles: [],
};

const normalizeFilter = (filter = {}) => ({
  category: filter.category === 'all' ? 'all' : normalizeCategory(filter.category),
  muscles: normalizeMuscles(filter.muscles),
});

const resolveRunTags = (run = {}) => {
  const result = run?.result || run;
  const slug = run?.exerciseSlug || result?.exerciseSlug || result?.exercise_slug || run?.questId || result?.questId;
  const fallback = getExerciseTags(slug);
  return {
    category: normalizeCategory(run?.category || result?.category || fallback.category),
    muscles: normalizeMuscles(run?.muscles || result?.muscles || fallback.muscles),
  };
};

export const filterRuns = (runs = [], filter = defaultHistoryFilter) => {
  const current = normalizeFilter(filter);
  return (Array.isArray(runs) ? runs : []).filter((run) => {
    const tags = resolveRunTags(run);
    if (current.category !== 'all' && tags.category !== current.category) return false;
    if (!current.muscles.length) return true;
    return current.muscles.some((muscle) => tags.muscles.includes(muscle));
  });
};

export const getRunTags = resolveRunTags;
