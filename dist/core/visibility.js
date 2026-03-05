export const VISIBILITY_VALUES = ['private', 'followers', 'public'];

export const normalizeVisibility = (value, fallback = 'private') => {
  if (VISIBILITY_VALUES.includes(value)) return value;
  return fallback;
};

export const resolveVisibility = (profileDefault = 'private', override = null) => {
  if (override == null) return normalizeVisibility(profileDefault, 'private');
  return normalizeVisibility(override, normalizeVisibility(profileDefault, 'private'));
};
