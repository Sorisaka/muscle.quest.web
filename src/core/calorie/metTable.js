const cardioSpeedMet = {
  walk: { light: 2.8, moderate: 3.8, vigorous: 5.0 },
  run: { light: 6.0, moderate: 8.0, vigorous: 10.0 },
};

const resistanceMet = {
  light: 3.5,
  moderate: 5.0,
  vigorous: 6.5,
};

const bodyweightMet = {
  light: 3.8,
  moderate: 5.2,
  vigorous: 7.0,
};

export const getSpeedIntensity = (speedKmh = 0, activity = 'walk') => {
  const safeSpeed = Number(speedKmh || 0);
  if (activity === 'run') {
    if (safeSpeed < 8) return 'light';
    if (safeSpeed < 11) return 'moderate';
    return 'vigorous';
  }

  if (safeSpeed < 4) return 'light';
  if (safeSpeed < 6) return 'moderate';
  return 'vigorous';
};

export const getCardioMet = (activity = 'walk', intensity = 'moderate') => {
  const table = cardioSpeedMet[activity] || cardioSpeedMet.walk;
  return table[intensity] || table.moderate;
};

export const getResistanceMet = (intensity = 'moderate') => resistanceMet[intensity] || resistanceMet.moderate;

export const getBodyweightMet = (intensity = 'moderate') => bodyweightMet[intensity] || bodyweightMet.moderate;
