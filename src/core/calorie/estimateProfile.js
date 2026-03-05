import { MODE_DEFAULT, MODE_VALUES, PROFILE_COEFFICIENTS, SEX_DEFAULT, SEX_VALUES } from './constants.js';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeSex = (sex) => (SEX_VALUES.includes(sex) ? sex : SEX_DEFAULT);
const normalizeMode = (mode) => (MODE_VALUES.includes(mode) ? mode : MODE_DEFAULT);

const estimateByCoefficient = (heightCm, sex, key) => {
  const heightM = Math.max((Number(heightCm) || 0) / 100, 0);
  const coeff = PROFILE_COEFFICIENTS[key]?.[sex] ?? PROFILE_COEFFICIENTS[key]?.[SEX_DEFAULT] ?? 0;
  return Number((heightM * coeff).toFixed(3));
};

export const estimateProfileMetrics = (profile = {}) => {
  const sex = normalizeSex(profile.sex);
  const estimated = {
    step_length_m: estimateByCoefficient(profile.height_cm, sex, 'step_length_m'),
    arm_length_m: estimateByCoefficient(profile.height_cm, sex, 'arm_length_m'),
    leg_length_m: estimateByCoefficient(profile.height_cm, sex, 'leg_length_m'),
    torso_length_m: estimateByCoefficient(profile.height_cm, sex, 'torso_length_m'),
  };
  return { sex, estimated };
};

export const applyAutoProfileEstimation = (nextProfile = {}, prevProfile = {}) => {
  const merged = { ...prevProfile, ...nextProfile };
  const sex = normalizeSex(merged.sex);
  const { estimated } = estimateProfileMetrics({ ...merged, sex });
  const output = { ...merged, sex };

  ['step_length_m', 'arm_length_m', 'leg_length_m', 'torso_length_m'].forEach((field) => {
    const modeField = `${field}_mode`;
    const mode = normalizeMode(output[modeField]);
    output[modeField] = mode;

    const manualValue = toNumber(output[field]);
    if (mode === 'manual' && manualValue != null) {
      output[field] = manualValue;
      return;
    }

    output[field] = estimated[field];
  });

  return output;
};
