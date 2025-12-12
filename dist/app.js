const routes = {
  '#/': {
    title: 'Home',
    description: 'Welcome to Muscle Quest. Use the buttons below to check each route.'
  },
  '#/settings': {
    title: 'Settings',
    description: 'Adjust your preferences and profile details.'
  },
  '#/rank/example': {
    title: 'Rank',
    description: 'View leaderboard details for the selected rank.'
  },
  '#/quest/example': {
    title: 'Quest',
    description: 'Track quest progress and objectives here.'
  },
  '#/run/example': {
    title: 'Run',
    description: 'Monitor an active run with live stats.'
  }
};

function renderRoute(target) {
  const route = routes[target] || routes['#/'];
  const heading = document.querySelector('[data-route-title]');
  const body = document.querySelector('[data-route-description]');
  const current = document.querySelector('[data-current-route]');

  heading.textContent = route.title;
  body.textContent = route.description;
  current.textContent = target;
}

function navigate(target) {
  window.location.hash = target;
  renderRoute(target);
}

function setupNavigation() {
  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const { navTarget } = event.currentTarget.dataset;
      navigate(navTarget);
    });
  });

  window.addEventListener('hashchange', () => {
    renderRoute(window.location.hash || '#/');
  });

  const initial = window.location.hash || '#/';
  renderRoute(initial);
}

function initApp() {
  setupNavigation();
}

document.addEventListener('DOMContentLoaded', initApp);
