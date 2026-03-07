import { MUSCLE_GROUPS } from '../core/exerciseTaxonomy.js';
import { defaultHistoryFilter } from '../core/historyFilters.js';

export const HISTORY_CATEGORY_OPTIONS = [
  { value: 'all', label: '全て' },
  { value: 'cardio', label: '有酸素' },
  { value: 'bodyweight', label: '自重' },
  { value: 'weights', label: 'ウエイト' },
];

export const HISTORY_CATEGORY_LABELS = {
  cardio: '有酸素',
  bodyweight: '自重',
  weights: 'ウエイト',
  unknown: '未分類',
};

export const HISTORY_MUSCLE_LABELS = {
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

export const toMuscleLabel = (value) => HISTORY_MUSCLE_LABELS[value] || value;

export const createHistoryFilterControls = ({ state, onChange, title = '絞り込み', cardClassName = 'card account-card stack' }) => {
  const card = document.createElement('div');
  card.className = cardClassName;

  const heading = document.createElement('h3');
  heading.textContent = title;

  const categoryField = document.createElement('label');
  categoryField.className = 'field';
  const categoryLabel = document.createElement('span');
  categoryLabel.textContent = '種類';
  const categorySelect = document.createElement('select');

  HISTORY_CATEGORY_OPTIONS.forEach((option) => {
    const node = document.createElement('option');
    node.value = option.value;
    node.textContent = option.label;
    if (state.category === option.value) node.selected = true;
    categorySelect.append(node);
  });

  categorySelect.addEventListener('change', (event) => {
    onChange({ ...state, category: event.target.value });
  });

  categoryField.append(categoryLabel, categorySelect);

  const muscleRow = document.createElement('div');
  muscleRow.className = 'history-muscle-filters';
  MUSCLE_GROUPS.forEach((muscle) => {
    const selected = state.muscles.includes(muscle);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pill history-filter-pill ${selected ? 'is-active' : ''}`.trim();
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = toMuscleLabel(muscle);
    button.addEventListener('click', () => {
      const next = selected
        ? state.muscles.filter((entry) => entry !== muscle)
        : [...state.muscles, muscle];
      onChange({ ...state, muscles: next });
    });
    muscleRow.append(button);
  });

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'ghost';
  reset.textContent = 'フィルタ解除';
  reset.addEventListener('click', () => onChange({ ...defaultHistoryFilter }));

  card.append(heading, categoryField, muscleRow, reset);
  return card;
};
