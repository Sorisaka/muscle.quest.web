import { trainingDefinitions } from '../data/trainingDefinitions.js';

export const getWorkoutLabelById = (id) => {
  const key = typeof id === 'string' ? id.trim() : '';
  if (!key) return null;
  return trainingDefinitions[key]?.label || null;
};

export const resolveWorkoutLabel = (...candidates) => {
  for (const candidate of candidates) {
    const label = getWorkoutLabelById(candidate);
    if (label) return label;
  }
  const fallbackId = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim());
  return fallbackId || '不明なワークアウト';
};
