const toPositiveNumberOrNull = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num < 0 ? 0 : num;
};

const toPositiveNumberOrFallback = (value, fallback = 0) => {
  const parsed = toPositiveNumberOrNull(value);
  return parsed == null ? fallback : parsed;
};

const sanitizeMuscles = (value) => Array.isArray(value)
  ? Array.from(new Set(value.map((entry) => String(entry || '').trim().toLowerCase()).filter(Boolean)))
  : [];

const MENU_INPUT_MODES = ['weightReps', 'reps', 'time'];
const MENU_TIME_MODES = ['timer', 'stopwatch', 'intervalTimer', 'intervalStopwatch'];

const LEGACY_TIMER_TYPE_MAP = {
  'セット+休憩': 'setRest',
  インターバル: 'interval',
  タイム: 'time',
  stopwatch: 'time',
  hold: 'time',
};

const normalizeInputMode = (mode, fallback = 'weightReps') => {
  if (mode === 'hold' || mode === 'stopwatch') return 'time';
  return MENU_INPUT_MODES.includes(mode) ? mode : fallback;
};

const normalizeTimerType = (value, inputMode, fallback = 'setRest') => {
  const mapped = LEGACY_TIMER_TYPE_MAP[value] || value;
  if (['setRest', 'interval', 'time'].includes(mapped)) {
    return inputMode === 'time' ? 'time' : 'setRest';
  }
  return inputMode === 'time' ? 'time' : fallback;
};

const normalizeTimeMode = (value, fallback = 'stopwatch') => {
  const aliases = {
    interval: 'intervalTimer',
    setRest: 'intervalStopwatch',
    hold: 'intervalTimer',
    time: 'stopwatch',
  };
  const normalized = aliases[value] || value || fallback;
  return MENU_TIME_MODES.includes(normalized) ? normalized : fallback;
};

const resolveEditableFieldKeys = ({ inputMode, timeMode, trackingMetrics = [] }) => {
  const withDistance = Array.isArray(trackingMetrics) && trackingMetrics.includes('distance');
  if (inputMode === 'weightReps') {
    return ['weight', 'reps', 'sets', 'restSeconds'];
  }
  if (inputMode === 'reps') {
    return ['reps', 'sets', 'restSeconds'];
  }

  const timeFields = {
    timer: ['workSeconds'],
    stopwatch: [],
    intervalTimer: ['workSeconds', 'sets', 'restSeconds'],
    intervalStopwatch: ['sets', 'restSeconds'],
  };
  const fields = timeFields[timeMode] || [];
  return withDistance ? [...fields, 'distanceMeters'] : fields;
};

export const getMenuConfigShape = (config = {}) => {
  const inputMode = normalizeInputMode(config.inputMode, 'weightReps');
  const timerType = normalizeTimerType(config.timerType || config.mode, inputMode);
  const timeMode = normalizeTimeMode(config.timeMode || config.defaultTimeMode, timerType === 'time' ? 'stopwatch' : 'intervalStopwatch');
  const trackingMetrics = Array.isArray(config.trackingMetrics)
    ? config.trackingMetrics.filter((entry) => typeof entry === 'string' && entry)
    : [];
  return {
    inputMode,
    timerType,
    timeMode,
    trackingMetrics,
    fields: resolveEditableFieldKeys({ inputMode, timeMode, trackingMetrics }),
  };
};

export const buildMenuWorkoutDefaultConfig = (workoutEntry, difficulty = 'beginner') => {
  const definition = workoutEntry?.definition || null;
  if (!definition) {
    return {
      inputMode: 'weightReps',
      timerType: 'setRest',
      timeMode: 'stopwatch',
      trackingMetrics: [],
      sets: 3,
      reps: null,
      weight: null,
      workSeconds: null,
      restSeconds: null,
      distanceMeters: null,
    };
  }

  const difficultyDef = definition.difficulties?.[difficulty]
    || definition.difficulties?.beginner
    || Object.values(definition.difficulties || {})[0]
    || {};
  const defaultSets = Array.isArray(difficultyDef.defaultSets) && difficultyDef.defaultSets.length
    ? difficultyDef.defaultSets
    : [{}];
  const firstSet = defaultSets[0] || {};
  const inputMode = definition.inputMode || (definition.unit === 'time' ? 'time' : 'weightReps');
  const timerType = definition.defaultTimerMode || 'setRest';
  const timeMode = definition.defaultTimeMode || (timerType === 'time' ? 'timer' : 'stopwatch');
  const trackingMetrics = Array.isArray(definition.trackingMetrics) ? definition.trackingMetrics : [];

  return {
    inputMode,
    timerType,
    timeMode,
    trackingMetrics,
    sets: toPositiveNumberOrFallback(defaultSets.length, 1),
    reps: toPositiveNumberOrNull(firstSet.reps),
    weight: toPositiveNumberOrNull(firstSet.weight),
    workSeconds: toPositiveNumberOrNull(firstSet.timeSeconds),
    restSeconds: toPositiveNumberOrNull(definition.restSeconds),
    distanceMeters: toPositiveNumberOrNull(definition.goalConfig?.type === 'distance' ? definition.goalConfig.defaultValue : null),
  };
};

export const normalizeMenuItemConfig = (rawConfig = {}, fallbackConfig = {}, options = {}) => {
  const source = rawConfig || {};
  const definition = options.definition || null;
  const lockInputModeToDefinition = options.lockInputModeToDefinition !== false;

  const inferredInputMode = source.weight != null ? 'weightReps' : source.reps != null ? 'reps' : 'time';
  const resolvedInputMode = normalizeInputMode(
    source.inputMode || fallbackConfig.inputMode || definition?.inputMode || inferredInputMode,
    definition?.inputMode || 'weightReps',
  );
  const safeInputMode = definition?.inputMode && lockInputModeToDefinition
    ? normalizeInputMode(definition.inputMode, resolvedInputMode)
    : resolvedInputMode;
  const safeTimerType = normalizeTimerType(
    source.timerType || source.mode || fallbackConfig.timerType || definition?.defaultTimerMode || 'setRest',
    safeInputMode,
    definition?.defaultTimerMode || 'setRest',
  );
  const safeTimeMode = normalizeTimeMode(
    source.timeMode || source.defaultTimeMode || fallbackConfig.timeMode || definition?.defaultTimeMode,
    safeTimerType === 'time' ? (definition?.defaultTimeMode || 'stopwatch') : 'intervalStopwatch',
  );
  const trackingMetrics = Array.isArray(source.trackingMetrics)
    ? source.trackingMetrics.filter((entry) => typeof entry === 'string' && entry)
    : (Array.isArray(fallbackConfig.trackingMetrics) ? fallbackConfig.trackingMetrics : (Array.isArray(definition?.trackingMetrics) ? definition.trackingMetrics : []));

  const normalized = {
    ...fallbackConfig,
    ...source,
    inputMode: safeInputMode,
    timerType: safeTimerType,
    mode: safeTimerType,
    timeMode: safeInputMode === 'time' ? safeTimeMode : 'stopwatch',
    trackingMetrics,
    sets: toPositiveNumberOrFallback(source.sets ?? fallbackConfig.sets, 1),
    reps: toPositiveNumberOrNull(source.reps ?? fallbackConfig.reps),
    weight: toPositiveNumberOrNull(source.weight ?? fallbackConfig.weight),
    workSeconds: toPositiveNumberOrNull(source.workSeconds ?? source.timeSeconds ?? fallbackConfig.workSeconds),
    restSeconds: toPositiveNumberOrNull(source.restSeconds ?? fallbackConfig.restSeconds),
    distanceMeters: toPositiveNumberOrNull(source.distanceMeters ?? fallbackConfig.distanceMeters),
  };

  const shape = getMenuConfigShape(normalized);
  if (!shape.fields.includes('weight')) normalized.weight = null;
  if (!shape.fields.includes('reps')) normalized.reps = null;
  if (!shape.fields.includes('workSeconds')) normalized.workSeconds = null;
  if (!shape.fields.includes('distanceMeters')) normalized.distanceMeters = null;
  if (!shape.fields.includes('restSeconds')) normalized.restSeconds = null;
  if (!shape.fields.includes('sets')) normalized.sets = 1;

  return normalized;
};

export const normalizeMenuPlanItem = (item = {}, index = 0, options = {}) => {
  const workoutMap = options.workoutMap || new Map();
  const findQuestByExercise = options.findQuestByExercise;
  const difficulty = options.difficulty || 'beginner';

  const exerciseSlug = String(item.exerciseSlug || item.exercise_slug || item.primaryExerciseSlug || item.slug || '').trim();
  const workoutEntry = workoutMap.get(exerciseSlug) || null;
  const quest = item.questId
    ? options.quests?.find((entry) => entry.id === item.questId)
    : (typeof findQuestByExercise === 'function' ? findQuestByExercise(exerciseSlug) : null);

  const defaultLabel = item.defaultLabel || item.workoutLabel || workoutEntry?.label || exerciseSlug || '不明なワークアウト';
  const displayName = typeof item.displayName === 'string'
    ? item.displayName
    : typeof item.title === 'string'
      ? item.title
      : '';

  const defaultConfig = buildMenuWorkoutDefaultConfig(workoutEntry, difficulty);
  const config = normalizeMenuItemConfig(item.config || item.workoutConfig || item.planConfig, defaultConfig, {
    definition: workoutEntry?.definition,
  });

  return {
    id: item.id || `${Date.now()}-${index}`,
    workoutId: item.workoutId || item.questId || quest?.id || workoutEntry?.quest?.id || '',
    questId: item.questId || quest?.id || workoutEntry?.quest?.id || '',
    exerciseSlug,
    primaryExerciseSlug: exerciseSlug,
    displayName,
    defaultLabel,
    title: displayName,
    workoutLabel: defaultLabel,
    category: item.category || workoutEntry?.category || quest?.category || 'unknown',
    muscles: sanitizeMuscles(item.muscles || workoutEntry?.muscles || []),
    note: item.note || '',
    config,
    workoutConfig: config,
  };
};

export const sanitizeMenuPlanItems = (items = [], options = {}) => (items || [])
  .map((item, index) => normalizeMenuPlanItem(item, index, options))
  .map((item, index) => {
    const workoutEntry = options.workoutMap?.get?.(item.exerciseSlug);
    const normalizedConfig = normalizeMenuItemConfig(
      item.config || item.workoutConfig,
      item.config || item.workoutConfig || {},
      { definition: workoutEntry?.definition },
    );
    return {
    id: item.id || `${Date.now()}-${index}`,
    workoutId: item.workoutId || item.questId || '',
    questId: item.questId || '',
    exerciseSlug: item.exerciseSlug || '',
    primaryExerciseSlug: item.exerciseSlug || '',
    displayName: typeof item.displayName === 'string' ? item.displayName.trim() : '',
    defaultLabel: item.defaultLabel || item.workoutLabel || item.exerciseSlug || '不明なワークアウト',
    title: typeof item.displayName === 'string' ? item.displayName.trim() : '',
    workoutLabel: item.defaultLabel || item.workoutLabel || item.exerciseSlug || '不明なワークアウト',
    category: item.category || 'unknown',
    muscles: sanitizeMuscles(item.muscles),
    note: typeof item.note === 'string' ? item.note.trim() : '',
    config: normalizedConfig,
    workoutConfig: normalizedConfig,
    };
  });
