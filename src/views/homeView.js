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

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  const rankButton = document.createElement('button');
  rankButton.type = 'button';
  rankButton.className = 'ghost';
  rankButton.textContent = 'ランキングを見る';
  rankButton.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/rank/local');
  });

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
  container.append(rankButton, grid);
  return container;
};
