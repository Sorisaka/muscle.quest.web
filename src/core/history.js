const startOfDay = (timestamp) => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const isWithinDays = (timestamp, days, now = Date.now()) => {
  const diff = now - timestamp;
  const limit = days * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= limit;
};

export const aggregatePoints = (history, now = Date.now()) => {
  const total = { daily: 0, weekly: 0, monthly: 0 };
  history.forEach((item) => {
    if (isWithinDays(item.timestamp, 1, now)) total.daily += item.points || 0;
    if (isWithinDays(item.timestamp, 7, now)) total.weekly += item.points || 0;
    if (isWithinDays(item.timestamp, 30, now)) total.monthly += item.points || 0;
  });
  return total;
};

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
