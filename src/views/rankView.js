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
  points.textContent = `${entry.calories ?? 0} kcal`;
  user.append(name, points);

  const total = document.createElement('strong');
  total.textContent = `${entry.calories ?? 0} kcal`;

  row.append(badge, user, total);
  return row;
};

export const renderRank = (_params, { store }) => {
  const container = document.createElement('section');
  container.className = 'stack rank-view';

  const profile = store.getProfile();
  const selfId = profile?.id || 'local-user';

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = 'ランキングは公開アカウント・自分・フォロー中の非公開アカウントを対象に集計されます。';

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

  const renderLeaderboard = async () => {
    list.innerHTML = '';
    list.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: '読み込み中...' }));
    let entries = [];
    try {
      entries = await Promise.resolve(store.getLeaderboard(activePeriod));
    } catch (_error) {
      list.innerHTML = '';
      list.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: 'ランキング取得に失敗しました。' }));
      return;
    }

    const filtered = (entries || []).filter((entry) => {
      if (!searchTerm) return true;
      const id = (entry.id || '').toLowerCase();
      const name = (entry.displayName || '').toLowerCase();
      return id.includes(searchTerm) || name.includes(searchTerm);
    });

    list.innerHTML = '';
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

  container.append(description, controls, board);
  return container;
};
