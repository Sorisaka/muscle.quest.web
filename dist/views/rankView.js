const createRankRow = (position, entry) => {
  const row = document.createElement('div');
  row.className = 'row leaderboard-row';

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
  container.className = 'stack';

  const boardId = params.board || 'local';
  const heading = document.createElement('h2');
  heading.textContent = `Rank board: ${boardId}`;

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = 'ローカル保存されたポイントとサンプル順位を表示します。将来的に Supabase へ差し替え可能なアダプタ構造です。';

  const authNotice = document.createElement('div');
  authNotice.className = 'card auth-placeholder';
  const authTitle = document.createElement('div');
  authTitle.className = 'auth-placeholder__header';
  authTitle.innerHTML = '<strong>未ログイン</strong>（ローカルランキングのみ表示）';
  const authDesc = document.createElement('p');
  authDesc.className = 'muted';
  authDesc.textContent = 'Supabase アカウント連携を追加すると、ここでオンライン順位と同期を切り替える予定です。';
  const loginPlaceholder = document.createElement('button');
  loginPlaceholder.type = 'button';
  loginPlaceholder.disabled = true;
  loginPlaceholder.className = 'ghost';
  loginPlaceholder.textContent = 'Supabase ログイン（準備中）';
  authNotice.append(authTitle, authDesc, loginPlaceholder);

  const profile = store.getProfile();
  const pointSummary = store.getPointSummary();

  const profileCard = document.createElement('div');
  profileCard.className = 'hero';
  const profileTitle = document.createElement('h3');
  profileTitle.textContent = profile.displayName || 'Guest';
  const profileMeta = document.createElement('p');
  profileMeta.className = 'muted';
  profileMeta.textContent = `獲得ポイント: ${profile.points || 0} / 完了クエスト: ${profile.completedRuns || 0}`;

  const nameField = document.createElement('label');
  nameField.className = 'field';
  const nameLabel = document.createElement('span');
  nameLabel.textContent = '表示名';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = profile.displayName || '';
  nameInput.placeholder = 'Your name';
  nameInput.addEventListener('change', (event) => {
    const next = store.setProfileName(event.target.value);
    profileTitle.textContent = next.displayName || 'Guest';
    profileMeta.textContent = `獲得ポイント: ${next.points || 0} / 完了クエスト: ${next.completedRuns || 0}`;
    playSfx('ui:navigate');
    renderLeaderboard();
  });
  nameField.append(nameLabel, nameInput);

  const streakRow = document.createElement('p');
  streakRow.className = 'muted';
  streakRow.textContent = `ストリーク: ${pointSummary.streak} 日`;

  const totals = document.createElement('ul');
  totals.className = 'muted';
  const daily = document.createElement('li');
  daily.textContent = `本日: ${pointSummary.totals.daily} pts`;
  const weekly = document.createElement('li');
  weekly.textContent = `直近7日: ${pointSummary.totals.weekly} pts`;
  const monthly = document.createElement('li');
  monthly.textContent = `直近30日: ${pointSummary.totals.monthly} pts`;
  totals.append(daily, weekly, monthly);

  profileCard.append(profileTitle, profileMeta, streakRow, totals, nameField);

  const board = document.createElement('div');
  board.className = 'stack';

  const renderLeaderboard = () => {
    board.innerHTML = '';
    const entries = store.getLeaderboard();
    if (!entries || entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'まだランキング情報がありません。';
      board.append(empty);
      return;
    }
    entries.forEach((entry, index) => {
      board.append(createRankRow(index + 1, entry));
    });
  };

  renderLeaderboard();

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = '← ホームに戻る';
  back.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/');
  });

  container.append(heading, description, authNotice, profileCard, board, back);
  return container;
};
