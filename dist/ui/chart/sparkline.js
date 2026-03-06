import { toDateKey as toLocalDateKey } from '../../lib/dateKey.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DAY_MS = 86400000;
const MIN_LABEL_GAP = 56;

const toDayTimestamp = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed.getTime();
};

const toDateKey = (value) => {
  const ts = toDayTimestamp(value);
  if (!Number.isFinite(ts)) return null;
  return toLocalDateKey(ts);
};

const getNiceTickStep = (minimumStep) => {
  const candidates = [1, 2, 3, 5, 7, 10, 14, 15, 20, 30, 45, 60, 90];
  return candidates.find((candidate) => candidate >= minimumStep) || Math.max(1, minimumStep);
};

const getXAxisStep = ({ dayWidth }) => {
  const minimumStep = Math.max(1, Math.ceil(MIN_LABEL_GAP / Math.max(1, dayWidth)));
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

export const createSparkline = (initialOptions = {}) => {
  const state = {
    ...initialOptions,
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'sparkline';

  const viewport = document.createElement('div');
  viewport.className = 'sparkline__viewport';

  const content = document.createElement('div');
  content.className = 'sparkline__content';
  viewport.style.touchAction = 'pan-x';

  const alignViewportToRight = () => {
    viewport.scrollLeft = Math.max(0, viewport.scrollWidth);
  };

  const renderEmpty = () => {
    content.innerHTML = '';
    content.style.width = '100%';
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = `${state.label || 'グラフ'}: データ不足`;
    content.append(empty);
  };

  const emitHover = (point) => {
    if (typeof state.onPointHover === 'function') {
      state.onPointHover({
        dateKey: point.dateKey,
        value: point.y,
        label: state.label,
        yUnit: state.yUnit,
      });
    }
  };

  const emitSelect = (point) => {
    if (typeof state.onPointSelect === 'function') {
      state.onPointSelect({
        dateKey: point.dateKey,
        value: point.y,
        label: state.label,
        yUnit: state.yUnit,
      });
    }
  };

  const emitLeave = () => {
    if (typeof state.onPointLeave === 'function') state.onPointLeave();
  };

  const renderChart = (viewportWidth) => {
    wrapper.style.setProperty('--sparkline-height', `${state.height || 190}px`);
    content.innerHTML = '';

    const points = (Array.isArray(state.points) ? state.points : []).map((entry) => ({
      xTs: toDayTimestamp(entry?.x),
      dateKey: toDateKey(entry?.x),
      y: Number(entry?.y),
    })).filter((entry) => Number.isFinite(entry.y) && Number.isFinite(entry.xTs) && entry.dateKey);

    const rangeDays = Math.max(1, Number(state.visibleDays) || 30);
    const endTs = toDayTimestamp(Date.now());
    const pointsUntilToday = points.filter((point) => point.xTs <= endTs);

    if (pointsUntilToday.length <= 0) {
      renderEmpty();
      return;
    }

    const oldestTs = pointsUntilToday.reduce((acc, point) => Math.min(acc, point.xTs), endTs);
    const drawableDays = Math.max(rangeDays, Math.ceil((endTs - oldestTs) / DAY_MS));

    const safeViewportWidth = Math.max(280, Math.floor(viewportWidth || 0));
    const height = Number(state.height || 190);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', state.label || 'sparkline chart');

    const axis = {
      top: 12,
      right: 56,
      bottom: 30,
      left: 14,
    };

    const visiblePlotWidth = Math.max(1, safeViewportWidth - axis.left - axis.right);
    const dayWidth = Math.max(2, visiblePlotWidth / rangeDays);
    const plotWidth = Math.max(1, dayWidth * drawableDays);
    const chartWidth = Math.ceil(axis.left + axis.right + plotWidth);
    const plotRight = axis.left + plotWidth;
    const plotHeight = Math.max(1, height - axis.top - axis.bottom);

    svg.setAttribute('viewBox', `0 0 ${chartWidth} ${height}`);
    svg.setAttribute('width', String(chartWidth));
    svg.setAttribute('height', String(height));

    const { min, max } = getSafeRange(pointsUntilToday.map((point) => point.y));
    const xTickStep = getXAxisStep({ dayWidth });

    const toX = (timestamp) => {
      const dayAgo = (endTs - timestamp) / DAY_MS;
      return plotRight - clamp(dayAgo, 0, drawableDays) * dayWidth;
    };

    const toY = (value) => axis.top + (1 - clamp((value - min) / (max - min), 0, 1)) * plotHeight;

    const xTicks = [];
    for (let dayAgo = 0; dayAgo <= drawableDays; dayAgo += xTickStep) xTicks.push(dayAgo);
    if (xTicks[xTicks.length - 1] !== drawableDays) xTicks.push(drawableDays);

    xTicks.forEach((dayAgo) => {
      const x = plotRight - dayAgo * dayWidth;
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
      grid.setAttribute('x2', String(plotRight));
      grid.setAttribute('y1', String(y));
      grid.setAttribute('y2', String(y));
      grid.setAttribute('stroke', 'rgba(148, 163, 184, 0.25)');
      grid.setAttribute('stroke-width', idx === 0 || idx === yTickCount ? '0.9' : '0.7');
      svg.append(grid);

      appendText({
        svg,
        x: plotRight + 4,
        y: y + 3,
        text: `${value.toFixed(1)}${state.yUnit || ''}`,
        anchor: 'start',
      });
    }

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', pointsUntilToday.map((point) => `${toX(point.xTs)},${toY(point.y)}`).join(' '));
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', state.color || '#93c5fd');
    polyline.setAttribute('stroke-width', String(state.strokeWidth || 2));
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');
    svg.append(polyline);

    let pressState = null;

    pointsUntilToday.forEach((point) => {
      const isActive = point.dateKey === state.activeDateKey;
      const cx = toX(point.xTs);
      const cy = toY(point.y);
      const pointGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hitArea.setAttribute('cx', String(cx));
      hitArea.setAttribute('cy', String(cy));
      hitArea.setAttribute('r', '13');
      hitArea.setAttribute('fill', 'rgba(255,255,255,0.001)');
      hitArea.style.cursor = 'pointer';

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', String(cx));
      dot.setAttribute('cy', String(cy));
      dot.setAttribute('r', isActive ? '4.2' : '3.2');
      dot.setAttribute('fill', state.color || '#93c5fd');
      dot.setAttribute('stroke', 'rgba(13, 17, 23, 0.9)');
      dot.setAttribute('stroke-width', isActive ? '2' : '1');
      dot.style.pointerEvents = 'none';

      const interactive = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      interactive.setAttribute('cx', String(cx));
      interactive.setAttribute('cy', String(cy));
      interactive.setAttribute('r', '13');
      interactive.setAttribute('fill', 'transparent');
      interactive.setAttribute('tabindex', '0');
      interactive.style.cursor = 'pointer';

      const handleSelect = () => emitSelect(point);

      interactive.addEventListener('pointerdown', (event) => {
        pressState = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
      });

      interactive.addEventListener('pointerup', (event) => {
        if (!pressState || pressState.pointerId !== event.pointerId) return;
        const movedX = Math.abs(event.clientX - pressState.x);
        const movedY = Math.abs(event.clientY - pressState.y);
        pressState = null;
        if (movedX > 8 || movedY > 8) return;
        handleSelect();
      });

      interactive.addEventListener('pointercancel', () => {
        pressState = null;
      });

      interactive.addEventListener('click', (event) => {
        if (event.detail === 0) handleSelect();
      });

      interactive.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      });

      interactive.addEventListener('mouseenter', () => emitHover(point));
      interactive.addEventListener('focus', () => emitHover(point));
      interactive.addEventListener('mouseleave', emitLeave);
      interactive.addEventListener('blur', emitLeave);
      interactive.addEventListener('pointerenter', () => emitHover(point));

      pointGroup.append(hitArea, dot, interactive);
      svg.append(pointGroup);
    });

    content.style.width = `${chartWidth}px`;
    content.append(svg);

    requestAnimationFrame(() => {
      alignViewportToRight();
      requestAnimationFrame(() => alignViewportToRight());
    });
  };

  viewport.append(content);
  wrapper.append(viewport);

  const resizeObserver = new ResizeObserver(() => renderChart(viewport.clientWidth));
  resizeObserver.observe(viewport);

  wrapper.updateSparkline = (nextOptions = {}) => {
    Object.assign(state, nextOptions || {});
    renderChart(viewport.clientWidth);
  };

  wrapper.destroySparkline = () => resizeObserver.disconnect();

  wrapper.updateSparkline(initialOptions);

  return wrapper;
};
