const createRankRow = (position, entry, selfId) => {
  const row = document.createElement('div');
  row.className = 'row leaderboard-row';
  if (entry.id === selfId) {
    row.classList.add('is-self');
  }
  row.dataset.entryId = entry.id || '';

  const badge = document.createElement('span');
  badge.className = 'pill';
  badge.textContent = `#${position}`;

  const user = document.createElement('div');
  user.className = 'leaderboard-row__user';
  const name = document.createElement('strong');
  name.textContent = entry.displayName || entry.id || 'Anonymous';
  const points = document.createElement('span');
  points.className = 'muted';
  points.textContent = `${entry.points} pts`;
  user.append(name, points);

  const total = document.createElement('strong');
  total.textContent = `${entry.points} pts`;

  row.append(badge, user, total);
  return row;
};

export const renderRank = (params, { navigate, store, playSfx }) => {
  const container = document.createElement('section');
  container.className = 'stack rank-view';

  const boardId = params.board || 'local';
  const profile = store.getProfile();
  const selfId = profile?.id || 'local-user';

  const header = document.createElement('div');
  header.className = 'list-header';

  const heading = document.createElement('h2');
  heading.textContent = `Rank board: ${boardId}`;

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = '← ホームに戻る';
  back.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/');
  });

  header.append(heading, back);

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = 'ローカル保存されたポイントとサンプル順位を表示します。将来的に Supabase へ差し替え可能なアダプタ構造です。';

  const periods = [
    { id: 'daily', label: '本日' },
    { id: 'weekly', label: '直近7日' },
    { id: 'monthly', label: '直近30日' },
  ];

  let activePeriod = 'daily';
  let searchTerm = '';

  const controls = document.createElement('div');
  controls.className = 'rank-toolbar';

  const tabList = document.createElement('div');
  tabList.className = 'tabs';

  const searchRow = document.createElement('div');
  searchRow.className = 'rank-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'ID で検索';
  searchInput.addEventListener('input', (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    renderLeaderboard();
  });
  searchRow.append(searchInput);

  const board = document.createElement('div');
  board.className = 'rank-scroll-area';

  const list = document.createElement('div');
  list.className = 'stack rank-list';
  board.append(list);

  const scrollToSelf = () => {
    const selfRow = list.querySelector(`[data-entry-id="${selfId}"]`);
    if (!selfRow) {
      list.scrollTop = 0;
      return;
    }
    requestAnimationFrame(() => {
      const offset = selfRow.offsetTop - list.clientHeight / 2 + selfRow.clientHeight / 2;
      list.scrollTop = Math.max(offset, 0);
    });
  };

  const renderLeaderboard = () => {
    list.innerHTML = '';
    const entries = store.getLeaderboard(activePeriod);
    const filtered = (entries || []).filter((entry) => {
      if (!searchTerm) return true;
      const id = (entry.id || '').toLowerCase();
      const name = (entry.displayName || '').toLowerCase();
      return id.includes(searchTerm) || name.includes(searchTerm);
    });

    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = '検索条件に一致する順位がありません。';
      list.append(empty);
      return;
    }

    filtered.forEach((entry, index) => {
      list.append(createRankRow(index + 1, entry, selfId));
    });

    scrollToSelf();
  };

  periods.forEach((period) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tab';
    tab.textContent = period.label;
    if (period.id === activePeriod) tab.classList.add('is-active');
    tab.addEventListener('click', () => {
      if (activePeriod === period.id) return;
      activePeriod = period.id;
      tabList.querySelectorAll('.tab').forEach((node) => node.classList.remove('is-active'));
      tab.classList.add('is-active');
      renderLeaderboard();
    });
    tabList.append(tab);
  });

  controls.append(tabList, searchRow);

  renderLeaderboard();

  container.append(header, description, controls, board);
  return container;
};
