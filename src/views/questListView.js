import { getQuestsByTier } from '../core/content.js';
import { getExerciseTags, MUSCLE_GROUPS } from '../core/exerciseTaxonomy.js';

const starBadge = (count) => `${'★'.repeat(count)} (${count})`;

const tierLabels = {
  cardio: '有酸素',
  bodyweight: '自重',
  weights: 'ウエイト',
};

const FILTER_STORAGE_KEY = 'musclequest:questListMuscleFilter';
const MUSCLE_LABELS = {
  chest: '胸',
  back: '背中',
  shoulders: '肩',
  arms: '腕',
  core: '体幹',
  legs: '脚',
  glutes: '臀部',
  fullbody: '全身',
  other: 'その他',
};

const FILTER_ORDER = ['fullbody', 'chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes', 'other'];

const readFilterState = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(FILTER_STORAGE_KEY) || '{}');
    const byTier = parsed && typeof parsed === 'object' ? parsed : {};
    Object.keys(byTier).forEach((tier) => {
      if (!Array.isArray(byTier[tier])) byTier[tier] = [];
      byTier[tier] = byTier[tier].filter((m) => MUSCLE_GROUPS.includes(m));
    });
    return byTier;
  } catch (_error) {
    return {};
  }
};

const writeFilterState = (value) => {
  localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(value || {}));
};

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

const collectQuestMuscles = (quest = {}) => {
  const fromExercises = (quest.exercises || []).flatMap((slug) => getExerciseTags(slug).muscles || []);
  return Array.from(new Set(fromExercises.filter((muscle) => MUSCLE_GROUPS.includes(muscle))));
};

export const renderQuestList = (params, { navigate, playSfx }) => {
  const listContainer = document.createElement('section');
  listContainer.className = 'stack';

  const tier = params.tier;
  const allQuests = getQuestsByTier(tier);
  const filtersByTier = readFilterState();
  let selectedMuscles = Array.isArray(filtersByTier[tier]) ? filtersByTier[tier] : [];

  const title = document.createElement('h2');
  title.textContent = `${tierLabels[tier] || tier} ワークアウト一覧`;

  const filterCard = document.createElement('div');
  filterCard.className = 'card stack';
  const filterTitle = document.createElement('h3');
  filterTitle.textContent = '効く部位で絞り込み';

  const helper = document.createElement('p');
  helper.className = 'muted';
  helper.textContent = '複数選択時は AND 条件（すべての部位に一致）で絞り込みます。';

  const filterRow = document.createElement('div');
  filterRow.className = 'tabs';

  const clearFilter = document.createElement('button');
  clearFilter.type = 'button';
  clearFilter.className = 'ghost';
  clearFilter.textContent = '絞り込み解除';

  const count = document.createElement('p');
  count.className = 'muted';

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  const getFiltered = () => {
    if (!selectedMuscles.length) return allQuests;
    return allQuests.filter((quest) => {
      const questMuscles = collectQuestMuscles(quest);
      return selectedMuscles.every((muscle) => questMuscles.includes(muscle));
    });
  };

  const persist = () => {
    const next = readFilterState();
    next[tier] = selectedMuscles.slice();
    writeFilterState(next);
  };

  const renderList = () => {
    grid.innerHTML = '';
    const filtered = getFiltered();
    count.textContent = `表示件数: ${filtered.length} / ${allQuests.length}`;

    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = '選択中の部位に一致するワークアウトはありません。';
      grid.append(empty);
      return;
    }

    filtered.forEach((quest) => {
      grid.append(createWorkoutItem(quest, navigate, playSfx));
    });
  };

  FILTER_ORDER.forEach((muscle) => {
    if (!MUSCLE_GROUPS.includes(muscle)) return;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'tab';
    chip.textContent = MUSCLE_LABELS[muscle] || muscle;
    chip.classList.toggle('is-active', selectedMuscles.includes(muscle));
    chip.addEventListener('click', () => {
      if (selectedMuscles.includes(muscle)) {
        selectedMuscles = selectedMuscles.filter((entry) => entry !== muscle);
      } else {
        selectedMuscles = [...selectedMuscles, muscle];
      }
      chip.classList.toggle('is-active', selectedMuscles.includes(muscle));
      persist();
      renderList();
    });
    filterRow.append(chip);
  });

  clearFilter.addEventListener('click', () => {
    selectedMuscles = [];
    filterRow.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('is-active'));
    persist();
    renderList();
  });

  filterCard.append(filterTitle, helper, filterRow, clearFilter, count);

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = '← ホームに戻る';
  back.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/');
  });

  renderList();

  listContainer.append(title, filterCard, grid, back);
  return listContainer;
};
