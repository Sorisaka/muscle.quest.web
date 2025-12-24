const CALLBACK_PATH = '/auth/callback.html';
const LEGACY_CALLBACK_DIR = '/auth/callback/';

function ensureLeadingSlash(path) {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function stripTrailingSlash(path) {
  if (!path || path === '/') return path || '/';
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function normalizeBasePath(basePath) {
  const withSlash = ensureLeadingSlash(basePath || '/');
  if (withSlash === '/') return '/';
  return stripTrailingSlash(withSlash);
}

function resolveOrigin(override) {
  if (override) return override;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export function inferBasePath(pathname) {
  const normalized = ensureLeadingSlash(pathname || '/');

  const callbackIndex = normalized.indexOf(CALLBACK_PATH);
  if (callbackIndex >= 0) {
    return normalizeBasePath(normalized.slice(0, callbackIndex));
  }

  const legacyIndex = normalized.indexOf(LEGACY_CALLBACK_DIR);
  if (legacyIndex >= 0) {
    return normalizeBasePath(normalized.slice(0, legacyIndex));
  }

  return normalizeBasePath(normalized);
}

export function buildCallbackUrl(basePath, originOverride) {
  const normalizedBase = normalizeBasePath(basePath || '/');
  const origin = resolveOrigin(originOverride);
  const prefix = normalizedBase === '/' ? '' : normalizedBase;
  return `${origin}${prefix}/auth/callback.html`;
}

export function buildAccountUrl(basePath, originOverride) {
  const normalizedBase = normalizeBasePath(basePath || '/');
  const origin = resolveOrigin(originOverride);
  const prefix = normalizedBase === '/' ? '' : normalizedBase;
  return `${origin}${prefix}/#/account`;
}
