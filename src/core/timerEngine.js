const defaultConfig = {
  mode: 'setRest', // setRest | interval | time
  timeMode: 'stopwatch', // timer | stopwatch | intervalTimer | intervalStopwatch (mode==='time' only)
  workSeconds: 60,
  restSeconds: 30,
  sets: 1,
  workSets: [],
};

export const createTimerEngine = (initialConfig = {}) => {
  let config = { ...defaultConfig, ...initialConfig };
  let state = 'idle';
  let phase = 'work';
  let currentSet = 1;
  let remainingSeconds = config.workSeconds;
  let elapsedSeconds = 0;
  let workflowState = 'idle';
  let timerId = null;
  let lastTimestamp = null;
  let activeElapsedSeconds = 0;
  let restElapsedSeconds = 0;

  const tickSubscribers = new Set();
  const stateSubscribers = new Set();

  const clearTimer = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const getWorkDuration = (setIndex) => {
    if (Array.isArray(config.workSets) && config.workSets[setIndex - 1]) {
      const value = config.workSets[setIndex - 1];
      if (typeof value === 'number') return value;
      if (typeof value?.timeSeconds === 'number') return value.timeSeconds;
    }
    return config.workSeconds;
  };

  const isTimeMode = () => config.mode === 'time';
  const isTimeStopwatch = () => isTimeMode() && config.timeMode === 'stopwatch';
  const isTimeTimer = () => isTimeMode() && config.timeMode === 'timer';
  const isTimeIntervalTimer = () => isTimeMode() && config.timeMode === 'intervalTimer';
  const isTimeIntervalStopwatch = () => isTimeMode() && config.timeMode === 'intervalStopwatch';
  const usesIntervalWorkflow = () => config.mode === 'interval' || isTimeIntervalTimer();
  const usesSetRestWorkflow = () => config.mode === 'setRest' || isTimeIntervalStopwatch();
  const totalSets = () => (usesIntervalWorkflow() || usesSetRestWorkflow() ? config.sets : 1);

  const nextPhase = () => {
    if (isTimeMode()) {
      if (isTimeStopwatch()) return '計測中';
      if (isTimeTimer()) return '完了';
      if (isTimeIntervalTimer()) {
        if (phase === 'work') return currentSet >= config.sets ? '完了' : '休憩';
        return currentSet >= config.sets ? '完了' : 'ワーク';
      }
      if (usesSetRestWorkflow()) {
        if (workflowState === 'completed' || state === 'finished') return '完了';
        if (workflowState === 'in_set') return 'セット完了';
        if (workflowState === 'rest_ready') return '休憩開始';
        if (workflowState === 'resting') return '次セット';
        return 'セット開始';
      }
    }

    if (config.mode === 'setRest') {
      if (workflowState === 'completed' || state === 'finished') return '完了';
      if (workflowState === 'in_set') return 'セット完了';
      if (workflowState === 'rest_ready') return '休憩開始';
      if (workflowState === 'resting') return '次セット';
      return 'セット開始';
    }

    if (phase === 'work') {
      if (currentSet >= config.sets) return '完了';
      return '休憩';
    }
    if (phase === 'rest') {
      if (currentSet >= config.sets) return '完了';
      return '保持';
    }
    return '完了';
  };

  const getSnapshot = () => ({
    mode: config.mode,
    timeMode: config.timeMode,
    state,
    phase,
    workflowState,
    currentSet,
    totalSets: totalSets(),
    remainingSeconds: isTimeStopwatch() ? 0 : Math.max(remainingSeconds, 0),
    elapsedSeconds,
    activeElapsedSeconds,
    restElapsedSeconds,
    next: nextPhase(),
  });

  const notifyTick = () => {
    const snapshot = getSnapshot();
    tickSubscribers.forEach((callback) => callback(snapshot));
  };

  const notifyState = () => {
    const snapshot = getSnapshot();
    stateSubscribers.forEach((callback) => callback(snapshot));
  };

  const finish = () => {
    clearTimer();
    state = 'finished';
    workflowState = 'completed';
    notifyState();
    notifyTick();
  };

  const scheduleTick = () => {
    if (state !== 'running') return;

    const now = Date.now();
    const diffMs = now - lastTimestamp;
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds > 0) {
      lastTimestamp += diffSeconds * 1000;
      elapsedSeconds += diffSeconds;

      if (isTimeStopwatch() || (usesSetRestWorkflow() && workflowState === 'in_set')) {
        activeElapsedSeconds += diffSeconds;
        notifyTick();
      } else if (isTimeTimer() || (usesSetRestWorkflow() && workflowState === 'resting')) {
        if (isTimeTimer()) activeElapsedSeconds += diffSeconds;
        if (usesSetRestWorkflow() && workflowState === 'resting') restElapsedSeconds += diffSeconds;
        remainingSeconds -= diffSeconds;
        if (remainingSeconds <= 0) {
          if (usesSetRestWorkflow()) {
            currentSet += 1;
            if (currentSet > config.sets) {
              finish();
              return;
            }
            state = 'paused';
            phase = 'work';
            workflowState = 'idle';
            remainingSeconds = getWorkDuration(currentSet);
            notifyState();
            notifyTick();
            return;
          }
          finish();
          return;
        }
        notifyTick();
      } else if (usesIntervalWorkflow()) {
        if (phase === 'work') activeElapsedSeconds += diffSeconds;
        if (phase === 'rest') restElapsedSeconds += diffSeconds;
        remainingSeconds -= diffSeconds;
        while (remainingSeconds <= 0) {
          const overflow = Math.abs(remainingSeconds);

          if (phase === 'work') {
            if (currentSet >= config.sets) {
              finish();
              return;
            }
            if (config.restSeconds > 0) {
              phase = 'rest';
              remainingSeconds = config.restSeconds - overflow;
            } else {
              currentSet += 1;
              remainingSeconds = getWorkDuration(currentSet) - overflow;
            }
          } else {
            currentSet += 1;
            if (currentSet > config.sets) {
              finish();
              return;
            }
            phase = 'work';
            remainingSeconds = getWorkDuration(currentSet) - overflow;
          }
        }
        notifyTick();
      }
    }

    const drift = 1000 - (Date.now() - lastTimestamp);
    const delay = Math.max(drift, 10);
    timerId = setTimeout(scheduleTick, delay);
  };

  const start = (override = {}) => {
    config = { ...config, ...override };

    if (state === 'paused') {
      state = 'running';
      lastTimestamp = Date.now();
      notifyState();
      notifyTick();
      timerId = setTimeout(scheduleTick, 1000);
      return;
    }

    clearTimer();
    state = 'running';
    phase = 'work';
    currentSet = 1;
    elapsedSeconds = 0;
    activeElapsedSeconds = 0;
    restElapsedSeconds = 0;
    workflowState = usesSetRestWorkflow() ? 'in_set' : 'idle';
    remainingSeconds = usesIntervalWorkflow() ? getWorkDuration(1) : config.workSeconds;
    lastTimestamp = Date.now();

    notifyState();
    notifyTick();

    timerId = setTimeout(scheduleTick, 1000);
  };

  const advanceSetRest = () => {
    if (!usesSetRestWorkflow() || state === 'finished') return;

    if (workflowState === 'idle') {
      state = 'running';
      phase = 'work';
      workflowState = 'in_set';
      if (!lastTimestamp) lastTimestamp = Date.now();
      notifyState();
      notifyTick();
      timerId = setTimeout(scheduleTick, 1000);
      return;
    }

    if (workflowState === 'in_set') {
      clearTimer();
      if (currentSet >= config.sets) {
        finish();
        return;
      }
      state = 'paused';
      phase = 'rest';
      workflowState = config.restSeconds > 0 ? 'rest_ready' : 'idle';
      if (config.restSeconds <= 0) {
        currentSet += 1;
        phase = 'work';
      }
      remainingSeconds = config.restSeconds;
      notifyState();
      notifyTick();
      return;
    }

    if (workflowState === 'rest_ready') {
      state = 'running';
      workflowState = 'resting';
      phase = 'rest';
      remainingSeconds = config.restSeconds;
      lastTimestamp = Date.now();
      notifyState();
      notifyTick();
      timerId = setTimeout(scheduleTick, 1000);
    }
  };

  const pause = () => {
    if (state !== 'running') return;
    clearTimer();
    state = 'paused';
    notifyState();
    notifyTick();
  };

  const resume = () => {
    if (state !== 'paused') return;
    if (usesSetRestWorkflow() && workflowState === 'rest_ready') {
      advanceSetRest();
      return;
    }
    state = 'running';
    lastTimestamp = Date.now();
    notifyState();
    notifyTick();
    timerId = setTimeout(scheduleTick, 1000);
  };


  const advanceFromPausedPhase = () => {
    if (state !== 'paused' || state === 'finished') return;

    if (usesSetRestWorkflow()) {
      if (workflowState === 'in_set') {
        if (currentSet >= config.sets) {
          finish();
          return;
        }
        phase = 'rest';
        workflowState = config.restSeconds > 0 ? 'rest_ready' : 'idle';
        remainingSeconds = config.restSeconds;
        if (config.restSeconds <= 0) {
          currentSet += 1;
          phase = 'work';
        }
        notifyState();
        notifyTick();
        return;
      }
      if (workflowState === 'resting' || workflowState === 'rest_ready') {
        currentSet += 1;
        if (currentSet > config.sets) {
          finish();
          return;
        }
        phase = 'work';
        workflowState = 'idle';
        remainingSeconds = getWorkDuration(currentSet);
        notifyState();
        notifyTick();
      }
      return;
    }

    if (isTimeIntervalTimer()) {
      if (phase === 'work') {
        if (currentSet >= config.sets) {
          finish();
          return;
        }
        if (config.restSeconds > 0) {
          phase = 'rest';
          remainingSeconds = config.restSeconds;
        } else {
          currentSet += 1;
          if (currentSet > config.sets) {
            finish();
            return;
          }
          phase = 'work';
          remainingSeconds = getWorkDuration(currentSet);
        }
        notifyState();
        notifyTick();
        return;
      }

      currentSet += 1;
      if (currentSet > config.sets) {
        finish();
        return;
      }
      phase = 'work';
      remainingSeconds = getWorkDuration(currentSet);
      notifyState();
      notifyTick();
      return;
    }

    if (isTimeTimer()) {
      finish();
      return;
    }
  };

  const stop = () => {
    clearTimer();
    state = 'finished';
    workflowState = 'completed';
    notifyState();
    notifyTick();
  };

  const reset = (override = {}) => {
    clearTimer();
    config = { ...config, ...override };
    state = 'idle';
    phase = 'work';
    currentSet = 1;
    workflowState = 'idle';
    remainingSeconds = usesIntervalWorkflow() ? getWorkDuration(1) : config.workSeconds;
    elapsedSeconds = 0;
    activeElapsedSeconds = 0;
    restElapsedSeconds = 0;
    lastTimestamp = null;
    notifyState();
    notifyTick();
  };

  const onTick = (callback) => {
    tickSubscribers.add(callback);
    return () => tickSubscribers.delete(callback);
  };

  const onStateChange = (callback) => {
    stateSubscribers.add(callback);
    return () => stateSubscribers.delete(callback);
  };

  return {
    start,
    pause,
    resume,
    stop,
    reset,
    advanceSetRest,
    advanceFromPausedPhase,
    onTick,
    onStateChange,
    getSnapshot,
  };
};
