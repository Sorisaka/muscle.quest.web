import { getQuestById, getQuestExercises } from '../core/content.js';

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

const clampSeconds = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') return 0;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return Math.min(59, parsed);
};

const clampMinutes = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') return 0;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return Math.min(180, parsed);
};

const secondsToParts = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return { mins, secs };
};

const createTimerControls = (quest, store, navigate, playSfx) => {
  const box = document.createElement('div');
  box.className = 'timer-box';

  let mode = 'timer';
  const persisted = store.getSettings();

  let trainingSeconds = persisted.timerTrainingSeconds || quest.estimatedMinutes * 60;
  let restSeconds = persisted.timerRestSeconds;
  let sets = persisted.timerSets;

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
    trainingMinutesInput.disabled = false;
    trainingSecondsInput.disabled = false;
    restMinutesInput.disabled = false;
    restSecondsInput.disabled = false;
    setCountInput.disabled = false;
  });
  timerOption.append(timerInput, document.createTextNode('タイマー'));

  const stopwatchOption = document.createElement('label');
  stopwatchOption.className = 'pill toggle';
  const stopwatchInput = document.createElement('input');
  stopwatchInput.type = 'radio';
  stopwatchInput.name = 'mode';
  stopwatchInput.addEventListener('change', () => {
    mode = 'stopwatch';
    trainingMinutesInput.disabled = true;
    trainingSecondsInput.disabled = true;
    restMinutesInput.disabled = true;
    restSecondsInput.disabled = true;
    setCountInput.disabled = true;
  });
  stopwatchOption.append(stopwatchInput, document.createTextNode('ストップウォッチ'));

  controls.append(timerOption, stopwatchOption);

  const createTimeField = (label, initialSeconds, onChange) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'field';

    const text = document.createElement('span');
    text.textContent = label;

    const inputs = document.createElement('div');
    inputs.className = 'time-inputs';

    const minutes = document.createElement('input');
    minutes.type = 'number';
    minutes.min = '0';
    minutes.max = '180';
    minutes.inputMode = 'numeric';

    const seconds = document.createElement('input');
    seconds.type = 'number';
    seconds.min = '0';
    seconds.max = '59';
    seconds.inputMode = 'numeric';

    const { mins, secs } = secondsToParts(initialSeconds);
    minutes.value = mins;
    seconds.value = secs;

    const handleChange = () => {
      const nextMinutes = clampMinutes(minutes.value);
      const nextSeconds = clampSeconds(seconds.value);

      minutes.value = nextMinutes;
      seconds.value = nextSeconds;
      onChange(nextMinutes * 60 + nextSeconds);
    };

    minutes.addEventListener('input', handleChange);
    seconds.addEventListener('input', handleChange);

    inputs.append(minutes, document.createTextNode('m'), seconds, document.createTextNode('s'));
    wrapper.append(text, inputs);
    return { wrapper, minutes, seconds };
  };

  const {
    wrapper: trainingWrapper,
    minutes: trainingMinutesInput,
    seconds: trainingSecondsInput,
  } = createTimeField('トレーニング時間', trainingSeconds, (total) => {
    trainingSeconds = total;
    store.updateSettings({ timerTrainingSeconds: total });
  });

  const { wrapper: restWrapper, minutes: restMinutesInput, seconds: restSecondsInput } = createTimeField(
    '休憩時間',
    restSeconds,
    (total) => {
      restSeconds = total;
      store.updateSettings({ timerRestSeconds: total });
    },
  );

  const setWrapper = document.createElement('label');
  setWrapper.className = 'field';
  const setText = document.createElement('span');
  setText.textContent = 'セット数';
  const setCountInput = document.createElement('input');
  setCountInput.type = 'number';
  setCountInput.min = '1';
  setCountInput.max = '20';
  setCountInput.inputMode = 'numeric';
  setCountInput.value = sets;
  setCountInput.addEventListener('input', (event) => {
    const parsed = Number(event.target.value);
    const normalized = Number.isFinite(parsed) ? Math.min(Math.max(Math.round(parsed), 1), 20) : 1;
    setCountInput.value = normalized;
    sets = normalized;
    store.updateSettings({ timerSets: normalized });
  });
  setWrapper.append(setText, setCountInput);

  const startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.textContent = '受注する';
  startButton.addEventListener('click', () => {
    if (mode === 'timer' && (trainingSeconds <= 0 || sets <= 0)) {
      alert('トレーニング時間とセット数を正しく入力してください。');
      return;
    }

    store.setRunPlan({
      questId: quest.id,
      mode,
      trainingSeconds,
      restSeconds,
      sets,
    });
    playSfx('timer:start');
    navigate(`#/run/${quest.id}`);
  });

  box.append(modeLabel, controls, trainingWrapper, restWrapper, setWrapper, startButton);
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

export const renderQuest = (params, { navigate, store, playSfx }) => {
  const quest = getQuestById(params.id);

  const container = document.createElement('section');
  container.className = 'stack';

  if (!quest) {
    const title = document.createElement('h2');
    title.textContent = 'Quest not found';
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = 'Back to quests';
    back.addEventListener('click', () => {
      playSfx('ui:navigate');
      navigate('#/');
    });
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
  const exerciseGuides = createExerciseGuides(quest);

  const steps = createSteps(quest.steps);
  const timerControls = createTimerControls(quest, store, navigate, playSfx);

  const backListButton = document.createElement('button');
  backListButton.type = 'button';
  backListButton.className = 'ghost';
  backListButton.textContent = '← 一覧に戻る';
  backListButton.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate(`#/quests/${quest.tier}`);
  });

  container.append(
    title,
    description,
    stars,
    exercises,
    exerciseGuides,
    steps,
    timerControls,
    backListButton,
  );
  return container;
};
