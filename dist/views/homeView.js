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

  const hero = document.createElement('div');
  hero.className = 'hero';

  const title = document.createElement('h2');
  title.textContent = '冒険の準備はOK？';
  const subtitle = document.createElement('p');
  subtitle.className = 'muted';
  subtitle.textContent = '設定から音・難易度を調整し、初級 / 中級 / 上級クエストに挑戦できます。';

  const cta = document.createElement('div');
  cta.className = 'hero__actions';
  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.textContent = '設定を開く';
  settingsButton.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/settings');
  });

  const quickNav = document.createElement('div');
  quickNav.className = 'hero__quick-nav';

  const createNavButton = (label, hash) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ghost';
    button.textContent = label;
    button.addEventListener('click', () => {
      playSfx('ui:navigate');
      navigate(hash);
    });
    return button;
  };

  quickNav.append(
    createNavButton('ホーム', '#/'),
    createNavButton('初級', '#/quests/beginner'),
    createNavButton('中級', '#/quests/intermediate'),
    createNavButton('上級', '#/quests/advanced'),
  );

  cta.append(settingsButton, quickNav);
  hero.append(title, subtitle, cta);

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  grid.append(
    createTierCard('beginner', '初級', 'ウォームアップに最適な短めクエスト。', navigate, playSfx),
    createTierCard('intermediate', '中級', 'フォームを安定させながら負荷を上げる中距離戦。', navigate, playSfx),
    createTierCard('advanced', '上級', '集中力と体力の両方を試すハードモード。', navigate, playSfx),
  );

  container.append(hero, grid);
  return container;
};
