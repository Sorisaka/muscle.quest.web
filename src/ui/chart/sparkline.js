const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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
  points = [],
  color = '#93c5fd',
  strokeWidth = 2,
  label = '',
} = {}) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'sparkline';

  const safePoints = (Array.isArray(points) ? points : []).map((entry) => ({
    x: entry?.x,
    y: Number(entry?.y),
  })).filter((entry) => Number.isFinite(entry.y));

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

  const toX = (idx) => padding + (idx / (safePoints.length - 1)) * plotWidth;
  const toY = (value) => padding + (1 - clamp((value - min) / (max - min), 0, 1)) * plotHeight;

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  const linePoints = safePoints.map((point, idx) => `${toX(idx)},${toY(point.y)}`).join(' ');
  polyline.setAttribute('points', linePoints);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', color);
  polyline.setAttribute('stroke-width', String(strokeWidth));
  polyline.setAttribute('stroke-linecap', 'round');
  polyline.setAttribute('stroke-linejoin', 'round');
  svg.append(polyline);

  safePoints.forEach((point, idx) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(toX(idx)));
    dot.setAttribute('cy', String(toY(point.y)));
    dot.setAttribute('r', '2.5');
    dot.setAttribute('fill', color);
    svg.append(dot);
  });

  wrapper.append(svg);
  return wrapper;
};
