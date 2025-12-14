const createMetricRow = (label, value, options = {}) => {
  const row = document.createElement('div');
  row.className = 'account-metric__row';
  const name = document.createElement('span');
  name.textContent = label;
  if (options.muted) {
    name.className = 'muted';
  }

  const val = document.createElement('strong');
  val.textContent = value;
  row.append(name, val);
  return row;
};

export const renderAccount = (_params, { navigate, accountState, playSfx }) => {
  const status = accountState.getStatus();

  const container = document.createElement('section');
  container.className = 'stack account-view';

  const heading = document.createElement('div');
  heading.className = 'list-header account-header';

  const title = document.createElement('h2');
  title.textContent = 'アカウント情報';

  const backHome = document.createElement('button');
  backHome.type = 'button';
  backHome.className = 'ghost';
  backHome.textContent = '← ホームに戻る';
  backHome.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/');
  });

  heading.append(title, backHome);

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = status.isGuest
    ? '現在はゲストモードです。ログインするとクラウド連携できる想定です。'
    : 'ローカルプロフィールで記録中です。設定やポイントはこの端末に保存されます。';

  const profileCard = document.createElement('div');
  profileCard.className = 'card account-card';

  const profileHeader = document.createElement('div');
  profileHeader.className = 'account-card__header';
  const profileTitle = document.createElement('div');
  profileTitle.className = 'account-card__title';
  profileTitle.textContent = status.displayName || 'Guest';
  const profileId = document.createElement('p');
  profileId.className = 'muted';
  profileId.textContent = status.isGuest ? 'ゲストとして記録しています' : `ID: ${status.id}`;
  profileHeader.append(profileTitle, profileId);

  const nameLabel = document.createElement('p');
  nameLabel.className = 'eyebrow';
  nameLabel.textContent = 'Display name';
  const nameField = document.createElement('input');
  nameField.type = 'text';
  nameField.value = status.displayName || '';
  nameField.placeholder = '表示名を入力';
  nameField.addEventListener('change', (event) => {
    accountState.setDisplayName(event.target.value);
  });

  profileCard.append(profileHeader, nameLabel, nameField);

  const statsCard = document.createElement('div');
  statsCard.className = 'card account-card';
  const statsTitle = document.createElement('h3');
  statsTitle.textContent = '獲得状況';
  const statsGrid = document.createElement('div');
  statsGrid.className = 'account-metrics-grid';
  statsGrid.append(
    createMetricRow('総保有ポイント', `${status.points} pts`),
    createMetricRow('完了クエスト', `${status.completedRuns || 0} 件`),
    createMetricRow('ストリーク', `${status.streak} 日`),
  );
  statsCard.append(statsTitle, statsGrid);

  const totalsCard = document.createElement('div');
  totalsCard.className = 'card account-card';
  const totalsTitle = document.createElement('h3');
  totalsTitle.textContent = '期間別ポイント';
  const totalsGrid = document.createElement('div');
  totalsGrid.className = 'account-metrics-grid';
  totalsGrid.append(
    createMetricRow('本日', `${status.totals.daily || 0} pts`, { muted: true }),
    createMetricRow('直近7日', `${status.totals.weekly || 0} pts`, { muted: true }),
    createMetricRow('直近30日', `${status.totals.monthly || 0} pts`, { muted: true }),
  );
  totalsCard.append(totalsTitle, totalsGrid);

  const actions = document.createElement('div');
  actions.className = 'hero__actions';

  if (status.isGuest) {
    const loginHint = document.createElement('p');
    loginHint.className = 'muted';
    loginHint.textContent = 'ログインするとクラウド連携を行う想定のダミーボタンです。';
    const loginBtn = document.createElement('button');
    loginBtn.type = 'button';
    loginBtn.textContent = 'ログイン';
    loginBtn.addEventListener('click', () => {
      playSfx('ui:navigate');
      accountState.login();
    });
    actions.append(loginHint, loginBtn);
  }

  const toRank = document.createElement('button');
  toRank.type = 'button';
  toRank.textContent = 'ランキングを見る';
  toRank.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/rank/local');
  });

  const toSettings = document.createElement('button');
  toSettings.type = 'button';
  toSettings.className = 'ghost';
  toSettings.textContent = '設定';
  toSettings.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/settings');
  });

  actions.append(toRank, toSettings);

  container.append(
    heading,
    description,
    profileCard,
    statsCard,
    totalsCard,
    actions,
  );
  return container;
};
