import { startOfLocalDayTimestamp } from './dateKey.js';

const startOfDay = (timestamp) => startOfLocalDayTimestamp(timestamp);

const isWithinDays = (timestamp, days, now = Date.now()) => {
  const diff = now - timestamp;
  const limit = days * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= limit;
};

const getCaloriesValue = (item) => {
  const calories = Number(item?.calories);
  return Number.isFinite(calories) ? calories : 0;
};

export const aggregateCalories = (history, now = Date.now()) => {
  const total = { daily: 0, weekly: 0, monthly: 0 };
  history.forEach((item) => {
    const value = getCaloriesValue(item);
    if (isWithinDays(item.timestamp, 1, now)) total.daily += value;
    if (isWithinDays(item.timestamp, 7, now)) total.weekly += value;
    if (isWithinDays(item.timestamp, 30, now)) total.monthly += value;
  });
  return total;
};

export const aggregatePoints = (history, now = Date.now()) => aggregateCalories(history, now);

export const calculateStreak = (history, now = Date.now()) => {
  const daysWithWork = new Set(history.map((entry) => startOfDay(entry.timestamp)));
  if (daysWithWork.size === 0) return 0;
  let streak = 0;
  let cursor = startOfDay(now);
  while (daysWithWork.has(cursor)) {
    streak += 1;
    cursor -= 24 * 60 * 60 * 1000;
  }
  return streak;
};
