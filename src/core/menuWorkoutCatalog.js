import { trainingDefinitions } from '../data/trainingDefinitions.js';

export const MENU_WORKOUT_CATEGORY_LABELS = {
  cardio: '有酸素',
  bodyweight: '自重',
  weights: 'ウエイト',
  unknown: 'その他',
};

export const MENU_WORKOUT_CATEGORY_ORDER = ['cardio', 'bodyweight', 'weights', 'unknown'];

export const MENU_WORKOUT_MUSCLE_LABELS = {
  chest: '胸',
  back: '背中',
  shoulders: '肩',
  arms: '腕',
  core: '体幹',
  legs: '脚',
  glutes: '臀部',
  fullbody: '全身',
  other: 'その他',
};

const sanitizeMuscles = (value) => Array.isArray(value)
  ? Array.from(new Set(value.map((entry) => String(entry || '').trim().toLowerCase()).filter(Boolean)))
  : [];

const sortWorkouts = (a, b) => {
  const categoryOrder = MENU_WORKOUT_CATEGORY_ORDER.indexOf(a.category) - MENU_WORKOUT_CATEGORY_ORDER.indexOf(b.category);
  if (categoryOrder) return categoryOrder;
  const muscleOrder = (a.primaryMuscleLabel || '').localeCompare(b.primaryMuscleLabel || '', 'ja');
  if (muscleOrder) return muscleOrder;
  return (a.label || '').localeCompare(b.label || '', 'ja');
};

export const buildMenuWorkoutCatalog = ({ findQuestByExercise }) => {
  const workouts = Object.values(trainingDefinitions || {})
    .filter((entry) => entry?.isActive !== false)
    .map((entry) => {
      const slug = String(entry.id || '').trim();
      if (!slug) return null;
      const category = MENU_WORKOUT_CATEGORY_ORDER.includes(entry.category) ? entry.category : 'unknown';
      const muscles = sanitizeMuscles(entry.muscles);
      const primaryMuscle = muscles[0] || 'other';
      return {
        id: slug,
        slug,
        label: entry.label || slug,
        category,
        categoryLabel: MENU_WORKOUT_CATEGORY_LABELS[category] || MENU_WORKOUT_CATEGORY_LABELS.unknown,
        muscles,
        primaryMuscle,
        primaryMuscleLabel: MENU_WORKOUT_MUSCLE_LABELS[primaryMuscle] || MENU_WORKOUT_MUSCLE_LABELS.other,
        definition: entry,
        quest: typeof findQuestByExercise === 'function' ? findQuestByExercise(slug) : null,
      };
    })
    .filter(Boolean)
    .sort(sortWorkouts);

  return {
    workouts,
    workoutMap: new Map(workouts.map((entry) => [entry.slug, entry])),
    muscleOptions: Object.entries(MENU_WORKOUT_MUSCLE_LABELS).map(([value, label]) => ({ value, label })),
  };
};

export const sortMenuWorkouts = (items = []) => items.slice().sort(sortWorkouts);

export const createUnknownMenuWorkout = ({ slug, label, muscles = [] }) => {
  const safeMuscles = sanitizeMuscles(muscles);
  const primaryMuscle = safeMuscles[0] || 'other';
  return {
    id: slug,
    slug,
    label: label || slug || '不明なワークアウト',
    category: 'unknown',
    categoryLabel: MENU_WORKOUT_CATEGORY_LABELS.unknown,
    muscles: safeMuscles.length ? safeMuscles : ['other'],
    primaryMuscle,
    primaryMuscleLabel: MENU_WORKOUT_MUSCLE_LABELS[primaryMuscle] || MENU_WORKOUT_MUSCLE_LABELS.other,
    isUnknown: true,
  };
};
