const pad2 = (value) => String(value).padStart(2, '0');

export const toTimestamp = (value, fallback = Date.now()) => {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : fallback;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === 'string' && value) {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export const toDateKey = (value, fallback = Date.now()) => {
  const date = new Date(toTimestamp(value, fallback));
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const startOfLocalDayTimestamp = (value, fallback = Date.now()) => {
  const date = new Date(toTimestamp(value, fallback));
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const startOfDay = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Date(startOfLocalDayTimestamp(date));
};

export const endOfDay = (dateKey) => {
  const date = startOfDay(dateKey);
  date.setHours(23, 59, 59, 999);
  return date;
};
