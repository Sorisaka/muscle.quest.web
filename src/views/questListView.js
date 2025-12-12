import quests from '../data/quests.json' assert { type: 'json' };

const starBadge = (count) => `${'★'.repeat(count)} (${count})`;

const createQuestItem = (quest, navigate) => {
  const item = document.createElement('article');
  item.className = 'card quest-card';

  const header = document.createElement('div');
  header.className = 'quest-card__header';

  const title = document.createElement('h3');
  title.textContent = quest.title;

  const stars = document.createElement('span');
  stars.className = 'pill';
  stars.textContent = starBadge(quest.stars);

  header.append(title, stars);

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = quest.description;

  const meta = document.createElement('p');
  meta.className = 'muted quest-card__meta';
  meta.textContent = `推定 ${quest.estimatedMinutes} 分 / ステップ ${quest.steps.length}`;

  const actions = document.createElement('div');
  actions.className = 'quest-card__actions';

  const detailButton = document.createElement('button');
  detailButton.type = 'button';
  detailButton.textContent = '詳細';
  detailButton.addEventListener('click', () => navigate(`#/quest/${quest.id}`));

  actions.append(detailButton);

  item.append(header, description, meta, actions);
  return item;
};

const tierLabels = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
};

export const renderQuestList = (params, { navigate }) => {
  const listContainer = document.createElement('section');
  listContainer.className = 'stack';

  const tier = params.tier;
  const filtered = quests
    .filter((quest) => quest.tier === tier)
    .sort((a, b) => a.stars - b.stars);

  const heading = document.createElement('div');
  heading.className = 'list-header';

  const title = document.createElement('h2');
  title.textContent = `${tierLabels[tier] || tier} クエスト一覧`;

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = '← ホームに戻る';
  back.addEventListener('click', () => navigate('#/'));

  heading.append(title, back);

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = '★の少ない順で並べています。気になるクエストを選択してください。';

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'この級のクエストはまだありません。';
    grid.append(empty);
  } else {
    filtered.forEach((quest) => {
      grid.append(createQuestItem(quest, navigate));
    });
  }

  listContainer.append(heading, description, grid);
  return listContainer;
};
