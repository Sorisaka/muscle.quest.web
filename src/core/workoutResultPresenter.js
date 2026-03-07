import { resolveWorkoutLabel } from './workoutLabel.js';

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const formatSecondsToJapanese = (seconds) => {
  const safe = Math.max(Math.round(toNumber(seconds, 0)), 0);
  if (safe <= 0) return '0秒';
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remain = safe % 60;
  if (hours > 0) {
    if (remain > 0) {
      return `${hours}時間${String(minutes).padStart(2, '0')}分${String(remain).padStart(2, '0')}秒`;
    }
    return `${hours}時間${String(minutes).padStart(2, '0')}分`;
  }
  if (minutes > 0) return `${minutes}分${String(remain).padStart(2, '0')}秒`;
  return `${remain}秒`;
};

const formatDistanceToJapanese = (meters) => {
  const safe = toNumber(meters, 0);
  if (safe <= 0) return null;
  if (safe >= 1000 && safe % 1000 !== 0) {
    return `${(safe / 1000).toFixed(1)}km`;
  }
  if (safe >= 1000) return `${Math.round(safe / 1000)}km`;
  return `${Math.round(safe)}m`;
};

const resolveDurationSeconds = (result = {}) => {
  const candidates = [
    result.actualActiveSeconds,
    result.elapsedSeconds,
    result.trainingSeconds,
    result.workSeconds,
    result?.timerProfile?.workSeconds,
  ];
  return candidates.find((entry) => Number.isFinite(Number(entry)) && Number(entry) > 0) || 0;
};

const resolveSets = (result = {}) => {
  if (Array.isArray(result.sets) && result.sets.length) return result.sets;
  if (Array.isArray(result?.plan?.sets) && result.plan.sets.length) return result.plan.sets;
  return [];
};

const formatSetLine = (set = {}, index = 0) => {
  const prefix = `${index + 1}セット目 `;
  if (Number.isFinite(Number(set.weight)) && Number.isFinite(Number(set.reps))) {
    return `${prefix}${Number(set.weight)}kg × ${Number(set.reps)}回`;
  }
  if (Number.isFinite(Number(set.reps))) {
    return `${prefix}${Number(set.reps)}回`;
  }
  if (Number.isFinite(Number(set.timeSeconds))) {
    return `${prefix}${formatSecondsToJapanese(set.timeSeconds)}`;
  }
  return null;
};

export const formatWorkoutAmount = (entry = {}) => {
  const result = entry?.result || entry || {};
  const distanceLabel = formatDistanceToJapanese(result.distanceMeters);
  const durationSeconds = resolveDurationSeconds(result);
  const durationLabel = durationSeconds > 0 ? formatSecondsToJapanese(durationSeconds) : null;

  const setLines = resolveSets(result)
    .map((set, index) => formatSetLine(set, index))
    .filter(Boolean);

  if (distanceLabel && durationLabel) return `${distanceLabel} / ${durationLabel}`;
  if (setLines.length) return setLines.join(' / ');
  if (durationLabel) return durationLabel;
  if (distanceLabel) return distanceLabel;
  if (Number.isFinite(Number(result.completedSets)) && Number(result.completedSets) > 0) {
    return `${Number(result.completedSets)}セット`;
  }
  return '記録データなし';
};

export const resolveWorkoutPresentation = (entry = {}) => {
  const result = entry?.result || entry || {};
  const workoutLabel = resolveWorkoutLabel(
    entry?.exerciseSlug,
    result?.exerciseSlug,
    result?.exercise_slug,
    entry?.questId,
    result?.questId,
    result?.quest_id,
  );

  return {
    workoutLabel,
    workoutAmountLabel: formatWorkoutAmount(entry),
  };
};
