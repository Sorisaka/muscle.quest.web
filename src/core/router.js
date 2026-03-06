export const normalizeHash = (path) => {
  const cleaned = (path || '#/').trim();
  if (!cleaned || cleaned === '#') return '#/';
  if (cleaned.startsWith('#/')) return cleaned;
  if (cleaned.startsWith('/')) return `#${cleaned}`;
  if (cleaned.startsWith('#')) return `#/${cleaned.slice(1)}`;
  return `#/${cleaned}`;
};

const stripHashPrefix = (path) => normalizeHash(path).replace(/^#/, '');

const splitPathSegments = (path) => stripHashPrefix(path).split('/').filter(Boolean);

const isSegmentPrefix = (targetPath, candidatePath) => {
  const targetSegments = splitPathSegments(targetPath);
  const candidateSegments = splitPathSegments(candidatePath);
  if (candidateSegments.length > targetSegments.length) return false;
  return candidateSegments.every((segment, index) => targetSegments[index] === segment);
};

export const resolveNavRouteKey = (currentPath, navRoutes = []) => {
  const normalizedCurrent = normalizeHash(currentPath);
  const normalizedRoutes = navRoutes
    .map((route) => normalizeHash(route))
    .filter((route, index, all) => all.indexOf(route) === index)
    .sort((a, b) => splitPathSegments(b).length - splitPathSegments(a).length);

  const exactMatch = normalizedRoutes.find((route) => route === normalizedCurrent);
  if (exactMatch) return exactMatch;

  const prefixMatch = normalizedRoutes.find((route) => route !== '#/' && isSegmentPrefix(normalizedCurrent, route));
  if (prefixMatch) return prefixMatch;

  return null;
};

const splitSegments = (path) => path.replace(/^#\/?/, '').split('/').filter(Boolean);

const matchSegments = (path, pattern) => {
  const pathSegments = splitSegments(path);
  const patternSegments = splitSegments(pattern);
  if (pathSegments.length !== patternSegments.length) return null;

  const params = {};
  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index];
    const pathSegment = pathSegments[index];

    if (patternSegment.startsWith(':')) {
      params[patternSegment.slice(1)] = decodeURIComponent(pathSegment);
      continue;
    }

    if (patternSegment !== pathSegment) return null;
  }

  return params;
};

export const createRouter = (routes, onRouteChange) => {
  const preparedRoutes = routes.map((route) => ({
    ...route,
    normalizedPath: stripHashPrefix(route.path),
  }));

  let currentPath = normalizeHash(window.location.hash || '#/');
  let previousPath = '#/';

  const findMatch = (hash) => {
    const normalized = stripHashPrefix(hash);

    for (const route of preparedRoutes) {
      const params = matchSegments(normalized, route.normalizedPath);
      if (params) {
        return { route, params, fullPath: `#/${normalized}`.replace('#//#', '#/') };
      }
    }

    const fallback = preparedRoutes.find((route) => route.path === '#/');
    return {
      route: fallback,
      params: {},
      fullPath: '#/',
    };
  };

  const notify = () => {
    const match = findMatch(currentPath);
    onRouteChange({ ...match, currentPath, previousPath });
  };

  const handleHashChange = () => {
    const nextPath = normalizeHash(window.location.hash || '#/');
    if (nextPath !== currentPath) {
      previousPath = currentPath;
      currentPath = nextPath;
    }
    notify();
  };

  const navigate = (path) => {
    const target = normalizeHash(path);
    if (currentPath === target) {
      notify();
      return;
    }
    window.location.hash = target;
  };

  const start = () => {
    currentPath = normalizeHash(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    notify();
  };

  return {
    start,
    navigate,
    getCurrentPath: () => currentPath,
    getPreviousPath: () => previousPath,
  };
};
