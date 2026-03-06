const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DAY_MS = 86400000;

const toDayTimestamp = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed.getTime();
};

const getXAxisStep = (visibleDays) => {
  if (visibleDays <= 7) return 1;
  if (visibleDays <= 30) return 5;
  if (visibleDays <= 90) return 15;
  return 30;
};

const getSafeRange = (values = []) => {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return { min: 0, max: 1 };
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  if (min === max) return { min: min - 1, max: max + 1 };
  return { min, max };
};

export const createSparkline = ({
  width = 320,
  height = 120,
  visibleDays = 30,
  points = [],
  color = '#93c5fd',
  strokeWidth = 2,
  label = '',
} = {}) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'sparkline';

  const safePoints = (Array.isArray(points) ? points : []).map((entry) => ({
    x: entry?.x,
    xTs: toDayTimestamp(entry?.x),
    y: Number(entry?.y),
  })).filter((entry) => Number.isFinite(entry.y) && Number.isFinite(entry.xTs));

  if (safePoints.length <= 1) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = `${label || 'グラフ'}: データ不足`;
    wrapper.append(empty);
    return wrapper;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label || 'sparkline chart');

  const padding = 12;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const { min, max } = getSafeRange(safePoints.map((p) => p.y));
  const latestTs = Math.max(...safePoints.map((p) => p.xTs));
  const earliestTs = Math.min(...safePoints.map((p) => p.xTs));
  const spanDays = Math.max(1, Math.round((latestTs - earliestTs) / DAY_MS));
  const totalDays = Math.max(visibleDays - 1, spanDays);
  const xTickStep = getXAxisStep(visibleDays);

  const toX = (timestamp) => {
    const dayAgo = Math.round((latestTs - timestamp) / DAY_MS);
    return padding + (1 - clamp(dayAgo / totalDays, 0, 1)) * plotWidth;
  };
  const toY = (value) => padding + (1 - clamp((value - min) / (max - min), 0, 1)) * plotHeight;

  for (let dayAgo = 0; dayAgo <= totalDays; dayAgo += xTickStep) {
    const x = padding + (1 - dayAgo / totalDays) * plotWidth;
    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    grid.setAttribute('x1', String(x));
    grid.setAttribute('x2', String(x));
    grid.setAttribute('y1', String(padding));
    grid.setAttribute('y2', String(padding + plotHeight));
    grid.setAttribute('stroke', 'rgba(148, 163, 184, 0.25)');
    grid.setAttribute('stroke-width', '0.7');
    svg.append(grid);
  }

  const yTickCount = 5;
  for (let idx = 0; idx <= yTickCount; idx += 1) {
    const y = padding + (idx / yTickCount) * plotHeight;
    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    grid.setAttribute('x1', String(padding));
    grid.setAttribute('x2', String(padding + plotWidth));
    grid.setAttribute('y1', String(y));
    grid.setAttribute('y2', String(y));
    grid.setAttribute('stroke', 'rgba(148, 163, 184, 0.25)');
    grid.setAttribute('stroke-width', idx === 0 || idx === yTickCount ? '0.9' : '0.7');
    svg.append(grid);
  }

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  const linePoints = safePoints.map((point) => `${toX(point.xTs)},${toY(point.y)}`).join(' ');
  polyline.setAttribute('points', linePoints);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', color);
  polyline.setAttribute('stroke-width', String(strokeWidth));
  polyline.setAttribute('stroke-linecap', 'round');
  polyline.setAttribute('stroke-linejoin', 'round');
  svg.append(polyline);

  safePoints.forEach((point) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(toX(point.xTs)));
    dot.setAttribute('cy', String(toY(point.y)));
    dot.setAttribute('r', '2.5');
    dot.setAttribute('fill', color);
    svg.append(dot);
  });

  const scroll = document.createElement('div');
  scroll.className = 'sparkline__scroll';
  const widthRatio = totalDays / Math.max(1, visibleDays - 1);
  svg.style.width = `max(100%, calc(${widthRatio} * 100%))`;
  scroll.append(svg);
  wrapper.append(scroll);

  requestAnimationFrame(() => {
    scroll.scrollLeft = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
  });

  return wrapper;
};
