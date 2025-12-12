import { exercises, findQuestById, listQuestsByTier, quests } from '../generated/contentMap.js';

export const getQuestById = (id) => findQuestById(id);

export const getQuestsByTier = (tier) =>
  listQuestsByTier(tier).sort((a, b) => a.stars - b.stars || a.id.localeCompare(b.id));

export const getExerciseContent = (slug) => exercises[slug];

export const getQuestExercises = (quest) =>
  (quest.exercises || [])
    .map((slug) => ({ slug, ...(getExerciseContent(slug) || {}) }))
    .filter((exercise) => Boolean(exercise.slug));

export { quests };
