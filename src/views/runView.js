import { getQuestById } from '../core/content.js';
import { createTimerEngine } from '../core/timerEngine.js';
import { createPlanFromDefinition } from '../core/trainingPlan.js';
import { trainingConfig } from '../data/trainingConfig.js';

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

const createControls = (navigate, questId, playSfx, onReset, onToggle, onComplete) => {
  const controls = document.createElement('div');
  controls.className = 'run-controls';

  const stopButton = document.createElement('button');
  stopButton.type = 'button';
  stopButton.className = 'ghost';
  stopButton.textContent = 'クエスト詳細へ';
  stopButton.addEventListener('click', () => {
    const confirmed = window.confirm('中断してクエスト詳細に戻りますか？');
    if (confirmed) {
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
  toggleButton.addEventListener('click', onToggle);

  const completeButton = document.createElement('button');
  completeButton.type = 'button';
  completeButton.textContent = '完了して記録';
  completeButton.addEventListener('click', onComplete);

  controls.append(stopButton, resetButton, toggleButton, completeButton);
  return { controls, toggleButton, completeButton };
};

const computeCompletedSets = (snapshot, setsLength) => {
  if (snapshot.mode !== 'interval') return Math.max(setsLength || 1, 1);
  if (snapshot.state === 'finished') return snapshot.totalSets;
  const finishedSets = snapshot.phase === 'work' ? snapshot.currentSet - 1 : snapshot.currentSet;
  return Math.max(Math.min(finishedSets, snapshot.totalSets), 0);
};

const clampNumber = (value, min, max) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  if (min == null && max == null) return numeric;
  if (min == null) return Math.min(max, numeric);
  if (max == null) return Math.max(min, numeric);
  return Math.max(min, Math.min(max, numeric));
};

const buildSetInputs = (unit, limits, planSets, onChange) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'stack set-editor';

  planSets.forEach((set, index) => {
    const row = document.createElement('div');
    row.className = 'row set-editor__row';

    const label = document.createElement('span');
    label.className = 'muted';
    label.textContent = `セット ${index + 1}`;
    row.append(label);

    if (unit === 'time') {
      const input = document.createElement('input');
      input.type = 'number';
      input.min = limits.timeSeconds?.min ?? 0;
      input.max = limits.timeSeconds?.max ?? 1800;
      input.step = 5;
      input.value = set.timeSeconds;
      input.addEventListener('change', (event) => {
        const next = clampNumber(event.target.value, limits.timeSeconds?.min, limits.timeSeconds?.max);
        onChange(index, { timeSeconds: next });
      });
      row.append(input);
      const unitLabel = document.createElement('span');
      unitLabel.className = 'muted';
      unitLabel.textContent = '秒';
      row.append(unitLabel);
    } else {
      const weight = document.createElement('input');
      weight.type = 'number';
      weight.min = limits.weight?.min ?? 0;
      weight.max = limits.weight?.max ?? 200;
      weight.step = 1;
      weight.value = set.weight;
      weight.addEventListener('change', (event) => {
        const next = clampNumber(event.target.value, limits.weight?.min, limits.weight?.max);
        onChange(index, { weight: next, reps: set.reps });
      });

      const reps = document.createElement('input');
      reps.type = 'number';
      reps.min = limits.reps?.min ?? 1;
      reps.max = limits.reps?.max ?? 100;
      reps.step = 1;
      reps.value = set.reps;
      reps.addEventListener('change', (event) => {
        const next = clampNumber(event.target.value, limits.reps?.min, limits.reps?.max);
        onChange(index, { weight: set.weight, reps: next });
      });

      row.append(weight);
      const weightLabel = document.createElement('span');
      weightLabel.className = 'muted';
      weightLabel.textContent = 'kg';
      row.append(weightLabel);

      row.append(reps);
      const repLabel = document.createElement('span');
      repLabel.className = 'muted';
      repLabel.textContent = '回';
      row.append(repLabel);
    }

    wrapper.append(row);
  });

  return wrapper;
};

const notifyCompletion = (message) => {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification('タイマー完了', { body: message });
  } else if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

export const renderRun = (params, { navigate, store, playSfx }) => {
  const quest = getQuestById(params.id);
  const settings = store.getSettings();
  const previousPlan = store.getLastPlan(params.id, settings.difficulty);
  let runPlan = createPlanFromDefinition(quest, settings.difficulty, previousPlan);

  const timerPrefs = store.getTimerPreferences();
  let timerConfig = {
    mode: timerPrefs.mode || runPlan.mode,
    workSeconds: runPlan.unit === 'time' ? runPlan.sets[0]?.timeSeconds || runPlan.trainingSeconds : timerPrefs.workSeconds,
    restSeconds: runPlan.restSeconds ?? timerPrefs.restSeconds,
    sets: runPlan.unit === 'time' ? runPlan.sets.length : timerPrefs.sets,
  };
  timerConfig.sets = Math.max(timerConfig.sets || 1, 1);
  timerConfig.mode = timerConfig.mode || 'interval';

  const buildEngineConfig = () => ({
    mode: timerConfig.mode,
    workSeconds: timerConfig.workSeconds,
    restSeconds: timerConfig.restSeconds,
    sets: timerConfig.mode === 'interval' ? timerConfig.sets : 1,
    workSets: timerConfig.mode === 'interval' ? runPlan.sets : [],
  });

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

  const engine = createTimerEngine(buildEngineConfig());

  const metaBox = document.createElement('p');
  metaBox.className = 'muted';
  metaBox.textContent = `${settings.difficulty} / 音: ${settings.sfxEnabled ? 'ON' : 'OFF'} / 音量: ${(settings.sfxVolume * 100).toFixed(0)}%`;

  const timerBox = document.createElement('div');
  timerBox.className = 'run-timer';

  const statusRow = document.createElement('div');
  statusRow.className = 'row run-timer__status';
  const phaseBadge = document.createElement('span');
  phaseBadge.className = 'pill pill--info';
  const setProgress = document.createElement('span');
  setProgress.className = 'muted';
  const nextInfo = document.createElement('span');
  nextInfo.className = 'muted';
  statusRow.append(phaseBadge, setProgress, nextInfo);

  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'run-timer__display';

  const subMeta = document.createElement('p');
  subMeta.className = 'muted run-timer__meta';
  const updateMeta = () => {
    const description =
      timerConfig.mode === 'interval'
        ? trainingConfig.descriptions.interval
        : timerConfig.mode === 'timer'
          ? trainingConfig.descriptions.timer
          : trainingConfig.descriptions.stopwatch;
    subMeta.textContent = `${description} / Work ${formatTime(timerConfig.workSeconds)}${
      timerConfig.mode === 'interval' ? ` / Rest ${formatTime(timerConfig.restSeconds)} / ${timerConfig.sets} セット` : ''
    }`;
  };
  updateMeta();

  const pointsBanner = document.createElement('p');
  pointsBanner.className = 'muted run-points';
  pointsBanner.textContent = `ポイント基準: 規定セット ${runPlan.baseSets}、上限 ${runPlan.maxSets}。チャレンジでポイント増。`;

  const timerControls = document.createElement('div');
  timerControls.className = 'run-timer__controls';

  const modeField = document.createElement('label');
  modeField.className = 'field';
  const modeLabel = document.createElement('span');
  modeLabel.textContent = 'タイマー種別';
  const modeSelect = document.createElement('select');
  [
    { value: 'interval', label: 'インターバル' },
    { value: 'timer', label: 'シンプルタイマー' },
    { value: 'stopwatch', label: 'ストップウォッチ' },
  ].forEach((option) => {
    const el = document.createElement('option');
    el.value = option.value;
    el.textContent = option.label;
    if (option.value === timerConfig.mode) el.selected = true;
    modeSelect.append(el);
  });
  modeSelect.addEventListener('change', (event) => {
    timerConfig.mode = event.target.value;
    store.rememberTimerConfig(timerConfig);
    engine.reset(buildEngineConfig());
    completionRecorded = false;
    toggleButton.textContent = '開始';
    updateMeta();
    updateDisplay(engine.getSnapshot());
  });
  modeField.append(modeLabel, modeSelect);

  const workField = document.createElement('label');
  workField.className = 'field';
  const workLabel = document.createElement('span');
  workLabel.textContent = 'トレーニング時間（秒）';
  const workInput = document.createElement('input');
  workInput.type = 'number';
  workInput.min = trainingConfig.limits.trainingSeconds.min;
  workInput.max = trainingConfig.limits.trainingSeconds.max;
  workInput.value = timerConfig.workSeconds;
  workInput.addEventListener('change', (event) => {
    const next = clampNumber(event.target.value, trainingConfig.limits.trainingSeconds.min, trainingConfig.limits.trainingSeconds.max);
    timerConfig.workSeconds = next;
    if (runPlan.unit === 'time') {
      runPlan.sets = runPlan.sets.map(() => ({ timeSeconds: next }));
      runPlan.trainingSeconds = next;
      refreshSetEditor();
    }
    store.rememberTimerConfig(timerConfig);
    engine.reset(buildEngineConfig());
    updateMeta();
    updateDisplay(engine.getSnapshot());
  });
  workField.append(workLabel, workInput);

  const restField = document.createElement('label');
  restField.className = 'field';
  const restLabel = document.createElement('span');
  restLabel.textContent = '休憩時間（秒）';
  const restInput = document.createElement('input');
  restInput.type = 'number';
  restInput.min = trainingConfig.limits.restSeconds.min;
  restInput.max = trainingConfig.limits.restSeconds.max;
  restInput.value = timerConfig.restSeconds;
  restInput.addEventListener('change', (event) => {
    const next = clampNumber(event.target.value, trainingConfig.limits.restSeconds.min, trainingConfig.limits.restSeconds.max);
    timerConfig.restSeconds = next;
    runPlan.restSeconds = next;
    store.rememberTimerConfig(timerConfig);
    engine.reset(buildEngineConfig());
    updateMeta();
    updateDisplay(engine.getSnapshot());
  });
  restField.append(restLabel, restInput);

  timerControls.append(modeField, workField, restField);

  const timerNotice = document.createElement('p');
  timerNotice.className = 'muted';

  timerBox.append(metaBox, statusRow, timeDisplay, subMeta, timerNotice, pointsBanner, timerControls);

  const planBox = document.createElement('div');
  planBox.className = 'stack run-plan__box';
  const planHeading = document.createElement('h3');
  planHeading.textContent = 'ポイントアップチャレンジ';

  const planLead = document.createElement('p');
  planLead.className = 'muted';
  planLead.textContent = `ベース: ${runPlan.baseSets} セット。上限 ${runPlan.maxSets} セットまで増量できます。`;

  const setSliderField = document.createElement('label');
  setSliderField.className = 'field';
  const setSliderLabel = document.createElement('span');
  setSliderLabel.textContent = 'セット数';
  const setSlider = document.createElement('input');
  setSlider.type = 'range';
  setSlider.min = 1;
  setSlider.max = runPlan.maxSets;
  setSlider.value = runPlan.sets.length;
  const setSliderValue = document.createElement('span');
  setSliderValue.className = 'pill';
  setSliderValue.textContent = `${runPlan.sets.length} セット`;

  const setEditorContainer = document.createElement('div');

  const refreshSetEditor = () => {
    setEditorContainer.innerHTML = '';
    setEditorContainer.append(
      buildSetInputs(runPlan.unit, runPlan.limits, runPlan.sets, (index, updated) => {
        runPlan.sets[index] = { ...runPlan.sets[index], ...updated };
        if (runPlan.unit === 'time') {
          timerConfig.workSeconds = runPlan.sets[0].timeSeconds;
          store.rememberTimerConfig({ ...timerConfig, sets: runPlan.sets.length });
          engine.reset(buildEngineConfig());
        }
        store.rememberPlan(runPlan.questId, runPlan.difficulty, runPlan);
        updateMeta();
      }),
    );
  };

  setSlider.addEventListener('input', (event) => {
    const count = Number(event.target.value);
    setSliderValue.textContent = `${count} セット`;
  });

  setSlider.addEventListener('change', (event) => {
    const count = Number(event.target.value);
    const baseSource = runPlan.baseDefinition;
    while (runPlan.sets.length < count && runPlan.sets.length < runPlan.maxSets) {
      const template = baseSource[runPlan.sets.length] || runPlan.sets[runPlan.sets.length - 1] || baseSource[0];
      runPlan.sets.push({ ...template });
    }
    if (runPlan.sets.length > count) {
      runPlan.sets = runPlan.sets.slice(0, count);
    }
    setSliderValue.textContent = `${runPlan.sets.length} セット`;
    timerConfig.sets = runPlan.sets.length;
    store.rememberTimerConfig(timerConfig);
    engine.reset(buildEngineConfig());
    completionRecorded = false;
    refreshSetEditor();
    store.rememberPlan(runPlan.questId, runPlan.difficulty, runPlan);
    updateMeta();
  });

  setSliderField.append(setSliderLabel, setSlider, setSliderValue);
  refreshSetEditor();

  const howto = document.createElement('p');
  howto.className = 'muted';
  howto.textContent = runPlan.description;

  planBox.append(planHeading, planLead, setSliderField, setEditorContainer, howto);

  const { sectionOne, sectionTwo } = ((questInfo) => {
    const sectionOneEl = document.createElement('div');
    sectionOneEl.className = 'run-howto__panel';
    const headingOne = document.createElement('h3');
    headingOne.textContent = '手順';
    const steps = document.createElement('ol');
    steps.className = 'steps';
    questInfo.steps.forEach((step) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${step.heading}</strong><p class="muted">${step.body}</p>`;
      steps.append(li);
    });
    sectionOneEl.append(headingOne, steps);

    const sectionTwoEl = document.createElement('div');
    sectionTwoEl.className = 'run-howto__panel';
    const headingTwo = document.createElement('h3');
    headingTwo.textContent = 'フォームのコツ';
    const tips = document.createElement('ul');
    tips.className = 'muted';
    questInfo.tips.forEach((tip) => {
      const li = document.createElement('li');
      li.textContent = tip;
      tips.append(li);
    });
    sectionTwoEl.append(headingTwo, tips);

    return { sectionOne: sectionOneEl, sectionTwo: sectionTwoEl };
  })(quest);

  let completionRecorded = false;
  let startTimestamp = null;

  const { controls, toggleButton, completeButton } = createControls(
    navigate,
    quest.id,
    playSfx,
    () => {
      engine.reset(buildEngineConfig());
      completionRecorded = false;
      toggleButton.textContent = '開始';
      completeButton.disabled = false;
      pointsBanner.textContent = 'ポイント: 設定を調整してポイントを伸ばしましょう。';
      timerNotice.textContent = '';
      startTimestamp = null;
      updateDisplay(engine.getSnapshot());
    },
    () => {
      const snapshot = engine.getSnapshot();
      if (snapshot.state === 'running') {
        engine.pause();
        playSfx('timer:stop');
        toggleButton.textContent = '再開';
        return;
      }
      startTimestamp = startTimestamp || Date.now();
      engine.start(buildEngineConfig());
      completionRecorded = false;
      toggleButton.textContent = '一時停止';
      playSfx('timer:start');
    },
    () => {
      const snapshot = engine.getSnapshot();
      engine.stop();
      recordCompletion({ ...snapshot, finished: true });
      playSfx('timer:complete');
    },
  );

  const recordCompletion = (snapshot) => {
    if (completionRecorded) return;
    const completedSets = computeCompletedSets(snapshot, runPlan.sets.length);
    const result = store.recordResult({
      questId: quest.id,
      difficulty: settings.difficulty,
      mode: snapshot.mode,
      trainingSeconds: timerConfig.workSeconds,
      restSeconds: timerConfig.restSeconds,
      sets: runPlan.sets,
      completedSets,
      elapsedSeconds: snapshot.elapsedSeconds,
      finished: snapshot.state === 'finished' || snapshot.finished,
      exerciseSlug: runPlan.exerciseSlug,
      startTime: startTimestamp,
      endTime: Date.now(),
      plan: runPlan,
    });
    completionRecorded = true;
    completeButton.disabled = true;
    store.rememberPlan(runPlan.questId, runPlan.difficulty, runPlan);
    store.rememberTimerConfig(timerConfig);
    pointsBanner.textContent = `獲得ポイント: ${result.points} pts`;
    timerNotice.textContent = '完了！計測結果を保存しました。';
    notifyCompletion('セットを完了しました。お疲れさまです！');
    alert(`完了！ ${result.points} ポイントを獲得しました。`);
  };

  const updateDisplay = (snapshot) => {
    if (snapshot.mode === 'stopwatch') {
      phaseBadge.textContent = snapshot.state === 'running' ? '計測中' : '停止中';
      setProgress.textContent = `${runPlan.sets.length} セット入力済み`;
      nextInfo.textContent = '次: 完了ボタンで終了';
      timeDisplay.textContent = formatTime(snapshot.elapsedSeconds);
      return;
    }

    if (snapshot.mode === 'timer') {
      phaseBadge.textContent = snapshot.state === 'running' ? 'カウント中' : '待機中';
      setProgress.textContent = '1 / 1 セット';
      nextInfo.textContent = '次: 完了通知';
      timeDisplay.textContent = formatTime(snapshot.remainingSeconds || timerConfig.workSeconds);
      return;
    }

    const phaseLabel = snapshot.phase === 'rest' ? '休憩中' : 'トレーニング中';
    phaseBadge.textContent = `${phaseLabel}`;
    setProgress.textContent = `${snapshot.currentSet} / ${snapshot.totalSets} セット`;
    nextInfo.textContent = `次: ${snapshot.next}`;
    timeDisplay.textContent = formatTime(snapshot.remainingSeconds);
  };

  engine.onTick((snapshot) => {
    updateDisplay(snapshot);
  });

  engine.onStateChange((snapshot) => {
    updateDisplay(snapshot);
    if (snapshot.state === 'finished') {
      recordCompletion(snapshot);
      toggleButton.textContent = '開始';
      playSfx('timer:complete');
    }
  });

  updateDisplay(engine.getSnapshot());

  window.addEventListener(
    'hashchange',
    () => {
      engine.stop();
    },
    { once: true },
  );

  container.append(timerBox, planBox, sectionOne, sectionTwo, controls);
  return container;
};
