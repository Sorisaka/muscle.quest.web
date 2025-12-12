import { getQuestById } from '../core/content.js';

const formatTime = (seconds) => {
  const safeSeconds = Math.max(seconds, 0);
  const mins = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const createControls = (navigate, onStop, onReset, questId, playSfx) => {
  const controls = document.createElement('div');
  controls.className = 'run-controls';

  const stopButton = document.createElement('button');
  stopButton.type = 'button';
  stopButton.className = 'ghost';
  stopButton.textContent = 'クエスト詳細へ';
  stopButton.addEventListener('click', () => {
    const confirmed = window.confirm('中断してクエスト詳細に戻りますか？');
    if (confirmed) {
      onStop();
      playSfx('timer:stop');
      navigate(`#/quest/${questId}`);
    }
  });

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'ghost';
  resetButton.textContent = 'リセット';
  resetButton.addEventListener('click', onReset);

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.textContent = '開始';

  controls.append(stopButton, resetButton, toggleButton);
  return { controls, toggleButton, stopButton, resetButton };
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

export const renderRun = (params, { navigate, store, playSfx }) => {
  const quest = getQuestById(params.id);
  const settings = store.getSettings();
  const { difficulty, sfxEnabled, sfxVolume, timerRestSeconds, timerSets } = settings;
  const runPlan = store.getRunPlan();

  const container = document.createElement('section');
  container.className = 'run-shell';

  if (!quest) {
    const missing = document.createElement('p');
    missing.textContent = 'クエストが見つかりませんでした。ホームに戻ります。';
    const back = document.createElement('button');
    back.type = 'button';
    back.addEventListener('click', () => {
      playSfx('ui:navigate');
      navigate('#/');
    });
    container.append(missing, back);
    return container;
  }

  const defaults = {
    mode: 'timer',
    trainingSeconds: runPlan.trainingSeconds ?? settings.timerTrainingSeconds ?? quest.estimatedMinutes * 60,
    restSeconds: runPlan.restSeconds ?? timerRestSeconds,
    sets: runPlan.sets ?? timerSets,
  };

  const resolvedPlan =
    runPlan.questId === quest.id
      ? {
          ...defaults,
          ...runPlan,
        }
      : { ...defaults, questId: quest.id };

  const trainingSeconds = Math.max(resolvedPlan.trainingSeconds || quest.estimatedMinutes * 60, 1);
  const restSeconds = Math.max(resolvedPlan.restSeconds ?? 0, 0);
  const sets = Math.max(resolvedPlan.sets ?? 1, 1);
  const mode = resolvedPlan.mode || 'timer';

  let phase = mode === 'timer' ? 'train' : 'stopwatch';
  let currentSet = 1;
  let remaining = mode === 'timer' ? trainingSeconds : 0;
  let elapsedStopwatch = 0;
  let isRunning = false;
  let intervalId = null;
  let lastTick = null;

  const timerBox = document.createElement('div');
  timerBox.className = 'run-timer';
  const timerLabel = document.createElement('p');
  timerLabel.className = 'muted';
  timerLabel.textContent = `${mode === 'timer' ? 'インターバル' : 'ストップウォッチ'} / 難易度: ${
    difficulty
  } / 音: ${sfxEnabled ? 'ON' : 'OFF'} / 音量: ${(sfxVolume * 100).toFixed(0)}%`;

  const statusRow = document.createElement('div');
  statusRow.className = 'run-timer__status';
  const phaseBadge = document.createElement('span');
  phaseBadge.className = 'pill';
  const setProgress = document.createElement('span');
  setProgress.className = 'muted';
  statusRow.append(phaseBadge, setProgress);

  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'run-timer__display';
  timeDisplay.textContent = mode === 'timer' ? formatTime(remaining) : '00:00';

  const subMeta = document.createElement('p');
  subMeta.className = 'muted run-timer__meta';
  subMeta.textContent =
    mode === 'timer'
      ? `トレーニング ${formatTime(trainingSeconds)} / 休憩 ${formatTime(restSeconds)} / ${sets} セット`
      : '経過時間を計測中';

  timerBox.append(timerLabel, statusRow, timeDisplay, subMeta);

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning = false;
  };

  const resetTimer = () => {
    stopTimer();
    phase = mode === 'timer' ? 'train' : 'stopwatch';
    currentSet = 1;
    remaining = mode === 'timer' ? trainingSeconds : 0;
    elapsedStopwatch = 0;
    updateDisplay();
  };

  const { controls, toggleButton, resetButton } = createControls(
    navigate,
    stopTimer,
    resetTimer,
    quest.id,
    playSfx,
  );

  const complete = () => {
    stopTimer();
    phase = 'complete';
    timeDisplay.textContent = '00:00';
    phaseBadge.textContent = '完了';
    setProgress.textContent = `${sets} / ${sets} セット`;
    toggleButton.textContent = '開始';
    playSfx('timer:complete');
    alert('全セット完了！お疲れさまでした。');
  };

  const updateDisplay = () => {
    if (mode === 'stopwatch') {
      phaseBadge.textContent = 'ストップウォッチ';
      setProgress.textContent = '経過計測';
      timeDisplay.textContent = formatTime(elapsedStopwatch);
      return;
    }

    const phaseLabel = phase === 'rest' ? '休憩中' : 'トレーニング中';
    phaseBadge.textContent = `${phaseLabel}`;
    setProgress.textContent = `${currentSet} / ${sets} セット`;
    timeDisplay.textContent = formatTime(remaining);
  };

  const tick = () => {
    if (!isRunning) return;
    const now = Date.now();
    const deltaSeconds = Math.floor((now - lastTick) / 1000);
    if (deltaSeconds <= 0) return;

    lastTick += deltaSeconds * 1000;

    if (mode === 'stopwatch') {
      elapsedStopwatch += deltaSeconds;
      updateDisplay();
      return;
    }

    remaining -= deltaSeconds;

    while (remaining <= 0) {
      const spill = Math.abs(remaining);
      if (phase === 'train' && restSeconds > 0) {
        phase = 'rest';
        remaining = restSeconds - spill;
      } else {
        currentSet += 1;
        if (currentSet > sets) {
          complete();
          return;
        }
        phase = 'train';
        remaining = trainingSeconds - spill;
      }
    }

    updateDisplay();
  };

  toggleButton.addEventListener('click', () => {
    if (isRunning) {
      stopTimer();
      toggleButton.textContent = '再開';
      playSfx('timer:stop');
      return;
    }

    if (mode === 'timer' && phase === 'complete') {
      resetTimer();
    }

    isRunning = true;
    toggleButton.textContent = '一時停止';
    playSfx('timer:start');
    lastTick = Date.now();
    intervalId = setInterval(tick, 1000);
  });

  resetButton.addEventListener('click', () => {
    resetTimer();
    playSfx('timer:stop');
  });

  const { sectionOne, sectionTwo } = createInstructions(quest);
  updateDisplay();

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
