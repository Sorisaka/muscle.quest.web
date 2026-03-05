import { quests } from '../core/content.js';

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

const findQuestIdByExercise = (exerciseSlug) => {
  const match = (quests || []).find((quest) => (quest.exercises || []).includes(exerciseSlug));
  return match?.id || null;
};

export const renderHome = (_params, { navigate, playSfx, store }) => {
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

  const beginnerCard = createTierCard('beginner', '初級', 'ウォームアップに最適な短めクエスト。', navigate, playSfx);
  const intermediateCard = createTierCard('intermediate', '中級', 'フォームを安定させながら負荷を上げる中距離戦。', navigate, playSfx);
  const advancedCard = createTierCard('advanced', '上級', '集中力と体力の両方を試すハードモード。', navigate, playSfx);

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
  startButton.textContent = 'このメニューでトレーニング開始';

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
      const questId = findQuestIdByExercise(first.exerciseSlug);
      playSfx('ui:navigate');
      if (questId) navigate(`#/run/${questId}`);
      else navigate('#/quests/beginner');
    };
  };

  renderTodos();

  todoCard.append(todoTitle, todoMeta, todoList, startButton);

  grid.append(beginnerCard, intermediateCard, advancedCard);
  container.append(rankButton, todoCard, grid);
  return container;
};
