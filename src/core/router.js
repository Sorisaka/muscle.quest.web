const normalizeHash = (hash) => {
  if (!hash || hash === '#') {
    return '#/';
  }
  if (!hash.startsWith('#')) {
    return `#${hash}`;
  }
  return hash;
};

const matchSegments = (current, target) => {
  const params = {};
  const currentParts = current.split('/').filter(Boolean);
  const targetParts = target.split('/').filter(Boolean);

  if (currentParts.length !== targetParts.length) {
    return null;
  }

  for (let index = 0; index < targetParts.length; index += 1) {
    const targetPart = targetParts[index];
    const currentPart = currentParts[index];

    if (targetPart.startsWith(':')) {
      const key = targetPart.slice(1);
      params[key] = currentPart;
      continue;
    }

    if (targetPart !== currentPart) {
      return null;
    }
  }

  return params;
};

export const createRouter = (routes, onRouteChange) => {
  const preparedRoutes = routes.map((route) => ({
    ...route,
    normalizedPath: normalizeHash(route.path).replace(/^#/, ''),
  }));

  const findMatch = (hash) => {
    const normalized = normalizeHash(hash).replace(/^#/, '');

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
    const match = findMatch(window.location.hash);
    onRouteChange(match);
  };

  const navigate = (path) => {
    const target = normalizeHash(path);
    if (window.location.hash === target) {
      notify();
      return;
    }
    window.location.hash = target;
  };

  const start = () => {
    window.addEventListener('hashchange', notify);
    notify();
  };

  return { start, navigate };
};
