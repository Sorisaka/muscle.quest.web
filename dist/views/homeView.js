const createTierCard = (tier, label, summary, navigate, playSfx) => {
  const card = document.createElement('article');
  card.className = 'card tier-card';

  const header = document.createElement('div');
  header.className = 'tier-card__header';
  const title = document.createElement('h3');
  title.textContent = label;
  const badge = document.createElement('span');
  badge.className = 'pill';
  badge.textContent = tier;
  header.append(title, badge);

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = summary;

  const action = document.createElement('button');
  action.type = 'button';
  action.textContent = 'クエスト一覧へ';
  action.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate(`#/quests/${tier}`);
  });

  card.append(header, description, action);
  return card;
};

export const renderHome = (_params, { navigate, playSfx }) => {
  const container = document.createElement('section');
  container.className = 'stack';

  const authPlaceholder = document.createElement('div');
  authPlaceholder.className = 'card auth-placeholder';
  const authHeading = document.createElement('div');
  authHeading.className = 'auth-placeholder__header';
  authHeading.innerHTML = '<strong>未ログイン</strong>（ローカルゲストとして動作中）';

  const authCopy = document.createElement('p');
  authCopy.className = 'muted';
  authCopy.textContent = '将来ここに Supabase ログインを配置し、クラウド同期を切り替えられるようにします。';

  const loginButton = document.createElement('button');
  loginButton.type = 'button';
  loginButton.disabled = true;
  loginButton.className = 'ghost';
  loginButton.textContent = 'Supabase ログイン（準備中）';

  authPlaceholder.append(authHeading, authCopy, loginButton);

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  const beginnerCard = createTierCard(
    'beginner',
    '初級',
    'ウォームアップに最適な短めクエスト。',
    navigate,
    playSfx,
  );
  const intermediateCard = createTierCard(
    'intermediate',
    '中級',
    'フォームを安定させながら負荷を上げる中距離戦。',
    navigate,
    playSfx,
  );
  const advancedCard = createTierCard(
    'advanced',
    '上級',
    '集中力と体力の両方を試すハードモード。',
    navigate,
    playSfx,
  );

  grid.append(beginnerCard, intermediateCard, advancedCard);

  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.textContent = '設定を開く';
  settingsButton.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/settings');
  });

  const rankButton = document.createElement('button');
  rankButton.type = 'button';
  rankButton.className = 'ghost';
  rankButton.textContent = 'ランキングを見る';
  rankButton.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/rank/local');
  });

  container.append(authPlaceholder, grid, settingsButton, rankButton);
  return container;
};
