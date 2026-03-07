import { getQuestById } from '../core/content.js';
import { normalizePostVisibility } from '../core/privacy/visibility.js';
import { createTimerEngine } from '../core/timerEngine.js';
import { buildWorkoutTimingSummary } from '../core/workoutTiming.js';
import { createPlanFromDefinition } from '../core/trainingPlan.js';
import { trainingConfig } from '../data/trainingConfig.js';

const DIFFICULTY_LABELS = { beginner: '初級', intermediate: '中級', advanced: '上級' };

const VISIBILITY_OPTIONS = [
  { value: 'public', label: '公開で投稿' },
  { value: 'private', label: 'フォロワーのみで投稿' },
  { value: 'archived', label: 'アーカイブ' },
];

const WORKOUT_TYPE_OPTIONS = [
  { value: 'time', label: 'time（時間）' },
  { value: 'reps', label: 'reps（回数）' },
  { value: 'weightReps', label: 'weightReps（重量×回数）' },
];

const TIME_MODE_OPTIONS = [
  { value: 'timer', label: 'タイマー' },
  { value: 'stopwatch', label: 'ストップウォッチ' },
  { value: 'intervalTimer', label: 'インターバルタイマー' },
  { value: 'intervalStopwatch', label: 'インターバルストップウォッチ' },
];

const DISPLAY_FIELDS = {
  timer: ['workSeconds'],
  stopwatch: [],
  intervalTimer: ['workSeconds', 'restSeconds', 'sets'],
  intervalStopwatch: ['restSeconds', 'sets'],
  setRest: ['restSeconds', 'sets'],
};

const TIME_MODE_DESCRIPTIONS = {
  timer: trainingConfig.descriptions.timeTimer,
  stopwatch: trainingConfig.descriptions.timeStopwatch,
  intervalTimer: trainingConfig.descriptions.timeIntervalTimer,
  intervalStopwatch: trainingConfig.descriptions.timeIntervalStopwatch,
};

const formatTime = (seconds) => {
  const safeSeconds = Math.max(seconds, 0);
  const mins = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(safeSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const clampNumber = (value, min, max) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  if (min == null && max == null) return numeric;
  if (min == null) return Math.min(max, numeric);
  if (max == null) return Math.max(min, numeric);
  return Math.max(min, Math.min(max, numeric));
};

const computeCompletedSets = (snapshot, setsLength) => {
  if (snapshot.mode === 'interval' || snapshot.timeMode === 'intervalTimer') {
    return snapshot.state === 'finished' ? snapshot.totalSets : Math.max(snapshot.currentSet - (snapshot.phase === 'work' ? 1 : 0), 0);
  }
  if (snapshot.mode === 'setRest' || snapshot.timeMode === 'intervalStopwatch') {
    if (snapshot.state === 'finished') return snapshot.totalSets;
    if (snapshot.workflowState === 'in_set') return Math.max(snapshot.currentSet - 1, 0);
    return Math.min(snapshot.currentSet, snapshot.totalSets);
  }
  return Math.max(setsLength || 1, 1);
};

const isSetRestLike = (snapshot) => snapshot.mode === 'setRest' || snapshot.timeMode === 'intervalStopwatch';

const resolvePausedAdvanceLabel = (snapshot) => {
  if (snapshot.mode === 'time' && snapshot.timeMode === 'intervalTimer') {
    return snapshot.phase === 'rest' ? 'この休憩を終了' : 'このセットを終了';
  }
  if (isSetRestLike(snapshot)) {
    if (snapshot.workflowState === 'resting' || snapshot.workflowState === 'rest_ready') return 'この休憩を終了';
    if (snapshot.workflowState === 'in_set') return 'このセットを終了';
  }
  if (snapshot.mode === 'time' && snapshot.timeMode === 'timer') return 'このタイマーを終了';
  return '次へ進む';
};

const shouldShowPausedAdvance = (snapshot) => {
  if (snapshot.state !== 'paused') return false;
  if (snapshot.mode === 'time' && snapshot.timeMode === 'stopwatch') return false;
  if (snapshot.mode === 'time' && snapshot.timeMode === 'timer') return true;
  if (snapshot.mode === 'time' && snapshot.timeMode === 'intervalTimer') return true;
  if (isSetRestLike(snapshot)) return ['in_set', 'resting', 'rest_ready'].includes(snapshot.workflowState);
  return false;
};


const notifyCompletion = (message) => {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification('タイマー完了', { body: message });
  } else if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

const buildSetInputs = (inputMode, limits, planSets, onChange) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'stack set-editor';

  planSets.forEach((set, index) => {
    const row = document.createElement('div');
    row.className = 'row set-editor__row';

    const label = document.createElement('span');
    label.className = 'muted';
    label.textContent = `セット ${index + 1}`;
    row.append(label);

    if (inputMode === 'weightReps') {
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
      row.append(Object.assign(document.createElement('span'), { className: 'muted', textContent: 'kg' }));
      row.append(reps);
      row.append(Object.assign(document.createElement('span'), { className: 'muted', textContent: '回' }));
    } else if (inputMode === 'reps') {
      const reps = document.createElement('input');
      reps.type = 'number';
      reps.min = limits.reps?.min ?? 1;
      reps.max = limits.reps?.max ?? 100;
      reps.step = 1;
      reps.value = set.reps;
      reps.addEventListener('change', (event) => {
        const next = clampNumber(event.target.value, limits.reps?.min, limits.reps?.max);
        onChange(index, { reps: next });
      });
      row.append(reps);
      row.append(Object.assign(document.createElement('span'), { className: 'muted', textContent: '回' }));
    }

    wrapper.append(row);
  });

  return wrapper;
};

const createDefaultSets = (workoutType, count) => {
  const safeCount = Math.max(1, count);
  if (workoutType === 'reps') return Array.from({ length: safeCount }, () => ({ reps: 10 }));
  if (workoutType === 'weightReps') return Array.from({ length: safeCount }, () => ({ weight: 20, reps: 10 }));
  return [];
};

export const renderRun = (params, { navigate, store, playSfx }) => {
  const quest = getQuestById(params.id);
  const settings = store.getSettings();
  const previousPlan = store.getLastPlan(params.id, settings.difficulty);
  let runPlan = createPlanFromDefinition(quest, settings.difficulty, previousPlan);

  if (!quest) {
    const container = document.createElement('section');
    container.className = 'run-shell';
    const missing = document.createElement('p');
    missing.textContent = 'ワークアウトが見つかりませんでした。ホームに戻ります。';
    container.append(missing);
    return container;
  }

  const timerPrefs = store.getTimerPreferences();
  const initialWorkoutType = runPlan.inputMode;
  let timerConfig = {
    workoutType: initialWorkoutType,
    mode: initialWorkoutType === 'time' ? 'time' : 'setRest',
    timeMode: runPlan.defaultTimeMode || timerPrefs.timeMode || 'stopwatch',
    workSeconds: timerPrefs.workSeconds || runPlan.trainingSeconds || trainingConfig.defaults.timerTrainingSeconds,
    restSeconds: runPlan.restSeconds ?? timerPrefs.restSeconds,
    sets: runPlan.sets.length || timerPrefs.sets || trainingConfig.defaults.timerSets,
  };

  const hasDistanceMetric = Array.isArray(runPlan.trackingMetrics) && runPlan.trackingMetrics.includes('distance');
  const distanceGoalConfig = runPlan.goalConfig?.type === 'distance' ? runPlan.goalConfig : { type: 'distance', min: 100, max: 100000, step: 100, unitLabel: 'm' };
  let distanceMeters = hasDistanceMetric
    ? (runPlan.metricGoals?.distanceMeters ?? distanceGoalConfig.defaultValue ?? distanceGoalConfig.min)
    : null;

  const buildEngineConfig = () => ({
    mode: timerConfig.workoutType === 'time' ? 'time' : 'setRest',
    timeMode: timerConfig.workoutType === 'time' ? timerConfig.timeMode : 'stopwatch',
    workSeconds: timerConfig.workSeconds,
    restSeconds: timerConfig.restSeconds,
    sets: ['intervalTimer', 'intervalStopwatch'].includes(timerConfig.timeMode) || timerConfig.workoutType !== 'time' ? timerConfig.sets : 1,
    workSets: [],
  });

  const engine = createTimerEngine(buildEngineConfig());

  const container = document.createElement('section');
  container.className = 'run-shell';

  const timerBox = document.createElement('div');
  timerBox.className = 'run-timer';

  const metaBox = document.createElement('p');
  metaBox.className = 'muted';
  metaBox.textContent = `${DIFFICULTY_LABELS[settings.difficulty] || '初級'} / 音: ${settings.sfxEnabled ? 'オン' : 'オフ'} / 音量: ${(settings.sfxVolume * 100).toFixed(0)}%`;

  const statusRow = document.createElement('div');
  statusRow.className = 'row run-timer__status';
  const phaseBadge = Object.assign(document.createElement('span'), { className: 'pill pill--info' });
  const setProgress = Object.assign(document.createElement('span'), { className: 'muted' });
  const nextInfo = Object.assign(document.createElement('span'), { className: 'muted' });
  statusRow.append(phaseBadge, setProgress, nextInfo);

  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'run-timer__display';

  const subMeta = Object.assign(document.createElement('p'), { className: 'muted run-timer__meta' });
  const timerNotice = Object.assign(document.createElement('p'), { className: 'muted' });
  const pointsBanner = Object.assign(document.createElement('p'), { className: 'muted run-points' });

  const controls = document.createElement('div');
  controls.className = 'run-controls';
  const stopButton = Object.assign(document.createElement('button'), { type: 'button', className: 'ghost', textContent: 'ワークアウト詳細へ' });
  const resetButton = Object.assign(document.createElement('button'), { type: 'button', className: 'ghost', textContent: 'リセット' });
  const toggleButton = Object.assign(document.createElement('button'), { type: 'button', textContent: '開始' });
  const advanceButton = Object.assign(document.createElement('button'), { type: 'button', className: 'ghost', textContent: '次へ進む' });

  const postSplit = document.createElement('div');
  postSplit.className = 'split-button';
  const submitButton = Object.assign(document.createElement('button'), { type: 'button', textContent: '投稿' });
  submitButton.className = 'split-button__main';
  const menuToggle = Object.assign(document.createElement('button'), { type: 'button', className: 'split-button__toggle ghost', textContent: '▾' });
  menuToggle.setAttribute('aria-label', '投稿公開範囲を選択');
  menuToggle.setAttribute('aria-haspopup', 'menu');
  const menu = document.createElement('div');
  menu.className = 'split-button__menu';
  menu.setAttribute('role', 'menu');

  const timerControls = document.createElement('div');
  timerControls.className = 'run-timer__controls';

  const workoutTypeField = Object.assign(document.createElement('label'), { className: 'field run-field' });
  workoutTypeField.append(Object.assign(document.createElement('span'), { textContent: '種別' }));
  const workoutTypeSelect = document.createElement('select');
  WORKOUT_TYPE_OPTIONS.forEach((option) => {
    const el = document.createElement('option');
    el.value = option.value;
    el.textContent = option.label;
    el.selected = option.value === timerConfig.workoutType;
    workoutTypeSelect.append(el);
  });
  workoutTypeField.append(workoutTypeSelect);

  const modeField = Object.assign(document.createElement('label'), { className: 'field run-field' });
  modeField.append(Object.assign(document.createElement('span'), { textContent: 'モード' }));
  const modeSelect = document.createElement('select');
  modeField.append(modeSelect);

  const workField = Object.assign(document.createElement('label'), { className: 'field run-field' });
  workField.append(Object.assign(document.createElement('span'), { textContent: 'ワーク時間（秒）' }));
  const workInput = document.createElement('input');
  workInput.type = 'number';
  workInput.min = trainingConfig.limits.trainingSeconds.min;
  workInput.max = trainingConfig.limits.trainingSeconds.max;
  workInput.value = timerConfig.workSeconds;
  workField.append(workInput);

  const restField = Object.assign(document.createElement('label'), { className: 'field run-field' });
  restField.append(Object.assign(document.createElement('span'), { textContent: '休憩時間（秒）' }));
  const restInput = document.createElement('input');
  restInput.type = 'number';
  restInput.min = trainingConfig.limits.restSeconds.min;
  restInput.max = trainingConfig.limits.restSeconds.max;
  restInput.value = timerConfig.restSeconds;
  restField.append(restInput);

  const setsField = Object.assign(document.createElement('label'), { className: 'field run-field' });
  setsField.append(Object.assign(document.createElement('span'), { textContent: 'セット数' }));
  const setsInput = document.createElement('input');
  setsInput.type = 'number';
  setsInput.min = trainingConfig.limits.sets.min;
  setsInput.max = trainingConfig.limits.sets.max;
  setsInput.value = timerConfig.sets;
  setsField.append(setsInput);

  const distanceField = Object.assign(document.createElement('label'), { className: 'field run-field' });
  distanceField.append(Object.assign(document.createElement('span'), { textContent: '距離（m）' }));
  const distanceInput = document.createElement('input');
  distanceInput.type = 'number';
  distanceInput.min = distanceGoalConfig.min;
  distanceInput.max = distanceGoalConfig.max;
  distanceInput.step = distanceGoalConfig.step;
  distanceInput.value = distanceMeters ?? '';
  distanceField.append(distanceInput);

  const noteField = Object.assign(document.createElement('label'), { className: 'field run-field' });
  noteField.append(Object.assign(document.createElement('span'), { textContent: 'メモ' }));
  const noteInput = document.createElement('input');
  noteInput.type = 'text';
  noteInput.placeholder = '任意メモ';
  noteField.append(noteInput);

  let postNote = '';
  let completionRecorded = false;
  let startTimestamp = null;
  let perSetActualSeconds = [];
  let currentSetStartElapsed = 0;

  const initialVisibility = normalizePostVisibility(store.getProfile?.()?.default_visibility || store.getProfile?.()?.account_visibility || 'private');
  let selectedVisibility = initialVisibility;
  let visibilityMenuOpen = false;

  const renderVisibilityMenu = () => {
    menu.innerHTML = '';
    VISIBILITY_OPTIONS.forEach((option) => {
      const btn = Object.assign(document.createElement('button'), { type: 'button', textContent: option.label });
      btn.className = option.value === selectedVisibility ? 'is-selected' : '';
      btn.setAttribute('role', 'menuitemradio');
      btn.setAttribute('aria-checked', option.value === selectedVisibility ? 'true' : 'false');
      btn.addEventListener('click', () => {
        selectedVisibility = option.value;
        submitButton.textContent = `投稿（${option.label}）`;
        visibilityMenuOpen = false;
        menu.classList.remove('is-open');
        renderVisibilityMenu();
      });
      menu.append(btn);
    });
  };

  const currentModeValue = () => (timerConfig.workoutType === 'time' ? timerConfig.timeMode : 'setRest');

  const renderModeOptions = () => {
    modeSelect.innerHTML = '';
    if (timerConfig.workoutType === 'time') {
      TIME_MODE_OPTIONS.forEach((option) => {
        const el = document.createElement('option');
        el.value = option.value;
        el.textContent = option.label;
        el.selected = option.value === timerConfig.timeMode;
        modeSelect.append(el);
      });
      modeSelect.disabled = false;
      return;
    }
    const el = document.createElement('option');
    el.value = 'setRest';
    el.textContent = 'セット + 休憩タイマー';
    el.selected = true;
    modeSelect.append(el);
    modeSelect.disabled = true;
  };


  const captureSetPartialIfNeeded = (snapshot) => {
    if (timerConfig.workoutType === 'time' && timerConfig.timeMode === 'intervalStopwatch' && snapshot.workflowState === 'in_set') {
      const current = Math.max(snapshot.elapsedSeconds - currentSetStartElapsed, 0);
      if (current > 0) perSetActualSeconds.push(current);
      currentSetStartElapsed = snapshot.elapsedSeconds;
    }
  };

  const captureRunningPartialForPost = (snapshot) => {
    if (timerConfig.workoutType === 'time' && timerConfig.timeMode === 'intervalStopwatch' && snapshot.workflowState === 'in_set') {
      const current = Math.max(snapshot.elapsedSeconds - currentSetStartElapsed, 0);
      const seeded = [...perSetActualSeconds];
      if (current > 0) seeded.push(current);
      return seeded;
    }
    return [...perSetActualSeconds];
  };

  const postWorkout = (snapshot) => {
    if (completionRecorded) return;
    const completedSets = computeCompletedSets(snapshot, runPlan.sets.length);
    const perSetActiveSeconds = captureRunningPartialForPost(snapshot).map((seconds) => Math.round(seconds));
    const configuredActiveSeconds = timerConfig.workoutType === 'time'
      ? (timerConfig.timeMode === 'intervalTimer' ? timerConfig.workSeconds * Math.max(timerConfig.sets || 1, 1) : timerConfig.workSeconds)
      : 0;
    const timingSummary = buildWorkoutTimingSummary({
      actualActiveSeconds: snapshot.activeElapsedSeconds,
      actualRestSeconds: snapshot.restElapsedSeconds,
      configuredActiveSeconds,
      perSetActiveSeconds,
    });
    const result = store.recordResult({
      questId: quest.id,
      difficulty: settings.difficulty,
      mode: snapshot.mode,
      workoutType: timerConfig.workoutType,
      timeMode: snapshot.timeMode || timerConfig.timeMode,
      timerProfile: {
        workoutType: timerConfig.workoutType,
        timeMode: timerConfig.timeMode,
        workSeconds: timerConfig.workSeconds,
        restSeconds: timerConfig.restSeconds,
        sets: timerConfig.sets,
      },
      trainingSeconds: timerConfig.workSeconds,
      restSeconds: timerConfig.restSeconds,
      sets: runPlan.sets,
      configuredSets: timerConfig.sets,
      completedSets,
      elapsedSeconds: snapshot.elapsedSeconds,
      actualActiveSeconds: timingSummary.actualActiveSeconds,
      actualRestSeconds: timingSummary.actualRestSeconds,
      configuredActiveSeconds: timingSummary.configuredActiveSeconds,
      perSetActiveSeconds: timingSummary.perSetActiveSeconds,
      isPartial: timingSummary.isPartial,
      intervalSetElapsedSeconds: timingSummary.perSetActiveSeconds,
      finished: snapshot.state === 'finished',
      exerciseSlug: runPlan.exerciseSlug,
      startTime: startTimestamp,
      endTime: Date.now(),
      plan: runPlan,
      visibilityOverride: selectedVisibility,
      published_at: selectedVisibility === 'archived' ? null : new Date().toISOString(),
      note: postNote,
      distanceMeters: hasDistanceMetric ? distanceMeters : null,
    });
    completionRecorded = true;
    submitButton.disabled = true;
    pointsBanner.textContent = `獲得消費カロリー: ${result.calories} kcal`;
    timerNotice.textContent = '完了！計測結果を保存しました。';
    store.rememberPlan(runPlan.questId, runPlan.difficulty, runPlan);
    store.rememberTimerConfig(timerConfig);
    notifyCompletion('セットを完了しました。お疲れさまです！');
  };

  const updateMeta = () => {
    const description = timerConfig.workoutType === 'time'
      ? (TIME_MODE_DESCRIPTIONS[timerConfig.timeMode] || trainingConfig.descriptions.timeStopwatch)
      : trainingConfig.descriptions.setRest;
    subMeta.textContent = description;
    pointsBanner.textContent = `消費カロリー基準: 規定セット ${runPlan.baseSets}、上限 ${runPlan.maxSets}。`;
  };

  const updateDisplay = (snapshot) => {
    advanceButton.style.display = shouldShowPausedAdvance(snapshot) ? '' : 'none';
    advanceButton.textContent = resolvePausedAdvanceLabel(snapshot);
    if (snapshot.mode === 'time') {
      if (snapshot.timeMode === 'stopwatch') {
        phaseBadge.textContent = snapshot.state === 'running' ? '計測中' : '停止中';
        setProgress.textContent = 'ストップウォッチ';
        nextInfo.textContent = '次: 投稿';
        timeDisplay.textContent = formatTime(snapshot.elapsedSeconds);
        toggleButton.textContent = snapshot.state === 'running' ? '一時停止' : (snapshot.state === 'paused' ? '再開' : '開始');
        return;
      }
      if (snapshot.timeMode === 'timer') {
        phaseBadge.textContent = snapshot.state === 'running' ? 'カウント中' : '待機中';
        setProgress.textContent = 'タイマー';
        nextInfo.textContent = '次: 完了';
        timeDisplay.textContent = formatTime(snapshot.remainingSeconds || timerConfig.workSeconds);
        toggleButton.textContent = snapshot.state === 'running' ? '一時停止' : (snapshot.state === 'paused' ? '再開' : '開始');
        return;
      }
      if (snapshot.timeMode === 'intervalTimer') {
        phaseBadge.textContent = snapshot.phase === 'rest' ? '休憩中' : 'ワーク中';
        setProgress.textContent = `${snapshot.currentSet} / ${snapshot.totalSets} セット`;
        nextInfo.textContent = `次: ${snapshot.next}`;
        timeDisplay.textContent = formatTime(snapshot.remainingSeconds);
        toggleButton.textContent = snapshot.state === 'running' ? '一時停止' : (snapshot.state === 'paused' ? '再開' : '開始');
        return;
      }
      if (snapshot.timeMode === 'intervalStopwatch') {
        if (snapshot.workflowState === 'in_set') {
          phaseBadge.textContent = 'セット計測中';
          toggleButton.textContent = snapshot.state === 'running' ? '一時停止' : '再開';
        } else if (snapshot.workflowState === 'rest_ready') {
          phaseBadge.textContent = '休憩待機';
          toggleButton.textContent = '休憩開始';
        } else if (snapshot.workflowState === 'resting') {
          phaseBadge.textContent = '休憩中';
          toggleButton.textContent = snapshot.state === 'running' ? '一時停止' : '休憩再開';
        } else if (snapshot.workflowState === 'completed') {
          phaseBadge.textContent = '完了';
          toggleButton.textContent = '開始';
        } else {
          phaseBadge.textContent = '待機中';
          toggleButton.textContent = 'セット開始';
        }
        setProgress.textContent = `${Math.min(snapshot.currentSet, snapshot.totalSets)} / ${snapshot.totalSets} セット`;
        nextInfo.textContent = `次: ${snapshot.next}`;
        timeDisplay.textContent = snapshot.workflowState === 'resting' ? formatTime(snapshot.remainingSeconds) : formatTime(snapshot.elapsedSeconds);
        return;
      }
    }

    if (snapshot.workflowState === 'in_set') {
      phaseBadge.textContent = 'セット中';
      toggleButton.textContent = 'セット完了';
    } else if (snapshot.workflowState === 'rest_ready') {
      phaseBadge.textContent = '休憩待機';
      toggleButton.textContent = '休憩開始';
    } else if (snapshot.workflowState === 'resting') {
      phaseBadge.textContent = '休憩中';
      toggleButton.textContent = snapshot.state === 'running' ? '一時停止' : '休憩再開';
    } else if (snapshot.workflowState === 'completed') {
      phaseBadge.textContent = '完了';
      toggleButton.textContent = '開始';
    } else {
      phaseBadge.textContent = '待機中';
      toggleButton.textContent = 'セット開始';
    }
    setProgress.textContent = `${Math.min(snapshot.currentSet, snapshot.totalSets)} / ${snapshot.totalSets} セット`;
    nextInfo.textContent = `次: ${snapshot.next}`;
    timeDisplay.textContent = snapshot.workflowState === 'resting' ? formatTime(snapshot.remainingSeconds) : formatTime(snapshot.elapsedSeconds);
  };

  const syncVisibility = () => {
    const visibleFields = DISPLAY_FIELDS[currentModeValue()] || [];
    workField.style.display = visibleFields.includes('workSeconds') ? '' : 'none';
    restField.style.display = visibleFields.includes('restSeconds') ? '' : 'none';
    setsField.style.display = visibleFields.includes('sets') ? '' : 'none';
  };

  const resetEngine = () => {
    engine.reset(buildEngineConfig());
    completionRecorded = false;
    submitButton.disabled = false;
    timerNotice.textContent = '';
    startTimestamp = null;
    perSetActualSeconds = [];
    currentSetStartElapsed = 0;
    updateMeta();
    syncVisibility();
    updateDisplay(engine.getSnapshot());
  };

  const refreshSetEditor = () => {
    setEditorContainer.innerHTML = '';
    if (runPlan.inputMode === 'time') return;
    const editor = buildSetInputs(runPlan.inputMode, runPlan.limits || {}, runPlan.sets, (index, setValue) => {
      runPlan.sets[index] = setValue;
      store.rememberPlan(runPlan.questId, runPlan.difficulty, runPlan);
      resetEngine();
    });
    setEditorContainer.append(editor);
  };

  workoutTypeSelect.addEventListener('change', (event) => {
    timerConfig.workoutType = event.target.value;
    if (timerConfig.workoutType === 'time') {
      timerConfig.mode = 'time';
      timerConfig.timeMode = TIME_MODE_OPTIONS.some((option) => option.value === timerConfig.timeMode) ? timerConfig.timeMode : 'stopwatch';
      runPlan.inputMode = 'time';
      runPlan.sets = [];
    } else {
      timerConfig.mode = 'setRest';
      runPlan.inputMode = timerConfig.workoutType;
      runPlan.sets = createDefaultSets(timerConfig.workoutType, timerConfig.sets);
    }
    renderModeOptions();
    refreshSetEditor();
    resetEngine();
  });

  modeSelect.addEventListener('change', (event) => {
    if (timerConfig.workoutType === 'time') {
      timerConfig.timeMode = event.target.value;
    }
    resetEngine();
  });

  workInput.addEventListener('change', (event) => {
    timerConfig.workSeconds = clampNumber(event.target.value, trainingConfig.limits.trainingSeconds.min, trainingConfig.limits.trainingSeconds.max);
    resetEngine();
  });

  restInput.addEventListener('change', (event) => {
    timerConfig.restSeconds = clampNumber(event.target.value, trainingConfig.limits.restSeconds.min, trainingConfig.limits.restSeconds.max);
    runPlan.restSeconds = timerConfig.restSeconds;
    resetEngine();
  });

  setsInput.addEventListener('change', (event) => {
    timerConfig.sets = clampNumber(event.target.value, trainingConfig.limits.sets.min, trainingConfig.limits.sets.max);
    if (runPlan.inputMode !== 'time') {
      const current = runPlan.sets;
      runPlan.sets = Array.from({ length: timerConfig.sets }, (_, index) => current[index] || createDefaultSets(runPlan.inputMode, 1)[0]);
      refreshSetEditor();
    }
    resetEngine();
  });

  distanceInput.addEventListener('change', (event) => {
    if (!hasDistanceMetric) return;
    distanceMeters = clampNumber(event.target.value, distanceGoalConfig.min, distanceGoalConfig.max);
    runPlan.metricGoals = { ...(runPlan.metricGoals || {}), distanceMeters };
  });

  noteInput.addEventListener('input', (event) => {
    postNote = event.target.value;
  });

  stopButton.addEventListener('click', () => {
    if (window.confirm('中断してワークアウト詳細に戻りますか？')) {
      playSfx('timer:stop');
      navigate(`#/workout/${quest.id}`);
    }
  });

  resetButton.addEventListener('click', () => {
    resetEngine();
    playSfx('timer:stop');
  });

  toggleButton.addEventListener('click', () => {
    const snapshot = engine.getSnapshot();
    const setRestLike = isSetRestLike(snapshot);
    if (setRestLike) {
      const intervalStopwatchSet = timerConfig.workoutType === 'time' && timerConfig.timeMode === 'intervalStopwatch' && snapshot.workflowState === 'in_set';
      if (snapshot.workflowState === 'idle') currentSetStartElapsed = snapshot.elapsedSeconds;
      if (intervalStopwatchSet && snapshot.state === 'running') {
        engine.pause();
        return;
      }
      if (intervalStopwatchSet && snapshot.state === 'paused') {
        engine.resume();
        return;
      }
      if (snapshot.workflowState === 'in_set') captureSetPartialIfNeeded(snapshot);
      if (snapshot.workflowState === 'idle' || snapshot.workflowState === 'in_set' || snapshot.workflowState === 'rest_ready') {
        if (!startTimestamp) startTimestamp = Date.now();
        engine.advanceSetRest();
        return;
      }
      if (snapshot.workflowState === 'resting' && snapshot.state === 'running') {
        engine.pause();
        return;
      }
      if (snapshot.workflowState === 'resting' && snapshot.state === 'paused') {
        engine.resume();
        return;
      }
      if (snapshot.state === 'finished') engine.reset(buildEngineConfig());
      return;
    }

    if (snapshot.state === 'running') {
      engine.pause();
      return;
    }
    if (snapshot.state === 'paused') {
      engine.resume();
      return;
    }
    startTimestamp = startTimestamp || Date.now();
    engine.start(buildEngineConfig());
  });

  advanceButton.addEventListener('click', () => {
    const snapshot = engine.getSnapshot();
    if (!shouldShowPausedAdvance(snapshot)) return;
    if (isSetRestLike(snapshot) && snapshot.workflowState === 'in_set') captureSetPartialIfNeeded(snapshot);
    engine.advanceFromPausedPhase();
  });

  submitButton.addEventListener('click', () => {
    const snapshot = engine.getSnapshot();
    engine.stop();
    postWorkout({ ...snapshot, state: 'finished' });
  });

  menuToggle.addEventListener('click', () => {
    visibilityMenuOpen = !visibilityMenuOpen;
    menu.classList.toggle('is-open', visibilityMenuOpen);
    menuToggle.setAttribute('aria-expanded', visibilityMenuOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (event) => {
    if (!postSplit.contains(event.target)) {
      visibilityMenuOpen = false;
      menu.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  renderVisibilityMenu();
  submitButton.textContent = `投稿（${VISIBILITY_OPTIONS.find((entry) => entry.value === selectedVisibility)?.label || '公開'}）`;

  postSplit.append(submitButton, menuToggle, menu);
  controls.append(stopButton, resetButton, toggleButton, advanceButton, postSplit);

  const planBox = document.createElement('div');
  planBox.className = 'stack run-plan__box';
  const planHeading = document.createElement('h3');
  planHeading.textContent = 'ワークアウト設定';
  const planLead = Object.assign(document.createElement('p'), { className: 'muted', textContent: `${timerConfig.sets || 1} セット / 休憩 ${timerConfig.restSeconds} 秒` });
  const setEditorContainer = document.createElement('div');

  refreshSetEditor();

  const howto = Object.assign(document.createElement('p'), { className: 'muted', textContent: runPlan.description });
  planBox.append(planHeading, planLead, setEditorContainer, howto);

  renderModeOptions();
  timerControls.append(workoutTypeField, modeField, workField, restField, setsField);
  if (hasDistanceMetric) timerControls.append(distanceField);
  timerControls.append(noteField);

  timerBox.append(metaBox, statusRow, timeDisplay, subMeta, timerNotice, pointsBanner, controls, timerControls);

  engine.onTick((snapshot) => {
    planLead.textContent = `${timerConfig.sets || 1} セット / 休憩 ${timerConfig.restSeconds} 秒`;
    syncVisibility();
    updateDisplay(snapshot);
  });

  engine.onStateChange((snapshot) => {
    updateDisplay(snapshot);
    if (snapshot.state === 'finished') {
      timerNotice.textContent = '完了！投稿ボタンで保存してください。';
      playSfx('timer:complete');
    }
  });

  resetEngine();

  window.addEventListener('hashchange', () => engine.stop(), { once: true });
  container.append(timerBox, planBox);
  return container;
};
