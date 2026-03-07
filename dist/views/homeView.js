import { quests } from '../core/content.js';
import { createPlanFromDefinition } from '../core/trainingPlan.js';

const createCategoryCard = (category, label, summary, navigate, playSfx) => {
  const card = document.createElement('article');
  card.className = 'card tier-card';

  const title = document.createElement('h3');
  title.textContent = label;

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = summary;

  const action = document.createElement('button');
  action.type = 'button';
  action.textContent = 'ワークアウト一覧へ';
  action.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate(`#/workouts/${category}`);
  });

  card.append(title, description, action);
  return card;
};

const findWorkoutIdByExercise = (exerciseSlug) => {
  const match = (quests || []).find((quest) => (quest.exercises || []).includes(exerciseSlug));
  return match?.id || null;
};

const createSetsFromMenuConfig = (inputMode, config = {}) => {
  const setCount = Math.max(Number(config.sets) || 1, 1);
  if (inputMode === 'weightReps') {
    return Array.from({ length: setCount }, () => ({
      weight: Number.isFinite(Number(config.weight)) ? Number(config.weight) : 0,
      reps: Number.isFinite(Number(config.reps)) ? Number(config.reps) : 10,
    }));
  }
  if (inputMode === 'reps') {
    return Array.from({ length: setCount }, () => ({
      reps: Number.isFinite(Number(config.reps)) ? Number(config.reps) : 10,
    }));
  }
  return [];
};

export const renderHome = (_params, { navigate, playSfx, store }) => {
  const container = document.createElement('section');
  container.className = 'stack';

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  const cardioCard = createCategoryCard('cardio', '有酸素', '心拍を上げるベースメニュー。', navigate, playSfx);
  const bodyweightCard = createCategoryCard('bodyweight', '自重', '器具なしで全身を鍛える。', navigate, playSfx);
  const weightsCard = createCategoryCard('weights', 'ウエイト', '負荷をかけて筋力アップ。', navigate, playSfx);

  const todoCard = document.createElement('article');
  todoCard.className = 'card stack';
  const todoTitle = document.createElement('h3');
  todoTitle.textContent = '今日のTODOメニュー';
  const todoMeta = document.createElement('p');
  todoMeta.className = 'muted';
  const todoList = document.createElement('div');
  todoList.className = 'stack';
  let mounted = true;

  const startWorkoutFromTodo = (item) => {
    if (!item) return;
    const workoutId = findWorkoutIdByExercise(item.exerciseSlug);
    const settings = store.getSettings?.() || {};
    const difficulty = settings.difficulty || 'beginner';
    playSfx('ui:navigate');

    if (workoutId) {
      const quest = (quests || []).find((entry) => entry.id === workoutId);
      const plan = createPlanFromDefinition(quest, difficulty, store.getLastPlan?.(workoutId, difficulty));
      const config = item.config || item.workoutConfig || {};
      const menuInputMode = config.inputMode || plan.inputMode;
      const nextPlan = {
        ...plan,
        inputMode: menuInputMode,
        mode: menuInputMode === 'time' ? 'time' : 'setRest',
        defaultTimerMode: menuInputMode === 'time' ? 'time' : 'setRest',
        timeMode: menuInputMode === 'time' ? (config.timeMode || plan.timeMode || 'stopwatch') : 'stopwatch',
        defaultTimeMode: menuInputMode === 'time' ? (config.timeMode || plan.defaultTimeMode || 'stopwatch') : 'stopwatch',
        restSeconds: config.restSeconds ?? plan.restSeconds,
        trainingSeconds: config.workSeconds ?? plan.trainingSeconds,
        sets: createSetsFromMenuConfig(menuInputMode, config),
        metricGoals: plan.goalConfig?.type === 'distance'
          ? { distanceMeters: config.distanceMeters ?? plan.metricGoals?.distanceMeters ?? plan.goalConfig.defaultValue }
          : plan.metricGoals,
      };
      store.rememberPlan(workoutId, difficulty, nextPlan);
      navigate(`#/run/${workoutId}`);
      return;
    }

    navigate(`#/workouts/${item?.category || 'cardio'}`);
  };

  const renderTodos = () => {
    if (!mounted) return;

    const userId = store.getProfile()?.id || 'local-user';
    const today = store.getTodayPlan(userId, new Date());
    const checks = store.getTodoStateForDate(today.dateKey);

    todoMeta.textContent = `ソース: ${today.source === 'special' ? '特別日メニュー' : '週間メニュー'} (${today.dateKey})`;
    todoList.innerHTML = '';

    if (!today.items.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = '今日のメニューは未設定です。設定ページから追加してください。';
      todoList.append(empty);
      return;
    }

    today.items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'row todo-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(checks[index]);
      checkbox.addEventListener('change', (event) => {
        store.setTodoDone(today.dateKey, index, event.target.checked);
      });
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'todo-row__action';
      const fallback = item.defaultLabel || item.workoutLabel || item.exerciseSlug || '不明なワークアウト';
      const title = (item.displayName || item.title || '').trim() || fallback;
      action.textContent = `${title} (${item.category || 'unknown'})`;
      action.addEventListener('click', () => {
        startWorkoutFromTodo(item);
      });
      row.append(checkbox, action);
      todoList.append(row);
    });
  };

  const loadTodos = async () => {
    const userId = store.getProfile()?.id || 'local-user';
    await Promise.resolve(store.loadWeeklyPlan(userId));
    const today = store.getTodayPlan(userId, new Date());
    await Promise.resolve(store.loadSpecialPlan(userId, today.dateKey));
  };

  todoMeta.textContent = '今日のTODOメニューを読み込み中...';
  loadTodos()
    .then(() => {
      if (mounted) renderTodos();
    })
    .catch(() => {
      if (!mounted) return;
      todoList.innerHTML = '';
      todoMeta.textContent = 'TODOメニューの取得に失敗しました。';
    });

  const unsubscribe = typeof store.subscribeProfile === 'function'
    ? store.subscribeProfile(() => {
      renderTodos();
    })
    : null;

  todoCard.append(todoTitle, todoMeta, todoList);

  grid.append(cardioCard, bodyweightCard, weightsCard);
  container.append(todoCard, grid);
  return {
    element: container,
    dispose: () => {
      mounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    },
  };
};
