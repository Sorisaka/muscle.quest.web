import { exercises, findQuestById, listQuestsByTier, quests } from '../generated/contentMap.js';
import { isWorkoutActive } from '../data/workoutMaster.js';

export const getQuestById = (id) => {
  const quest = findQuestById(id);
  return isQuestActive(quest) ? quest : null;
};

const isQuestActive = (quest) => (quest?.exercises || []).some((slug) => isWorkoutActive(slug));

export const getQuestsByTier = (tier) =>
  listQuestsByTier(tier).filter(isQuestActive).sort((a, b) => a.stars - b.stars || a.id.localeCompare(b.id));

export const getExerciseContent = (slug) => exercises[slug];

export const getQuestExercises = (quest) =>
  (quest.exercises || [])
    .filter((slug) => isWorkoutActive(slug))
    .map((slug) => ({ slug, ...(getExerciseContent(slug) || {}) }))
    .filter((exercise) => Boolean(exercise.slug));

export { quests };
