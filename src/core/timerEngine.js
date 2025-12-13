const defaultConfig = {
  mode: 'timer', // timer | interval | stopwatch
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
  let timerId = null;
  let lastTimestamp = null;

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

  const nextPhase = () => {
    if (config.mode === 'stopwatch') return '計測中';
    if (config.mode === 'timer') return '完了';

    if (phase === 'work') {
      if (currentSet >= config.sets) return '完了';
      return '休憩';
    }
    if (phase === 'rest') {
      if (currentSet >= config.sets) return '完了';
      return 'トレーニング';
    }
    return '完了';
  };

  const getSnapshot = () => ({
    mode: config.mode,
    state,
    phase,
    currentSet,
    totalSets: config.mode === 'interval' ? config.sets : 1,
    remainingSeconds: config.mode === 'stopwatch' ? 0 : Math.max(remainingSeconds, 0),
    elapsedSeconds,
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

      if (config.mode === 'stopwatch') {
        notifyTick();
      } else if (config.mode === 'timer') {
        remainingSeconds -= diffSeconds;
        if (remainingSeconds <= 0) {
          finish();
          return;
        }
        notifyTick();
      } else if (config.mode === 'interval') {
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
    clearTimer();

    config = { ...config, ...override };
    state = 'running';
    phase = config.mode === 'interval' ? 'work' : 'work';
    currentSet = 1;
    remainingSeconds = config.mode === 'interval' ? getWorkDuration(1) : config.workSeconds;
    elapsedSeconds = 0;
    lastTimestamp = Date.now();

    notifyState();
    notifyTick();

    timerId = setTimeout(scheduleTick, 1000);
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
    state = 'running';
    lastTimestamp = Date.now();
    notifyState();
    timerId = setTimeout(scheduleTick, 1000);
  };

  const stop = () => {
    clearTimer();
    state = 'finished';
    notifyState();
    notifyTick();
  };

  const reset = (override = {}) => {
    clearTimer();
    config = { ...config, ...override };
    state = 'idle';
    phase = 'work';
    currentSet = 1;
    remainingSeconds = config.mode === 'interval' ? getWorkDuration(1) : config.workSeconds;
    elapsedSeconds = 0;
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
    onTick,
    onStateChange,
    getSnapshot,
  };
};
