const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const buildWorkoutTimingSummary = (result = {}) => {
  const actualActiveSeconds = Math.max(
    Math.round(
      toNumber(
        result.actualActiveSeconds,
        toNumber(result.actual_active_seconds, toNumber(result.elapsedSeconds, 0)),
      ),
    ),
    0,
  );
  const actualRestSeconds = Math.max(
    Math.round(toNumber(result.actualRestSeconds, toNumber(result.actual_rest_seconds, 0))),
    0,
  );
  const configuredActiveSeconds = Math.max(
    Math.round(
      toNumber(
        result.configuredActiveSeconds,
        toNumber(result.configured_active_seconds, toNumber(result.trainingSeconds, 0)),
      ),
    ),
    0,
  );
  const perSetActiveSeconds = Array.isArray(result.perSetActiveSeconds)
    ? result.perSetActiveSeconds.map((seconds) => Math.max(Math.round(toNumber(seconds, 0)), 0))
    : [];

  return {
    actualActiveSeconds,
    actualRestSeconds,
    configuredActiveSeconds,
    perSetActiveSeconds,
    isPartial: configuredActiveSeconds > 0 && actualActiveSeconds < configuredActiveSeconds,
  };
};

export const getActualActiveSeconds = (result = {}) => {
  const timing = buildWorkoutTimingSummary(result);
  if (timing.actualActiveSeconds > 0) return timing.actualActiveSeconds;

  const start = toNumber(result.startTime, 0);
  const end = toNumber(result.endTime, 0);
  if (start > 0 && end > start) {
    return Math.max(Math.round((end - start) / 1000), 0);
  }

  if (toNumber(result.trainingSeconds, 0) > 0) {
    return Math.max(Math.round(toNumber(result.trainingSeconds, 0)), 0);
  }

  if (!Array.isArray(result.sets)) return 0;
  return result.sets.reduce((total, set) => total + Math.max(toNumber(set.timeSeconds, 0), 0), 0);
};
