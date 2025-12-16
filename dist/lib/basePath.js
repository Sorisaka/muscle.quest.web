const CALLBACK_SEGMENT = '/auth/callback/';

function ensureLeadingSlash(path) {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function ensureTrailingSlash(path) {
  if (!path) return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

function resolveOrigin(override) {
  if (override) return override;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export function inferBasePath(pathname) {
  const normalized = ensureTrailingSlash(ensureLeadingSlash(pathname || '/'));
  const callbackIndex = normalized.indexOf(CALLBACK_SEGMENT);

  if (callbackIndex >= 0) {
    return normalized.slice(0, callbackIndex + 1);
  }

  return normalized;
}

export function buildCallbackUrl(basePath, originOverride) {
  const normalizedBase = ensureTrailingSlash(ensureLeadingSlash(basePath || '/'));
  return `${resolveOrigin(originOverride)}${normalizedBase}auth/callback/`;
}

export function buildAccountUrl(basePath, originOverride) {
  const normalizedBase = ensureTrailingSlash(ensureLeadingSlash(basePath || '/'));
  return `${resolveOrigin(originOverride)}${normalizedBase}#/account`;
}
