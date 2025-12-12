import { createRouter } from './core/router.js';
import { createStore } from './core/store.js';
import { renderHome } from './views/homeView.js';
import { renderSettings } from './views/settingsView.js';
import { renderRank } from './views/rankView.js';
import { renderQuest } from './views/questView.js';
import { renderRun } from './views/runView.js';

const titleEl = document.querySelector('[data-route-title]');
const pathEl = document.querySelector('[data-route-path]');
const outlet = document.querySelector('[data-view]');
const navButtons = document.querySelectorAll('[data-nav-target]');

const store = createStore();
let router;

const routes = [
  {
    path: '#/',
    title: 'Home',
    description: 'Browse quests and jump into a run.',
    render: renderHome,
  },
  {
    path: '#/settings',
    title: 'Settings',
    description: 'Saved to localStorage for persistence.',
    render: renderSettings,
  },
  {
    path: '#/rank/:id',
    title: (params) => `Rank / ${params.id}`,
    description: 'Sample leaderboard view with dynamic params.',
    render: renderRank,
  },
  {
    path: '#/quest/:id',
    title: (params) => `Quest / ${params.id}`,
    description: 'Quest detail with links to run and how-to guides.',
    render: renderQuest,
  },
  {
    path: '#/run/:id',
    title: (params) => `Run / ${params.id}`,
    description: 'Live run area that reads your saved settings.',
    render: renderRun,
  },
];

const renderShell = (match) => {
  const { route, params, fullPath } = match;
  const routeTitle = typeof route.title === 'function' ? route.title(params) : route.title;
  const routeDescription =
    typeof route.description === 'function' ? route.description(params) : route.description;

  titleEl.textContent = routeTitle;
  pathEl.textContent = fullPath;

  const view = route.render(params, { navigate: router.navigate, store });
  outlet.innerHTML = '';
  outlet.append(view);

  const descriptionEl = document.querySelector('[data-route-description]');
  if (descriptionEl) {
    descriptionEl.textContent = routeDescription;
  }
};

const setupNavigation = () => {
  navButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const { navTarget } = event.currentTarget.dataset;
      event.preventDefault();
      router.navigate(navTarget);
    });
  });
};

const init = () => {
  router = createRouter(routes, renderShell);
  setupNavigation();
  router.start();
};

document.addEventListener('DOMContentLoaded', init);
