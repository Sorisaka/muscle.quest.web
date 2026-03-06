import { createRouter, normalizeHash, resolveNavRouteKey } from './core/router.js';
import { createStore } from './core/store.js';
import { initSfx, playSfx } from './core/sfx.js';
import { createAccountState } from './core/accountState.js';
import { initBottomInsetSync } from './core/bottomInset.js';
import { renderHome } from './views/homeView.js';
import { renderSettings, renderSettingsSection } from './views/settingsView.js';
import { renderQuestList } from './views/questListView.js';
import { renderQuest } from './views/questView.js';
import { renderRun } from './views/runView.js';
import { renderRank } from './views/rankView.js';
import { renderAccount, renderAccountConnections } from './views/accountView.js';
import { renderTimeline } from './views/timelineView.js';
import { renderHistory, renderHistoryDay } from './views/historyView.js';
import { createAccountDrawer } from './ui/accountDrawer.js';

const outlet = document.querySelector('[data-view]');
const accountTrigger = document.querySelector('[data-account-trigger]');
const drawerOverlay = document.querySelector('[data-drawer-overlay]');
const accountDrawer = document.querySelector('[data-account-drawer]');
const bottomNav = document.querySelector('[data-bottom-nav]');
const navButtons = Array.from(document.querySelectorAll('[data-nav-route]'));

const store = createStore();
const accountState = createAccountState(store);
let router;

const routes = [
  { path: '#/', render: renderHome },
  { path: '#/settings', render: renderSettings },
  { path: '#/settings/:section', render: renderSettingsSection },
  { path: '#/workouts/:category', render: renderQuestList },
  { path: '#/quests/:category', render: renderQuestList },
  { path: '#/workout/:id', render: renderQuest },
  { path: '#/quest/:id', render: renderQuest },
  { path: '#/run/:id', render: renderRun },
  { path: '#/rank/:board', render: renderRank },
  { path: '#/rank', render: renderRank },
  { path: '#/account', render: renderAccount },
  { path: '#/account/:type', render: renderAccountConnections },
  { path: '#/timeline', render: renderTimeline },
  { path: '#/history', render: renderHistory },
  { path: '#/history/:date', render: renderHistoryDay },
  { path: '#/follow-requests', render: (p, c) => renderAccountConnections({ type: 'requests' }, c) },
];


const navRouteKeys = navButtons
  .map((button) => normalizeHash(button.dataset.navRoute || '#/'))
  .filter((route, index, all) => all.indexOf(route) === index);

const updateActiveNav = (fullPath) => {
  const activeKey = resolveNavRouteKey(fullPath, navRouteKeys);
  navButtons.forEach((button) => {
    const target = normalizeHash(button.dataset.navRoute || '#/');
    button.classList.toggle('is-active', Boolean(activeKey) && target === activeKey);
  });
};

const resolveRequestsReturnPath = (previousPath) => {
  if (!previousPath) return '#/account';
  const normalized = String(previousPath || '#/');
  if (normalized.startsWith('#/follow-requests')) return '#/account';
  return normalized;
};

const renderShell = (match) => {
  const { route, params, fullPath, previousPath } = match;
  updateActiveNav(fullPath);
  const viewResult = route.render(params, {
    navigate: router.navigate,
    store,
    playSfx,
    accountState,
    followRequestsReturnPath: resolveRequestsReturnPath(previousPath),
  });

  Promise.resolve(viewResult).then((view) => {
    outlet.innerHTML = '';
    if (view) outlet.append(view);
  });
};

const initBottomNav = () => {
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      playSfx('ui:navigate');
      router.navigate(button.dataset.navRoute);
    });
  });
};

const init = () => {
  router = createRouter(routes, renderShell);
  initBottomNav();
  createAccountDrawer({
    triggerEl: accountTrigger,
    drawerEl: accountDrawer,
    overlayEl: drawerOverlay,
    accountState,
    navigate: (path) => router.navigate(path),
    getCurrentPath: () => router.getCurrentPath(),
    playSfx,
    store,
  });
  initBottomInsetSync({ navEl: bottomNav });
  initSfx(store);
  router.start();
};

document.addEventListener('DOMContentLoaded', init);
