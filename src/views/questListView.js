import { getQuestsByTier } from '../core/content.js';

const starBadge = (count) => `${'★'.repeat(count)} (${count})`;

const createWorkoutItem = (quest, navigate, playSfx) => {
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
  detailButton.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate(`#/workout/${quest.id}`);
  });

  actions.append(detailButton);
  item.append(header, description, meta, actions);
  return item;
};

const tierLabels = {
  beginner: '有酸素',
  intermediate: '自重',
  advanced: 'ウエイト',
};

export const renderQuestList = (params, { navigate, playSfx }) => {
  const listContainer = document.createElement('section');
  listContainer.className = 'stack';

  const tier = params.tier;
  const filtered = getQuestsByTier(tier);

  const title = document.createElement('h2');
  title.textContent = `${tierLabels[tier] || tier} ワークアウト一覧`;

  const filterCard = document.createElement('div');
  filterCard.className = 'card stack';
  const filterTitle = document.createElement('h3');
  filterTitle.textContent = '効く部位で絞り込み（準備中）';
  const filterRow = document.createElement('div');
  filterRow.className = 'tabs';
  ['全身', '上半身', '下半身', '体幹'].forEach((part) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'tab';
    chip.textContent = part;
    chip.disabled = true;
    filterRow.append(chip);
  });
  filterCard.append(filterTitle, filterRow);

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = '設定済みトレーニング種類に応じて、ここに候補を出し分ける想定です。';

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'このカテゴリのワークアウトはまだありません。';
    grid.append(empty);
  } else {
    filtered.forEach((quest) => {
      grid.append(createWorkoutItem(quest, navigate, playSfx));
    });
  }

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = '← ホームに戻る';
  back.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/');
  });

  listContainer.append(title, filterCard, description, grid, back);
  return listContainer;
};
