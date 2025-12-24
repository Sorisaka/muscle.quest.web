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

export const maskToken = (token) => {
  if (!token || typeof token !== 'string') return undefined;
  if (token.length <= 8) return `${token.slice(0, 1)}…${token.slice(-1)}`;
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
};

export const sanitizeSessionForLog = (session) => {
  if (!session) return null;
  return {
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    userAud: session.user?.aud,
    access_token: maskToken(session.access_token),
    refresh_token: maskToken(session.refresh_token),
    provider_token: maskToken(session.provider_token),
    provider_refresh_token: maskToken(session.provider_refresh_token),
  };
};

export const sanitizeUrlForLog = (urlString) => {
  if (!urlString) return urlString;
  try {
    const parsed = new URL(urlString, window?.location?.origin);
    return `${parsed.origin}${parsed.pathname}`;
  } catch (_error) {
    return urlString.split('#')[0].split('?')[0];
  }
};
