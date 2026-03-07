export const SEX_DEFAULT = 'unknown';
export const SEX_VALUES = ['unknown', 'male', 'female'];

export const MODE_DEFAULT = 'auto';
export const MODE_VALUES = ['auto', 'manual'];

export const PROFILE_COEFFICIENTS = {
  step_length_m: { male: 0.415, female: 0.413, unknown: 0.414 },
  arm_length_m: { male: 0.486, female: 0.478, unknown: 0.482 },
  torso_length_m: { male: 0.219, female: 0.216, unknown: 0.218 },
  leg_length_m: { male: 0.616, female: 0.621, unknown: 0.619 },
};

export const MET_CALCULATION = {
  oxygenFactor: 3.5,
  bodyMassDivisor: 200,
};
