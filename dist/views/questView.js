import quests from '../data/quests.json' assert { type: 'json' };

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

const createTimerControls = (quest, store, navigate) => {
  const box = document.createElement('div');
  box.className = 'timer-box';

  let mode = 'timer';
  let minutes = quest.estimatedMinutes;

  const modeLabel = document.createElement('p');
  modeLabel.textContent = 'タイマー設定 or ストップウォッチ';

  const controls = document.createElement('div');
  controls.className = 'timer-box__controls';

  const timerOption = document.createElement('label');
  timerOption.className = 'pill toggle';
  const timerInput = document.createElement('input');
  timerInput.type = 'radio';
  timerInput.name = 'mode';
  timerInput.checked = true;
  timerInput.addEventListener('change', () => {
    mode = 'timer';
    minutesInput.disabled = false;
  });
  timerOption.append(timerInput, document.createTextNode('タイマー'));

  const stopwatchOption = document.createElement('label');
  stopwatchOption.className = 'pill toggle';
  const stopwatchInput = document.createElement('input');
  stopwatchInput.type = 'radio';
  stopwatchInput.name = 'mode';
  stopwatchInput.addEventListener('change', () => {
    mode = 'stopwatch';
    minutesInput.disabled = true;
  });
  stopwatchOption.append(stopwatchInput, document.createTextNode('ストップウォッチ'));

  controls.append(timerOption, stopwatchOption);

  const minutesWrapper = document.createElement('label');
  minutesWrapper.className = 'field';
  const minutesText = document.createElement('span');
  minutesText.textContent = 'タイマー分数';
  const minutesInput = document.createElement('input');
  minutesInput.type = 'number';
  minutesInput.min = '1';
  minutesInput.max = '90';
  minutesInput.value = minutes;
  minutesInput.addEventListener('input', (event) => {
    const parsed = Number(event.target.value) || quest.estimatedMinutes;
    minutes = Math.min(Math.max(parsed, 1), 90);
  });
  minutesWrapper.append(minutesText, minutesInput);

  const startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.textContent = '受注する';
  startButton.addEventListener('click', () => {
    store.setRunPlan({
      questId: quest.id,
      mode,
      seconds: mode === 'timer' ? minutes * 60 : 0,
    });
    navigate(`#/run/${quest.id}`);
  });

  box.append(modeLabel, controls, minutesWrapper, startButton);
  return box;
};

const createSteps = (steps) => {
  const list = document.createElement('ol');
  list.className = 'steps';
  steps.forEach((step) => {
    const item = document.createElement('li');
    const heading = document.createElement('strong');
    heading.textContent = step.heading;
    const detail = document.createElement('p');
    detail.className = 'muted';
    detail.textContent = step.body;
    item.append(heading, detail);
    list.append(item);
  });
  return list;
};

export const renderQuest = (params, { navigate, store }) => {
  const quest = quests.find((entry) => entry.id === params.id);

  const container = document.createElement('section');
  container.className = 'stack';

  if (!quest) {
    const title = document.createElement('h2');
    title.textContent = 'Quest not found';
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = 'Back to quests';
    back.addEventListener('click', () => navigate('#/'));
    container.append(title, back);
    return container;
  }

  const title = document.createElement('h2');
  title.textContent = quest.title;

  const description = document.createElement('p');
  description.textContent = quest.description;

  const stars = document.createElement('p');
  stars.className = 'muted';
  stars.textContent = `${starDisplay(quest.stars)} • ~${quest.estimatedMinutes} minutes`;

  const exercises = createExerciseList(quest.exercises);

  const learnButton = document.createElement('a');
  learnButton.href = quest.link;
  learnButton.className = 'link';
  learnButton.textContent = 'やり方リンクを開く';
  learnButton.target = '_blank';
  learnButton.rel = 'noreferrer';

  const steps = createSteps(quest.steps);
  const timerControls = createTimerControls(quest, store, navigate);

  const backListButton = document.createElement('button');
  backListButton.type = 'button';
  backListButton.className = 'ghost';
  backListButton.textContent = '← 一覧に戻る';
  backListButton.addEventListener('click', () => navigate(`#/quests/${quest.tier}`));

  container.append(
    title,
    description,
    stars,
    exercises,
    learnButton,
    steps,
    timerControls,
    backListButton,
  );
  return container;
};
