import { getQuestById } from '../core/content.js';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.max(seconds % 60, 0)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const createControls = (navigate, onStop, questId) => {
  const controls = document.createElement('div');
  controls.className = 'run-controls';

  const stopButton = document.createElement('button');
  stopButton.type = 'button';
  stopButton.className = 'ghost';
  stopButton.textContent = '中断';
  stopButton.addEventListener('click', () => {
    const confirmed = window.confirm('中断してクエスト詳細に戻りますか？');
    if (confirmed) {
      onStop();
      navigate(`#/quest/${questId}`);
    }
  });

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.textContent = '開始';

  controls.append(stopButton, toggleButton);
  return { controls, toggleButton, stopButton };
};

const createInstructions = (quest) => {
  const sectionOne = document.createElement('div');
  sectionOne.className = 'run-howto__panel';
  const headingOne = document.createElement('h3');
  headingOne.textContent = '手順';
  const steps = document.createElement('ol');
  steps.className = 'steps';
  quest.steps.forEach((step) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${step.heading}</strong><p class=\"muted\">${step.body}</p>`;
    steps.append(li);
  });
  sectionOne.append(headingOne, steps);

  const sectionTwo = document.createElement('div');
  sectionTwo.className = 'run-howto__panel';
  const headingTwo = document.createElement('h3');
  headingTwo.textContent = 'フォームのコツ';
  const tips = document.createElement('ul');
  tips.className = 'muted';
  quest.tips.forEach((tip) => {
    const li = document.createElement('li');
    li.textContent = tip;
    tips.append(li);
  });
  sectionTwo.append(headingTwo, tips);

  return { sectionOne, sectionTwo };
};

export const renderRun = (params, { navigate, store }) => {
  const quest = getQuestById(params.id);
  const { difficulty, sound } = store.getSettings();
  const runPlan = store.getRunPlan();

  const container = document.createElement('section');
  container.className = 'run-shell';

  if (!quest) {
    const missing = document.createElement('p');
    missing.textContent = 'クエストが見つかりませんでした。ホームに戻ります。';
    const back = document.createElement('button');
    back.type = 'button';
    back.addEventListener('click', () => navigate('#/'));
    container.append(missing, back);
    return container;
  }

  const baseSeconds = runPlan.questId === quest.id ? runPlan.seconds : quest.estimatedMinutes * 60;
  let counter = baseSeconds;
  let isRunning = false;
  let intervalId = null;
  const mode = runPlan.questId === quest.id ? runPlan.mode : 'timer';

  const timerBox = document.createElement('div');
  timerBox.className = 'run-timer';
  const timerLabel = document.createElement('p');
  timerLabel.className = 'muted';
  timerLabel.textContent = `${mode === 'timer' ? 'タイマー' : 'ストップウォッチ'} / 難易度: ${difficulty} / 音: ${
    sound ? 'ON' : 'OFF'
  }`;
  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'run-timer__display';
  timeDisplay.textContent = mode === 'timer' ? formatTime(counter) : '00:00';

  timerBox.append(timerLabel, timeDisplay);

  const { sectionOne, sectionTwo } = createInstructions(quest);

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning = false;
  };

  const { controls, toggleButton } = createControls(navigate, stopTimer, quest.id);

  const tick = () => {
    if (!isRunning) return;
    counter = mode === 'timer' ? counter - 1 : counter + 1;
    timeDisplay.textContent = formatTime(counter);
    if (mode === 'timer' && counter <= 0) {
      stopTimer();
      alert('タイマーが終了しました！');
    }
  };

  toggleButton.addEventListener('click', () => {
    if (isRunning) {
      stopTimer();
      toggleButton.textContent = '開始';
      return;
    }

    if (mode === 'timer' && counter <= 0) {
      counter = baseSeconds;
      timeDisplay.textContent = formatTime(counter);
    }

    isRunning = true;
    toggleButton.textContent = '停止';
    intervalId = setInterval(tick, 1000);
  });

  window.addEventListener(
    'hashchange',
    () => {
      stopTimer();
    },
    { once: true },
  );

  container.append(timerBox, sectionOne, sectionTwo, controls);
  return container;
};
