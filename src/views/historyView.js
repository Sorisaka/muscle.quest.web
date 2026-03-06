import { toDateKey, toTimestamp } from '../lib/dateKey.js';
import { createSparkline } from '../ui/chart/sparkline.js';
import { createMonthGrid } from '../ui/calendar/monthGrid.js';
import { defaultHistoryFilter, filterRuns, getRunTags } from '../core/historyFilters.js';
import { createHistoryFilterControls, HISTORY_CATEGORY_LABELS, toMuscleLabel } from '../ui/historyFilterControls.js';

const PERIODS = [7, 30, 90, 180];


const formatMonthLabel = (year, month) => `${year}年${month}月`;

const shiftMonth = ({ year, month }, delta) => {
  const next = new Date(year, month - 1 + delta, 1);
  return { year: next.getFullYear(), month: next.getMonth() + 1 };
};

const createMetricForm = ({ store, playSfx, onSaved }) => {
  const card = document.createElement('div');
  card.className = 'card account-card';

  const title = document.createElement('h3');
  title.textContent = '計測を追加';

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = toDateKey(Date.now());

  const weightInput = document.createElement('input');
  weightInput.type = 'number';
  weightInput.step = '0.1';
  weightInput.placeholder = '体重(kg)';

  const fatInput = document.createElement('input');
  fatInput.type = 'number';
  fatInput.step = '0.1';
  fatInput.placeholder = '体脂肪率(%)';

  const actions = document.createElement('div');
  actions.className = 'hero__actions';

  const save = document.createElement('button');
  save.type = 'button';
  save.textContent = '保存';
  save.addEventListener('click', async () => {
    playSfx('ui:select');
    await Promise.resolve(store.upsertBodyMetric(dateInput.value, {
      weight_kg: weightInput.value ? Number(weightInput.value) : null,
      body_fat_pct: fatInput.value ? Number(fatInput.value) : null,
      visibility: 'private',
    }));
    if (typeof onSaved === 'function') onSaved(dateInput.value);
  });

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'ghost';
  remove.textContent = '削除';
  remove.addEventListener('click', async () => {
    playSfx('ui:select');
    await Promise.resolve(store.deleteBodyMetric(dateInput.value));
    if (typeof onSaved === 'function') onSaved(dateInput.value);
  });

  actions.append(save, remove);
  card.append(title, dateInput, weightInput, fatInput, actions);
  return card;
};

const createBodyMetricsPanel = async ({ store, playSfx }) => {
  const panel = document.createElement('div');
  panel.className = 'stack';

  let activePeriod = 30;
  const controls = document.createElement('div');
  controls.className = 'tabs';
  const chartSlot = document.createElement('div');
  chartSlot.className = 'stack';

  const renderCharts = async () => {
    chartSlot.innerHTML = '';
    const toDate = toDateKey(Date.now());
    const fromDate = toDateKey(Date.now() - (activePeriod - 1) * 86400000);
    const rows = await Promise.resolve(store.getBodyMetricsRange(fromDate, toDate));

    const weightCard = document.createElement('div');
    weightCard.className = 'card account-card';
    const wt = document.createElement('h3');
    wt.textContent = `体重 (${activePeriod}日)`;
    weightCard.append(wt, createSparkline({
      label: '体重',
      color: '#93c5fd',
      points: (rows || []).map((row) => ({ x: row.date, y: row.weight_kg })),
    }));

    const fatCard = document.createElement('div');
    fatCard.className = 'card account-card';
    const ft = document.createElement('h3');
    ft.textContent = `体脂肪率 (${activePeriod}日)`;
    fatCard.append(ft, createSparkline({
      label: '体脂肪率',
      color: '#fca5a5',
      points: (rows || []).map((row) => ({ x: row.date, y: row.body_fat_pct })),
    }));

    chartSlot.append(weightCard, fatCard);
  };

  PERIODS.forEach((period) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = `tab ${period === activePeriod ? 'is-active' : ''}`.trim();
    tab.textContent = `${period}日`;
    tab.addEventListener('click', () => {
      controls.querySelectorAll('.tab').forEach((el) => el.classList.remove('is-active'));
      tab.classList.add('is-active');
      activePeriod = period;
      renderCharts();
    });
    controls.append(tab);
  });

  const form = createMetricForm({
    store,
    playSfx,
    onSaved: () => renderCharts(),
  });

  await renderCharts();
  panel.append(controls, chartSlot, form);
  return panel;
};

const createDayDetail = async ({ store, dateKey, navigate, playSfx, filterState }) => {
  const card = document.createElement('div');
  card.className = 'card account-card';

  const title = document.createElement('h3');
  title.textContent = `${dateKey} のトレーニング`;

  const actions = document.createElement('div');
  actions.className = 'hero__actions';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'ghost';
  prev.textContent = '前日';
  prev.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate(`#/history/${toDateKey(toTimestamp(dateKey) - 86400000)}`);
  });

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'ghost';
  next.textContent = '翌日';
  next.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate(`#/history/${toDateKey(toTimestamp(dateKey) + 86400000)}`);
  });

  actions.append(prev, next);

  const list = document.createElement('div');
  list.className = 'stack';
  const runs = filterRuns(await Promise.resolve(store.getWorkoutsByDate(dateKey)), filterState);
  if (!runs.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'この日のトレーニングはありません。';
    list.append(empty);
  } else {
    runs.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'card stack';
      const name = document.createElement('p');
      name.textContent = `${entry.exerciseSlug || entry.questId || 'workout'}`;
      const meta = document.createElement('p');
      meta.className = 'muted';
      const tags = getRunTags(entry);
      const category = HISTORY_CATEGORY_LABELS[tags.category] || HISTORY_CATEGORY_LABELS.unknown;
      const muscles = tags.muscles.map(toMuscleLabel).join('・') || '未設定';
      meta.textContent = `${entry.calories || 0} kcal / ${entry.points || 0} pt / ${category} / ${muscles}`;
      row.append(name, meta);
      list.append(row);
    });
  }

  card.append(title, actions, list);
  return card;
};

const createCalendarPanel = async ({ store, navigate, playSfx, selectedDate }) => {
  const panel = document.createElement('div');
  panel.className = 'stack';

  let cursor = {
    year: new Date(toTimestamp(selectedDate)).getFullYear(),
    month: new Date(toTimestamp(selectedDate)).getMonth() + 1,
  };
  let activeDate = selectedDate;
  let filterState = { ...defaultHistoryFilter };

  const headerCard = document.createElement('div');
  headerCard.className = 'card account-card';
  const headActions = document.createElement('div');
  headActions.className = 'hero__actions';
  const monthLabel = document.createElement('strong');

  const prevMonth = document.createElement('button');
  prevMonth.type = 'button';
  prevMonth.className = 'ghost';
  prevMonth.textContent = '← 前月';

  const nextMonth = document.createElement('button');
  nextMonth.type = 'button';
  nextMonth.className = 'ghost';
  nextMonth.textContent = '次月 →';

  headActions.append(prevMonth, monthLabel, nextMonth);
  headerCard.append(headActions);

  const gridSlot = document.createElement('div');
  const detailSlot = document.createElement('div');

  const renderMonth = async () => {
    monthLabel.textContent = formatMonthLabel(cursor.year, cursor.month);
    const monthPrefix = `${cursor.year}-${String(cursor.month).padStart(2, '0')}-`;
    const monthRuns = (store.getHistory() || []).filter((entry) => {
      const source = entry?.timestamp || entry?.result?.timestamp || entry?.created_at || entry?.published_at || null;
      if (!source) return false;
      const key = toDateKey(source);
      return key.startsWith(monthPrefix);
    });
    const workoutDates = new Set(filterRuns(monthRuns, filterState).map((entry) => toDateKey(entry?.timestamp || entry?.result?.timestamp || entry?.created_at || entry?.published_at)));
    gridSlot.innerHTML = '';
    gridSlot.append(createMonthGrid({
      year: cursor.year,
      month: cursor.month,
      activeDate,
      workoutDates,
      onSelectDate: (dateKey) => {
        playSfx('ui:select');
        navigate(`#/history/${dateKey}`);
      },
    }));
  };

  const renderDetail = async () => {
    detailSlot.innerHTML = '';
    detailSlot.append(await createDayDetail({ store, dateKey: activeDate, navigate, playSfx, filterState }));
  };

  prevMonth.addEventListener('click', () => {
    cursor = shiftMonth(cursor, -1);
    renderMonth();
  });

  nextMonth.addEventListener('click', () => {
    cursor = shiftMonth(cursor, 1);
    renderMonth();
  });

  const filterSlot = document.createElement('div');
  const renderFilter = () => {
    filterSlot.innerHTML = '';
    filterSlot.append(createHistoryFilterControls({
      state: filterState,
      onChange: (nextState) => {
        filterState = { ...nextState };
        renderMonth();
        renderDetail();
      },
    }));
  };

  await Promise.all([renderMonth(), renderDetail()]);
  renderFilter();
  panel.append(filterSlot, headerCard, gridSlot, detailSlot);
  return panel;
};

const createTabButton = (label, active, onClick) => {
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = `tab ${active ? 'is-active' : ''}`.trim();
  tab.textContent = label;
  tab.addEventListener('click', onClick);
  return tab;
};

const renderHistoryScreen = async ({ navigate, store, playSfx, selectedDate = toDateKey(Date.now()), initialTab = 'metrics' }) => {
  const section = document.createElement('section');
  section.className = 'stack account-view';

  const head = document.createElement('div');
  head.className = 'list-header account-header';
  const title = document.createElement('h2');
  title.textContent = '履歴';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = '← アカウント';
  back.addEventListener('click', () => navigate('#/account'));
  head.append(title, back);

  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  const panel = document.createElement('div');
  panel.className = 'stack';

  let activeTab = initialTab;
  const renderPanel = async () => {
    panel.innerHTML = '';
    if (activeTab === 'metrics') {
      panel.append(await createBodyMetricsPanel({ store, playSfx }));
    } else {
      panel.append(await createCalendarPanel({ store, navigate, playSfx, selectedDate }));
    }
  };

  const metricsTab = createTabButton('体重・体脂肪', activeTab === 'metrics', async () => {
    activeTab = 'metrics';
    tabs.querySelectorAll('.tab').forEach((el) => el.classList.remove('is-active'));
    metricsTab.classList.add('is-active');
    await renderPanel();
  });

  const calendarTab = createTabButton('カレンダー', activeTab === 'calendar', async () => {
    activeTab = 'calendar';
    tabs.querySelectorAll('.tab').forEach((el) => el.classList.remove('is-active'));
    calendarTab.classList.add('is-active');
    await renderPanel();
  });

  tabs.append(metricsTab, calendarTab);
  await renderPanel();

  section.append(head, tabs, panel);
  return section;
};

export const renderHistory = async (_params, context) => renderHistoryScreen({ ...context, initialTab: 'metrics' });

export const renderHistoryDay = async (params, context) => renderHistoryScreen({
  ...context,
  selectedDate: params?.date || toDateKey(Date.now()),
  initialTab: 'calendar',
});
