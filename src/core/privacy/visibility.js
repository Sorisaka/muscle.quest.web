export const ACCOUNT_VISIBILITY_VALUES = ['private', 'public'];
export const POST_VISIBILITY_VALUES = ['public', 'private', 'archived'];

export const normalizeAccountVisibility = (value, fallback = 'private') => {
  if (ACCOUNT_VISIBILITY_VALUES.includes(value)) return value;
  if (value === 'followers') return 'private';
  return fallback;
};

export const normalizePostVisibility = (value, fallback = 'private') => {
  if (POST_VISIBILITY_VALUES.includes(value)) return value;
  if (value === 'followers') return 'private';
  return fallback;
};

export const resolvePostVisibility = (accountVisibility = 'private', override = null) => {
  const normalizedAccount = normalizeAccountVisibility(accountVisibility, 'private');
  if (override == null) {
    return normalizedAccount === 'public' ? 'public' : 'private';
  }
  return normalizePostVisibility(override, normalizedAccount === 'public' ? 'public' : 'private');
};
