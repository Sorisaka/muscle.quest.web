const DEBUG_KEY = 'musclequest:debugAuth';
const LOG_PREFIX = '[auth]';

const isLocalStorageAvailable = () => {
  try {
    return typeof localStorage !== 'undefined';
  } catch (_error) {
    return false;
  }
};

export const isAuthDebugEnabled = () => {
  if (!isLocalStorageAvailable()) return false;
  try {
    return localStorage.getItem(DEBUG_KEY) === '1';
  } catch (_error) {
    return false;
  }
};

const formatEntry = (label, payload) => {
  if (payload === undefined) return `${LOG_PREFIX} ${label}`;
  return `${LOG_PREFIX} ${label}:`;
};

export const authLog = (label, payload) => {
  if (!isAuthDebugEnabled()) return;
  if (payload === undefined) {
    console.log(`${LOG_PREFIX} ${label}`);
    return;
  }
  console.log(formatEntry(label, payload), payload);
};

export const authWarn = (label, payload) => {
  if (!isAuthDebugEnabled()) return;
  console.warn(formatEntry(label, payload), payload);
};

export const authError = (label, payload) => {
  if (!isAuthDebugEnabled()) return;
  console.error(formatEntry(label, payload), payload);
};
