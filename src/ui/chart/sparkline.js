const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DAY_MS = 86400000;
const DEFAULT_WIDTH = 320;
const MIN_LABEL_GAP = 56;

const toDayTimestamp = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed.getTime();
};

const getNiceTickStep = (minimumStep) => {
  const candidates = [1, 2, 3, 5, 7, 10, 14, 15, 20, 30, 45, 60, 90];
  return candidates.find((candidate) => candidate >= minimumStep) || Math.max(1, minimumStep);
};

const getXAxisStep = ({ visibleDays, plotWidth }) => {
  const safePlotWidth = Math.max(1, plotWidth);
  const maxLabelCount = Math.max(2, Math.floor(safePlotWidth / MIN_LABEL_GAP));
  const minimumStep = Math.max(1, Math.ceil(visibleDays / maxLabelCount));
  return getNiceTickStep(minimumStep);
};

const getSafeRange = (values = []) => {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return { min: 0, max: 1 };
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  if (min === max) return { min: min - 1, max: max + 1 };
  return { min, max };
};

const appendText = ({ svg, x, y, text, anchor = 'middle' }) => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  node.setAttribute('x', String(x));
  node.setAttribute('y', String(y));
  node.setAttribute('fill', 'rgba(226, 232, 240, 0.9)');
  node.setAttribute('font-size', '8');
  node.setAttribute('text-anchor', anchor);
  node.textContent = text;
  svg.append(node);
};

export const createSparkline = ({
  height = 190,
  visibleDays = 30,
  points = [],
  color = '#93c5fd',
  strokeWidth = 2,
  label = '',
  yUnit = '',
} = {}) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'sparkline';
  wrapper.style.setProperty('--sparkline-height', `${height}px`);

  const viewport = document.createElement('div');
  viewport.className = 'sparkline__viewport';

  const content = document.createElement('div');
  content.className = 'sparkline__content';

  const safePoints = (Array.isArray(points) ? points : []).map((entry) => ({
    xTs: toDayTimestamp(entry?.x),
    y: Number(entry?.y),
  })).filter((entry) => Number.isFinite(entry.y) && Number.isFinite(entry.xTs));

  const rangeDays = Math.max(1, visibleDays);
  const endTs = toDayTimestamp(Date.now());
  const startTs = endTs - rangeDays * DAY_MS;
  const visiblePoints = safePoints.filter((point) => point.xTs >= startTs && point.xTs <= endTs);

  const renderEmpty = () => {
    content.innerHTML = '';
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = `${label || 'グラフ'}: データ不足`;
    content.append(empty);
  };

  const renderChart = (viewportWidth) => {
    content.innerHTML = '';
    if (visiblePoints.length <= 1) {
      renderEmpty();
      return;
    }

    const chartWidth = Math.max(DEFAULT_WIDTH, Math.floor(viewportWidth || DEFAULT_WIDTH));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label || 'sparkline chart');
    svg.setAttribute('viewBox', `0 0 ${chartWidth} ${height}`);
    svg.setAttribute('width', String(chartWidth));
    svg.setAttribute('height', String(height));

    const axis = {
      top: 12,
      right: 14,
      bottom: 30,
      left: 56,
    };

    const plotWidth = Math.max(1, chartWidth - axis.left - axis.right);
    const plotHeight = Math.max(1, height - axis.top - axis.bottom);

    const { min, max } = getSafeRange(visiblePoints.map((p) => p.y));
    const xTickStep = getXAxisStep({ visibleDays: rangeDays, plotWidth });

    const toX = (timestamp) => {
      const dayAgo = (endTs - timestamp) / DAY_MS;
      return axis.left + (1 - clamp(dayAgo / rangeDays, 0, 1)) * plotWidth;
    };
    const toY = (value) => axis.top + (1 - clamp((value - min) / (max - min), 0, 1)) * plotHeight;

    const xTicks = [];
    for (let dayAgo = 0; dayAgo <= rangeDays; dayAgo += xTickStep) xTicks.push(dayAgo);
    if (xTicks[xTicks.length - 1] !== rangeDays) xTicks.push(rangeDays);

    xTicks.forEach((dayAgo) => {
      const x = axis.left + (1 - dayAgo / rangeDays) * plotWidth;
      const grid = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      grid.setAttribute('x1', String(x));
      grid.setAttribute('x2', String(x));
      grid.setAttribute('y1', String(axis.top));
      grid.setAttribute('y2', String(axis.top + plotHeight));
      grid.setAttribute('stroke', 'rgba(148, 163, 184, 0.25)');
      grid.setAttribute('stroke-width', '0.7');
      svg.append(grid);

      appendText({
        svg,
        x,
        y: axis.top + plotHeight + 12,
        text: `${dayAgo}日前`,
      });
    });

    const yTickCount = 5;
    for (let idx = 0; idx <= yTickCount; idx += 1) {
      const ratio = idx / yTickCount;
      const y = axis.top + ratio * plotHeight;
      const value = max - (max - min) * ratio;
      const grid = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      grid.setAttribute('x1', String(axis.left));
      grid.setAttribute('x2', String(axis.left + plotWidth));
      grid.setAttribute('y1', String(y));
      grid.setAttribute('y2', String(y));
      grid.setAttribute('stroke', 'rgba(148, 163, 184, 0.25)');
      grid.setAttribute('stroke-width', idx === 0 || idx === yTickCount ? '0.9' : '0.7');
      svg.append(grid);

      appendText({
        svg,
        x: axis.left - 4,
        y: y + 3,
        text: `${value.toFixed(1)}${yUnit}`,
        anchor: 'end',
      });
    }

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    const linePoints = visiblePoints.map((point) => `${toX(point.xTs)},${toY(point.y)}`).join(' ');
    polyline.setAttribute('points', linePoints);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', color);
    polyline.setAttribute('stroke-width', String(strokeWidth));
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');
    svg.append(polyline);

    visiblePoints.forEach((point) => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', String(toX(point.xTs)));
      dot.setAttribute('cy', String(toY(point.y)));
      dot.setAttribute('r', '2.5');
      dot.setAttribute('fill', color);
      svg.append(dot);
    });

    content.append(svg);
    viewport.scrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  };

  viewport.append(content);
  wrapper.append(viewport);

  requestAnimationFrame(() => {
    renderChart(viewport.clientWidth);
  });

  const resizeObserver = new ResizeObserver(() => {
    renderChart(viewport.clientWidth);
  });
  resizeObserver.observe(viewport);

  return wrapper;
};
