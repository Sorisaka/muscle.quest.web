const defaultConfig = {
  mode: 'timer',
  trainingSec: 60,
  restSec: 30,
  sets: 1,
};

export const createTimerEngine = (initialConfig = {}) => {
  let config = { ...defaultConfig, ...initialConfig };
  let state = 'idle';
  let phase = 'training';
  let currentSet = 1;
  let remainingPhase = config.trainingSec;
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

  const getSnapshot = () => ({
    mode: config.mode,
    state,
    phase,
    currentSet,
    totalSets: config.sets,
    remainingSeconds: config.mode === 'timer' ? Math.max(remainingPhase, 0) : 0,
    elapsedSeconds,
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

      if (config.mode === 'timer') {
        remainingPhase -= diffSeconds;

        while (remainingPhase <= 0) {
          const overflow = Math.abs(remainingPhase);

          if (phase === 'training' && config.restSec > 0) {
            phase = 'rest';
            remainingPhase = config.restSec - overflow;
          } else {
            currentSet += 1;

            if (currentSet > config.sets) {
              finish();
              return;
            }

            phase = 'training';
            remainingPhase = config.trainingSec - overflow;
          }
        }
      }

      notifyTick();
    }

    const drift = 1000 - (Date.now() - lastTimestamp);
    const delay = Math.max(drift, 10);
    timerId = setTimeout(scheduleTick, delay);
  };

  const start = (override = {}) => {
    clearTimer();

    config = { ...config, ...override };
    state = 'running';
    phase = 'training';
    currentSet = 1;
    remainingPhase = config.trainingSec;
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
    phase = 'training';
    currentSet = 1;
    remainingPhase = config.trainingSec;
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
