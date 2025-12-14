import { getQuestById, getQuestExercises } from '../core/content.js';
import { createPlanFromDefinition } from '../core/trainingPlan.js';

const starDisplay = (count) => '★'.repeat(count) || 'No rating yet';

const createExerciseList = (exercises) => {
  const list = document.createElement('ul');
  list.className = 'pill-list';
  exercises.forEach((exercise) => {
    const item = document.createElement('li');
    item.className = 'pill';
    item.textContent = exercise;
    list.append(item);
  });
  return list;
};

const createExerciseGuides = (quest) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'exercise-guides';

  const heading = document.createElement('h3');
  heading.textContent = 'やり方ガイド';

  const guides = document.createElement('div');
  guides.className = 'exercise-guides__list';

  const exerciseEntries = getQuestExercises(quest);
  if (exerciseEntries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'このクエストに紐づくフォームガイドはまだありません。';
    guides.append(empty);
  } else {
    exerciseEntries.forEach((exercise) => {
      const details = document.createElement('details');
      details.className = 'exercise-guides__item';

      const summary = document.createElement('summary');
      summary.textContent = exercise.title || exercise.slug;

      const body = document.createElement('div');
      body.className = 'exercise-guides__body';
      body.innerHTML = exercise.body || '<p class="muted">ガイドが見つかりませんでした。</p>';

      details.append(summary, body);
      guides.append(details);
    });
  }

  wrapper.append(heading, guides);
  return wrapper;
};

const renderPlanPreview = (plan) => {
  const box = document.createElement('div');
  box.className = 'hero';
  const heading = document.createElement('h3');
  heading.textContent = 'トレーニング設定 (難易度依存)';
  const summary = document.createElement('p');
  summary.className = 'muted';
  summary.textContent =
    plan.unit === 'time'
      ? `各セット ${plan.trainingSeconds} 秒 / 休憩 ${plan.restSeconds} 秒 / ${plan.sets.length} セット`
      : `${plan.sets.length} セット（各セット重さ×回数を実施）`;

  const detail = document.createElement('ul');
  detail.className = 'muted';
  plan.sets.forEach((set, index) => {
    const item = document.createElement('li');
    if (plan.unit === 'time') {
      item.textContent = `セット${index + 1}: ${set.timeSeconds}秒`;
    } else {
      item.textContent = `セット${index + 1}: ${set.weight}kg x ${set.reps}回`;
    }
    detail.append(item);
  });

  box.append(heading, summary, detail);
  return box;
};

export const renderQuest = (params, { navigate, store, playSfx }) => {
  const quest = getQuestById(params.id);
  const container = document.createElement('section');
  container.className = 'stack';

  if (!quest) {
    const missing = document.createElement('p');
    missing.textContent = 'クエストが見つかりませんでした。ホームに戻ります。';
    container.append(missing);
    return container;
  }

  const heading = document.createElement('div');
  heading.className = 'list-header quest-header';

  const title = document.createElement('h2');
  title.textContent = quest.title;

  const backToList = document.createElement('button');
  backToList.type = 'button';
  backToList.className = 'ghost';
  backToList.textContent = '一覧に戻る';
  backToList.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate(`#/quests/${quest.tier}`);
  });

  heading.append(title, backToList);
  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = quest.description;

  const meta = document.createElement('p');
  meta.className = 'muted';
  meta.textContent = `難易度: ${quest.tier} / 推定 ${quest.estimatedMinutes}分 / 評価 ${starDisplay(quest.stars)}`;

  const exercises = document.createElement('div');
  const exerciseHeading = document.createElement('h3');
  exerciseHeading.textContent = '種目';
  exercises.append(exerciseHeading, createExerciseList(quest.exercises));

  const settings = store.getSettings();
  const previousPlan = store.getLastPlan(quest.id, settings.difficulty);
  const plan = createPlanFromDefinition(quest, settings.difficulty, previousPlan);

  const planPreview = renderPlanPreview(plan);

  const start = document.createElement('button');
  start.type = 'button';
  start.textContent = '開始する（編集してポイントUP）';
  start.addEventListener('click', () => {
    store.rememberPlan(quest.id, settings.difficulty, plan);
    playSfx('ui:navigate');
    navigate(`#/run/${quest.id}`);
  });

  container.append(heading, description, meta, exercises, planPreview, createExerciseGuides(quest), start);
  return container;
};
