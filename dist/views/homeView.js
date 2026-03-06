import { quests } from '../core/content.js';

const createCategoryCard = (tier, label, summary, navigate, playSfx) => {
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
    navigate(`#/workouts/${tier}`);
  });

  card.append(title, description, action);
  return card;
};

const findWorkoutIdByExercise = (exerciseSlug) => {
  const match = (quests || []).find((quest) => (quest.exercises || []).includes(exerciseSlug));
  return match?.id || null;
};

export const renderHome = (_params, { navigate, playSfx, store }) => {
  const container = document.createElement('section');
  container.className = 'stack';

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  const cardioCard = createCategoryCard('beginner', '有酸素', '心拍を上げるベースメニュー。', navigate, playSfx);
  const bodyweightCard = createCategoryCard('intermediate', '自重', '器具なしで全身を鍛える。', navigate, playSfx);
  const weightsCard = createCategoryCard('advanced', 'ウエイト', '負荷をかけて筋力アップ。', navigate, playSfx);

  const todoCard = document.createElement('article');
  todoCard.className = 'card stack';
  const todoTitle = document.createElement('h3');
  todoTitle.textContent = '今日のTODOメニュー';
  const todoMeta = document.createElement('p');
  todoMeta.className = 'muted';
  const todoList = document.createElement('div');
  todoList.className = 'stack';

  const startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.textContent = 'このメニューでワークアウト開始';

  const renderTodos = async () => {
    const userId = store.getProfile()?.id || 'local-user';
    await Promise.resolve(store.loadWeeklyPlan(userId));
    const today = store.getTodayPlan(userId, new Date());
    await Promise.resolve(store.loadSpecialPlan(userId, today.dateKey));
    const nextToday = store.getTodayPlan(userId, new Date());
    const checks = store.getTodoStateForDate(nextToday.dateKey);

    todoMeta.textContent = `ソース: ${nextToday.source === 'special' ? '特別日メニュー' : '週間メニュー'} (${nextToday.dateKey})`;
    todoList.innerHTML = '';

    if (!nextToday.items.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = '今日のメニューは未設定です。設定ページから追加してください。';
      todoList.append(empty);
      startButton.disabled = true;
      return;
    }

    nextToday.items.forEach((item, index) => {
      const row = document.createElement('label');
      row.className = 'row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(checks[index]);
      checkbox.addEventListener('change', (event) => {
        store.setTodoDone(nextToday.dateKey, index, event.target.checked);
      });
      const text = document.createElement('span');
      text.textContent = `${item.exerciseSlug} (${item.category})`;
      row.append(checkbox, text);
      todoList.append(row);
    });

    startButton.disabled = false;
    startButton.onclick = () => {
      const first = nextToday.items[0];
      const workoutId = findWorkoutIdByExercise(first.exerciseSlug);
      playSfx('ui:navigate');
      if (workoutId) navigate(`#/run/${workoutId}`);
      else navigate('#/workouts/beginner');
    };
  };

  renderTodos();

  todoCard.append(todoTitle, todoMeta, todoList, startButton);

  grid.append(cardioCard, bodyweightCard, weightsCard);
  container.append(todoCard, grid);
  return container;
};
