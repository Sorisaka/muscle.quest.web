import { trainingDefinitions } from '../data/trainingDefinitions.js';
import quests from '../data/quests.json';

const questById = new Map((Array.isArray(quests) ? quests : []).map((quest) => [quest.id, quest]));

export const getWorkoutLabelById = (id) => {
  const key = typeof id === 'string' ? id.trim() : '';
  if (!key) return null;
  const definitionLabel = trainingDefinitions[key]?.label;
  if (definitionLabel) return definitionLabel;
  const quest = questById.get(key);
  return quest?.label || quest?.title || null;
};

export const resolveWorkoutLabel = (...candidates) => {
  for (const candidate of candidates) {
    const label = getWorkoutLabelById(candidate);
    if (label) return label;
  }
  const fallbackId = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim());
  return fallbackId || '不明なワークアウト';
};
