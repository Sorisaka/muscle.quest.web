const STORAGE_KEY = 'musclequest:settings';

const defaultSettings = {
  language: 'en',
  difficulty: 'beginner',
  sound: true,
};

const readSettings = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultSettings };

  try {
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    console.warn('Failed to parse settings from storage. Falling back to defaults.');
    return { ...defaultSettings };
  }
};

export const createStore = () => {
  let settings = readSettings();
  const subscribers = new Set();

  const notify = () => {
    subscribers.forEach((callback) => callback(settings));
  };

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  };

  const getSettings = () => settings;

  const updateSettings = (partial) => {
    settings = { ...settings, ...partial };
    persist();
    notify();
  };

  const subscribe = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };

  return {
    getSettings,
    updateSettings,
    subscribe,
  };
};
