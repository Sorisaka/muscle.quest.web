import { toDateKey, toTimestamp } from '../lib/dateKey.js';
import { createSparkline } from '../ui/chart/sparkline.js';
import { createMonthGrid } from '../ui/calendar/monthGrid.js';
import { defaultHistoryFilter, filterRuns, getRunTags } from '../core/historyFilters.js';
import { createHistoryFilterControls, HISTORY_CATEGORY_LABELS, toMuscleLabel } from '../ui/historyFilterControls.js';

const PERIODS = [7, 30, 90, 180];

const formatMonthLabel = (year, month) => `${year}年${month}月`;
const formatMetric = (value, unit) => (value == null ? '-' : `${Number(value).toFixed(1)}${unit}`);

const shiftMonth = ({ year, month }, delta) => {
  const next = new Date(year, month - 1 + delta, 1);
  return { year: next.getFullYear(), month: next.getMonth() + 1 };
};

const createEmpty = (text) => {
  const p = document.createElement('p');
  p.className = 'muted';
  p.textContent = text;
  return p;
};

const toInputValue = (value) => (value == null ? '' : String(value));

const createMetricEditor = ({
  title = '計測を編集',
  description = '',
  initialDate = toDateKey(Date.now()),
  initialWeight = null,
  initialBodyFat = null,
  submitLabel = '保存',
  showDelete = false,
  onSubmit,
  onDelete,
  onCancel,
}) => {
  const wrap = document.createElement('div');
  wrap.className = 'card stack';

  const heading = document.createElement('h3');
  heading.textContent = title;

  const sub = document.createElement('p');
  sub.className = 'muted';
  sub.textContent = description;

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = initialDate;

  const weightInput = document.createElement('input');
  weightInput.type = 'number';
  weightInput.step = '0.1';
  weightInput.placeholder = '体重(kg)';
  weightInput.value = toInputValue(initialWeight);

  const fatInput = document.createElement('input');
  fatInput.type = 'number';
  fatInput.step = '0.1';
  fatInput.placeholder = '体脂肪率(%)';
  fatInput.value = toInputValue(initialBodyFat);

  const error = document.createElement('p');
  error.className = 'muted';

  const setBusy = (busy) => {
    dateInput.disabled = busy;
    weightInput.disabled = busy;
    fatInput.disabled = busy;
    submitBtn.disabled = busy;
    cancelBtn.disabled = busy;
    if (deleteBtn) deleteBtn.disabled = busy;
  };

  let deleteBtn = null;
  const actions = document.createElement('div');
  actions.className = 'hero__actions';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.textContent = submitLabel;

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'ghost';
  cancelBtn.textContent = '閉じる';

  submitBtn.addEventListener('click', async () => {
    if (!dateInput.value) {
      error.textContent = '日付を入力してください。';
      return;
    }
    const weight = weightInput.value === '' ? null : Number(weightInput.value);
    const bodyFat = fatInput.value === '' ? null : Number(fatInput.value);

    if (weight == null && bodyFat == null) {
      error.textContent = '体重または体脂肪率のどちらかは入力してください。';
      return;
    }

    error.textContent = '';
    setBusy(true);
    try {
      await onSubmit?.({ date: dateInput.value, weight_kg: weight, body_fat_pct: bodyFat });
    } catch (submitError) {
      error.textContent = submitError?.message || '保存に失敗しました。';
    } finally {
      setBusy(false);
    }
  });

  cancelBtn.addEventListener('click', () => onCancel?.());

  actions.append(submitBtn, cancelBtn);

  if (showDelete) {
    deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'ghost';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('この計測を削除しますか？')) return;
      setBusy(true);
      try {
        await onDelete?.(dateInput.value);
      } catch (deleteError) {
        error.textContent = deleteError?.message || '削除に失敗しました。';
      } finally {
        setBusy(false);
      }
    });
    actions.append(deleteBtn);
  }

  wrap.append(heading);
  if (description) wrap.append(sub);
  wrap.append(dateInput, weightInput, fatInput, error, actions);
  return wrap;
};

const createBodyMetricsPanel = async ({ store, playSfx, onMetricsChanged }) => {
  const panel = document.createElement('div');
  panel.className = 'stack';

  let activePeriod = 30;
  let addExpanded = false;
  let editTarget = null;
  let activeDateKey = null;

  let metricsRows = [];
  let rowsByDate = new Map();

  const setAddToggleLabel = () => {
    addToggle.textContent = addExpanded ? '追加フォームを閉じる' : '計測を追加';
  };

  const refreshMetrics = async () => {
    metricsRows = await Promise.resolve(store.getBodyMetricsRange(null, null)) || [];
    rowsByDate = new Map(metricsRows.map((row) => [row.date, row]));
  };

  await refreshMetrics();

  const addToggle = document.createElement('button');
  addToggle.type = 'button';
  addToggle.textContent = '計測を追加';

  const addSlot = document.createElement('div');
  const controls = document.createElement('div');
  controls.className = 'tabs';
  const tooltip = document.createElement('div');
  tooltip.className = 'card';
  const chartSlot = document.createElement('div');
  chartSlot.className = 'stack';

  const defaultTooltip = () => {
    tooltip.innerHTML = '';
    tooltip.append(createEmpty('点をタップ/クリックすると、その日の体重・体脂肪率を編集できます。'));
  };

  const showTooltipForDate = (dateKey) => {
    if (!dateKey) {
      defaultTooltip();
      return;
    }
    const row = rowsByDate.get(dateKey) || null;
    tooltip.innerHTML = '';
    const dateEl = document.createElement('strong');
    dateEl.textContent = dateKey;
    const detail = document.createElement('p');
    detail.className = 'muted';
    detail.textContent = `体重: ${formatMetric(row?.weight_kg, 'kg')} / 体脂肪率: ${formatMetric(row?.body_fat_pct, '%')}`;
    tooltip.append(dateEl, detail);
  };

  const openEdit = (dateKey) => {
    activeDateKey = dateKey;
    addExpanded = false;
    setAddToggleLabel();
    editTarget = rowsByDate.get(dateKey) || { date: dateKey, weight_kg: null, body_fat_pct: null };
    showTooltipForDate(dateKey);
    renderCharts();
    renderEditors();
  };

  const weightChart = createSparkline({
    label: '体重',
    color: '#93c5fd',
    yUnit: 'kg',
    points: (metricsRows || []).map((row) => ({ x: row.date, y: row.weight_kg })).filter((row) => row.y != null),
    visibleDays: activePeriod,
    onPointHover: ({ dateKey }) => {
      activeDateKey = dateKey;
      showTooltipForDate(dateKey);
      if (!editTarget) renderCharts();
    },
    onPointLeave: () => {},
    onPointSelect: ({ dateKey }) => openEdit(dateKey),
  });

  const fatChart = createSparkline({
    label: '体脂肪率',
    color: '#fca5a5',
    yUnit: '%',
    points: (metricsRows || []).map((row) => ({ x: row.date, y: row.body_fat_pct })).filter((row) => row.y != null),
    visibleDays: activePeriod,
    onPointHover: ({ dateKey }) => {
      activeDateKey = dateKey;
      showTooltipForDate(dateKey);
      if (!editTarget) renderCharts();
    },
    onPointLeave: () => {},
    onPointSelect: ({ dateKey }) => openEdit(dateKey),
  });

  const renderCharts = () => {
    weightTitle.textContent = `体重 (${activePeriod}日)`;
    fatTitle.textContent = `体脂肪率 (${activePeriod}日)`;
    weightChart.updateSparkline({
      visibleDays: activePeriod,
      activeDateKey,
      points: (metricsRows || []).map((row) => ({ x: row.date, y: row.weight_kg })).filter((row) => row.y != null),
    });

    fatChart.updateSparkline({
      visibleDays: activePeriod,
      activeDateKey,
      points: (metricsRows || []).map((row) => ({ x: row.date, y: row.body_fat_pct })).filter((row) => row.y != null),
    });
  };

  const saveMetric = async ({ originalDate, date, weight_kg, body_fat_pct }) => {
    playSfx('ui:select');
    const trimmedDate = String(date || '').trim();
    if (!trimmedDate) throw new Error('日付を入力してください。');
    if (originalDate && originalDate !== trimmedDate && rowsByDate.has(trimmedDate)) {
      const ok = confirm(`${trimmedDate} には既存データがあります。上書きしますか？`);
      if (!ok) return;
    }
    if (originalDate && originalDate !== trimmedDate) {
      await Promise.resolve(store.deleteBodyMetric(originalDate));
    }
    await Promise.resolve(store.upsertBodyMetric(trimmedDate, {
      weight_kg,
      body_fat_pct,
      visibility: 'private',
    }));
    activeDateKey = trimmedDate;
    editTarget = null;
    addExpanded = false;
    setAddToggleLabel();
    await refreshMetrics();
    showTooltipForDate(activeDateKey);
    renderCharts();
    renderEditors();
    await onMetricsChanged?.();
  };

  const deleteMetric = async (date) => {
    playSfx('ui:select');
    await Promise.resolve(store.deleteBodyMetric(date));
    if (activeDateKey === date) activeDateKey = null;
    editTarget = null;
    addExpanded = false;
    setAddToggleLabel();
    await refreshMetrics();
    showTooltipForDate(activeDateKey);
    renderCharts();
    renderEditors();
    await onMetricsChanged?.();
  };

  const renderEditors = () => {
    addSlot.innerHTML = '';
    if (editTarget) {
      addSlot.append(createMetricEditor({
        title: `${editTarget.date} の計測を編集`,
        description: '既存の計測データを更新または削除できます。',
        initialDate: editTarget.date,
        initialWeight: editTarget.weight_kg,
        initialBodyFat: editTarget.body_fat_pct,
        submitLabel: '更新',
        showDelete: true,
        onSubmit: async (payload) => saveMetric({ ...payload, originalDate: editTarget.date }),
        onDelete: async (date) => deleteMetric(date),
        onCancel: () => {
          editTarget = null;
          renderEditors();
        },
      }));
      return;
    }

    if (!addExpanded) return;

    addSlot.append(createMetricEditor({
      title: '計測を追加',
      description: '新しい日付の体重・体脂肪率を記録します。',
      submitLabel: '保存',
      onSubmit: async (payload) => saveMetric(payload),
      onCancel: () => {
        addExpanded = false;
        setAddToggleLabel();
        renderEditors();
      },
    }));
  };

  addToggle.addEventListener('click', () => {
    addExpanded = !addExpanded;
    editTarget = null;
    setAddToggleLabel();
    renderEditors();
  });

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
  const weightCard = document.createElement('div');
  weightCard.className = 'card account-card';
  const weightTitle = document.createElement('h3');
  weightCard.append(weightTitle, weightChart);

  const fatCard = document.createElement('div');
  fatCard.className = 'card account-card';
  const fatTitle = document.createElement('h3');
  fatCard.append(fatTitle, fatChart);

  chartSlot.innerHTML = '';
  chartSlot.append(weightCard, fatCard);

  setAddToggleLabel();
  defaultTooltip();
  renderCharts();
  renderEditors();

  panel.append(addToggle, addSlot, controls, tooltip, chartSlot);
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
    list.append(createEmpty('この日のトレーニングはありません。'));
  } else {
    runs.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'row';
      const name = document.createElement('strong');
      name.textContent = entry.exerciseSlug || entry.questId || 'workout';
      const meta = document.createElement('span');
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
  let filterState = store.getHistoryFilter ? store.getHistoryFilter() : { ...defaultHistoryFilter };

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

    const workoutDates = new Set(filterRuns(monthRuns, filterState)
      .map((entry) => toDateKey(entry?.timestamp || entry?.result?.timestamp || entry?.created_at || entry?.published_at)));

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
        filterState = store.setHistoryFilter ? store.setHistoryFilter(nextState) : { ...nextState };
        renderFilter();
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

  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  const panel = document.createElement('div');
  panel.className = 'stack';

  let activeTab = initialTab;

  const renderPanel = async () => {
    panel.innerHTML = '';
    if (activeTab === 'metrics') {
      panel.append(await createBodyMetricsPanel({
        store,
        playSfx,
        onMetricsChanged: async () => {
          await renderPanel();
        },
      }));
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

  section.append(tabs, panel);
  return section;
};

export const renderHistory = async (_params, context) => renderHistoryScreen({ ...context, initialTab: 'metrics' });

export const renderHistoryDay = async (params, context) => renderHistoryScreen({
  ...context,
  selectedDate: params?.date || toDateKey(Date.now()),
  initialTab: 'calendar',
});
