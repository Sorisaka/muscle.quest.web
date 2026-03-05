import { createRouter } from './core/router.js';
import { createStore } from './core/store.js';
import { initSfx, playSfx } from './core/sfx.js';
import { createAccountState } from './core/accountState.js';
import { renderHome } from './views/homeView.js';
import { renderSettings } from './views/settingsView.js';
import { renderQuestList } from './views/questListView.js';
import { renderQuest } from './views/questView.js';
import { renderRun } from './views/runView.js';
import { renderRank } from './views/rankView.js';
import { renderAccount } from './views/accountView.js';
import { renderTimeline } from './views/timelineView.js';
import { renderHistory, renderHistoryDay } from './views/historyView.js';
import { createAccountDrawer } from './ui/accountDrawer.js';

const titleEl = document.querySelector('[data-route-title]');
const pathEl = document.querySelector('[data-route-path]');
const outlet = document.querySelector('[data-view]');
const accountTrigger = document.querySelector('[data-account-trigger]');
const drawerOverlay = document.querySelector('[data-drawer-overlay]');
const accountDrawer = document.querySelector('[data-account-drawer]');

const store = createStore();
const accountState = createAccountState(store);
let router;

const routes = [
  {
    path: '#/',
    title: 'Home',
    description: '級を選んでクエストへ向かおう。',
    render: renderHome,
  },
  {
    path: '#/settings',
    title: 'Settings',
    description: 'Saved to localStorage for persistence.',
    render: renderSettings,
  },
  {
    path: '#/quests/:tier',
    title: (params) => `Quest List / ${params.tier}`,
    description: '級ごとのクエストを★昇順で表示します。',
    render: renderQuestList,
  },
  {
    path: '#/quest/:id',
    title: (params) => `Quest / ${params.id}`,
    description: 'やり方リンクとタイマー設定を確認。',
    render: renderQuest,
  },
  {
    path: '#/run/:id',
    title: (params) => `Run / ${params.id}`,
    description: '4分割画面でタイマーと手順を確認。',
    render: renderRun,
  },
  {
    path: '#/rank/:board',
    title: (params) => `Rank / ${params.board}`,
    description: '消費カロリーとローカルランキングを確認します。',
    render: renderRank,
  },
  {
    path: '#/rank',
    title: 'Rank',
    description: '消費カロリーとローカルランキングを確認します。',
    render: renderRank,
  },
  {
    path: '#/account',
    title: 'Account',
    description: 'プロフィールと消費カロリーの概要。',
    render: renderAccount,
  },
  {
    path: '#/timeline',
    title: 'Timeline',
    description: 'フォロー/公開投稿のタイムライン',
    render: renderTimeline,
  },
  {
    path: '#/history',
    title: 'History',
    description: '体重・体脂肪率とトレーニング履歴カレンダー',
    render: renderHistory,
  },
  {
    path: '#/history/:date',
    title: (params) => `History / ${params.date}`,
    description: '日付別のトレーニング詳細',
    render: renderHistoryDay,
  },
];

const renderShell = (match) => {
  const { route, params, fullPath } = match;
  const routeTitle = typeof route.title === 'function' ? route.title(params) : route.title;
  const routeDescription =
    typeof route.description === 'function' ? route.description(params) : route.description;

  titleEl.textContent = routeTitle;
  pathEl.textContent = fullPath;

  const viewResult = route.render(params, { navigate: router.navigate, store, playSfx, accountState });
  Promise.resolve(viewResult).then((view) => {
    outlet.innerHTML = '';
    if (view) outlet.append(view);
    const descriptionEl = document.querySelector('[data-route-description]');
    if (descriptionEl) {
      descriptionEl.textContent = routeDescription;
    }
  });
};

const init = () => {
  router = createRouter(routes, renderShell);
  createAccountDrawer({
    triggerEl: accountTrigger,
    drawerEl: accountDrawer,
    overlayEl: drawerOverlay,
    accountState,
    navigate: (path) => router.navigate(path),
    playSfx,
  });
  initSfx(store);
  router.start();
};

document.addEventListener('DOMContentLoaded', init);
