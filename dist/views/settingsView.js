import {
  ICON_BACKGROUND_OPTIONS,
  ICON_BORDER_OPTIONS,
  ICON_CENTER_OBJECT_OPTIONS,
  normalizeIconConfig,
} from '../core/iconOptions.js';
import { createAccountAvatar, getAvatarLabel } from '../ui/accountAvatar.js';
import { quests } from '../core/content.js';
import { applyAutoProfileEstimation, estimateProfileMetrics } from '../core/calorie/estimateProfile.js';
import {
  MENU_WORKOUT_CATEGORY_LABELS,
  MENU_WORKOUT_MUSCLE_LABELS,
  buildMenuWorkoutCatalog,
  createUnknownMenuWorkout,
  sortMenuWorkouts,
} from '../core/menuWorkoutCatalog.js';
import {
  buildMenuWorkoutDefaultConfig,
  getMenuConfigShape,
  normalizeMenuItemConfig,
  normalizeMenuPlanItem,
  sanitizeMenuPlanItems,
} from '../core/menuPlanItem.js';

const SETTINGS_SECTIONS = [
  { key: 'account', label: 'アカウント設定', description: '表示名 / アイコン / 公開範囲' },
  { key: 'body-profile', label: '身体プロフィール設定', description: '身長・体重など' },
  { key: 'menu', label: 'メニュー設定', description: '曜日ごとのトレーニング計画' },
  { key: 'general', label: '一般設定', description: '通知や表示設定' },
];

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

const buildExerciseOptions = () => {
  const seen = new Set();
  (quests || []).forEach((quest) => {
    (quest.exercises || []).forEach((slug) => seen.add(slug));
  });
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
};

const findQuestByExercise = (exerciseSlug) => (quests || []).find((quest) => (quest.exercises || []).includes(exerciseSlug)) || null;

const createSelect = (label, value, options = [], mapper = (opt) => ({ value: opt, label: opt })) => {
  const wrap = document.createElement('label');
  wrap.className = 'field';
  const text = document.createElement('span');
  text.textContent = label;
  const select = document.createElement('select');
  options.forEach((opt) => {
    const mapped = mapper(opt);
    const o = document.createElement('option');
    o.value = mapped.value;
    o.textContent = mapped.label;
    if (mapped.value === value) o.selected = true;
    select.append(o);
  });
  wrap.append(text, select);
  return { wrap, select };
};

const createPlaceholder = (titleText, bodyText) => {
  const card = document.createElement('div');
  card.className = 'card stack';
  card.append(
    Object.assign(document.createElement('h3'), { textContent: titleText }),
    Object.assign(document.createElement('p'), { className: 'muted', textContent: bodyText }),
  );
  return card;
};

export const renderSettings = (_params, { navigate, playSfx }) => {
  const container = document.createElement('section');
  container.className = 'stack';

  const title = document.createElement('h2');
  title.textContent = '設定';

  const list = document.createElement('div');
  list.className = 'stack';
  SETTINGS_SECTIONS.forEach((section) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'row';
    row.innerHTML = `<span><strong>${section.label}</strong><p class="muted">${section.description}</p></span><span>→</span>`;
    row.addEventListener('click', () => {
      playSfx('ui:navigate');
      navigate(`#/settings/${section.key}`);
    });
    list.append(row);
  });

  container.append(title, list);
  return container;
};

const createAccountSettings = ({ store, playSfx, accountState }) => {
  const profile = store.getProfile() || {};
  const icon = normalizeIconConfig(profile);

  const card = document.createElement('div');
  card.className = 'card stack';

  const title = document.createElement('h3');
  title.textContent = 'アカウント設定';

  const previewWrap = document.createElement('div');
  previewWrap.className = 'list-account-row';
  const previewAvatarSlot = document.createElement('div');
  const previewName = document.createElement('strong');
  previewWrap.append(previewAvatarSlot, previewName);

  const nameField = document.createElement('label');
  nameField.className = 'field';
  const nameLabel = document.createElement('span');
  nameLabel.textContent = '表示名';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = profile.displayName || '';
  nameInput.placeholder = '表示名を入力';
  nameField.append(nameLabel, nameInput);

  const visField = createSelect('公開範囲', profile.account_visibility || profile.default_visibility || 'private', ['public', 'private']);
  const borderField = createSelect('外枠', icon.icon_border, ICON_BORDER_OPTIONS);
  const bgField = createSelect('背景色', icon.icon_background, ICON_BACKGROUND_OPTIONS);
  const centerField = createSelect('中心オブジェクト', icon.icon_center_object, ICON_CENTER_OBJECT_OPTIONS);

  const feedback = document.createElement('p');
  feedback.className = 'muted';

  const renderPreview = () => {
    const displayName = nameInput.value.trim() || 'ゲスト';
    const visibility = visField.select.value || 'private';
    previewAvatarSlot.innerHTML = '';
    previewAvatarSlot.append(createAccountAvatar({
      label: getAvatarLabel(displayName, 'G'),
      className: 'account-avatar--inline',
      icon: {
        icon_border: borderField.select.value,
        icon_background: bgField.select.value,
        icon_center_object: centerField.select.value,
      },
    }));
    previewName.textContent = visibility === 'private' ? `${displayName} 🔒` : displayName;
  };

  [nameInput, visField.select, borderField.select, bgField.select, centerField.select].forEach((el) => {
    el.addEventListener('input', renderPreview);
    el.addEventListener('change', renderPreview);
  });

  const save = document.createElement('button');
  save.type = 'button';
  save.textContent = '保存';
  save.addEventListener('click', async () => {
    save.disabled = true;
    playSfx('ui:select');

    const payload = {
      displayName: nameInput.value.trim() || 'ゲスト',
      account_visibility: visField.select.value,
      default_visibility: visField.select.value,
      icon_border: borderField.select.value,
      icon_background: bgField.select.value,
      icon_center_object: centerField.select.value,
    };

    try {
      if (accountState?.saveProfileSettings) await accountState.saveProfileSettings(payload);
      else await Promise.resolve(store.saveProfileSettings(payload));
      feedback.textContent = '保存しました。';
    } catch (_error) {
      feedback.textContent = '保存に失敗しました。';
    }
    save.disabled = false;
    renderPreview();
  });

  renderPreview();

  card.append(
    title,
    previewWrap,
    nameField,
    visField.wrap,
    borderField.wrap,
    bgField.wrap,
    centerField.wrap,
    save,
    feedback,
  );

  return card;
};



const createGeneralSettings = ({ store, playSfx }) => {
  const settings = store.getSettings ? store.getSettings() : {};

  const card = document.createElement('div');
  card.className = 'card stack';

  const title = document.createElement('h3');
  title.textContent = '一般設定';

  const hint = document.createElement('p');
  hint.className = 'muted';
  hint.textContent = '難易度や操作感など、専用カテゴリ外の共通設定をまとめています。';

  const difficultyField = createSelect('難易度', settings.difficulty || 'beginner', [
    { value: 'beginner', label: '初級' },
    { value: 'intermediate', label: '中級' },
    { value: 'advanced', label: '上級' },
  ], (opt) => opt);

  const sfxEnabledField = document.createElement('label');
  sfxEnabledField.className = 'field';
  sfxEnabledField.append(Object.assign(document.createElement('span'), { textContent: '効果音' }));
  const sfxEnabledInput = document.createElement('input');
  sfxEnabledInput.type = 'checkbox';
  sfxEnabledInput.checked = Boolean(settings.sfxEnabled);
  sfxEnabledField.append(sfxEnabledInput);

  const sfxVolumeField = document.createElement('label');
  sfxVolumeField.className = 'field';
  sfxVolumeField.append(Object.assign(document.createElement('span'), { textContent: '効果音ボリューム' }));
  const sfxVolumeInput = document.createElement('input');
  sfxVolumeInput.type = 'range';
  sfxVolumeInput.min = '0';
  sfxVolumeInput.max = '1';
  sfxVolumeInput.step = '0.05';
  sfxVolumeInput.value = String(typeof settings.sfxVolume === 'number' ? settings.sfxVolume : 0.6);
  const sfxVolumeText = document.createElement('strong');
  sfxVolumeText.textContent = `${Math.round(Number(sfxVolumeInput.value) * 100)}%`;
  sfxVolumeField.append(sfxVolumeInput, sfxVolumeText);

  const status = document.createElement('p');
  status.className = 'muted';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.textContent = '一般設定を保存';

  const applyPreview = () => {
    const volume = Math.max(0, Math.min(1, Number(sfxVolumeInput.value) || 0));
    sfxVolumeText.textContent = `${Math.round(volume * 100)}%`;
  };

  sfxVolumeInput.addEventListener('input', applyPreview);

  saveBtn.addEventListener('click', () => {
    playSfx('ui:select');
    const payload = {
      language: 'ja',
      difficulty: difficultyField.select.value,
      sfxEnabled: Boolean(sfxEnabledInput.checked),
      sfxVolume: Math.max(0, Math.min(1, Number(sfxVolumeInput.value) || 0)),
    };
    store.updateSettings(payload);
    status.textContent = '一般設定を保存しました。';
  });

  applyPreview();
  card.append(title, hint, difficultyField.wrap, sfxEnabledField, sfxVolumeField, saveBtn, status);
  return card;
};

const toFiniteNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toInputNumberText = (value, digits = 3) => {
  const num = toFiniteNumber(value);
  if (num == null) return '';
  return String(Number(num.toFixed(digits)));
};

const createBodyProfileSettings = ({ store, playSfx, accountState }) => {
  const profile = store.getProfile() || {};
  const card = document.createElement('div');
  card.className = 'card stack';

  const title = document.createElement('h3');
  title.textContent = '身体プロフィール設定';

  const modeTabs = document.createElement('div');
  modeTabs.className = 'tabs';

  const form = document.createElement('div');
  form.className = 'stack';

  const hint = document.createElement('p');
  hint.className = 'muted';

  const preview = document.createElement('div');
  preview.className = 'card stack';

  const status = document.createElement('p');
  status.className = 'muted';

  const actionRow = document.createElement('div');
  actionRow.className = 'hero__actions';
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.textContent = '身体プロフィールを保存';
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'ghost';
  resetBtn.textContent = '入力をリセット';
  actionRow.append(saveBtn, resetBtn);

  let editorMode = 'simple';

  const sexField = createSelect('性別', profile.sex || 'unknown', ['unknown', 'male', 'female'], (opt) => ({
    value: opt,
    label: opt === 'male' ? '男性' : opt === 'female' ? '女性' : '未設定',
  }));

  const heightField = document.createElement('label');
  heightField.className = 'field';
  heightField.append(Object.assign(document.createElement('span'), { textContent: '身長(cm)' }));
  const heightInput = document.createElement('input');
  heightInput.type = 'number';
  heightInput.min = '100';
  heightInput.max = '250';
  heightInput.step = '0.1';
  heightInput.value = toInputNumberText(profile.height_cm, 1);
  heightField.append(heightInput);

  const weightField = document.createElement('label');
  weightField.className = 'field';
  weightField.append(Object.assign(document.createElement('span'), { textContent: '体重(kg)' }));
  const weightInput = document.createElement('input');
  weightInput.type = 'number';
  weightInput.min = '20';
  weightInput.max = '300';
  weightInput.step = '0.1';
  weightInput.value = toInputNumberText(profile.weight_kg, 1);
  weightField.append(weightInput);

  const metricDefs = [
    { key: 'step_length_m', label: '歩幅(m)' },
    { key: 'arm_length_m', label: '腕長(m)' },
    { key: 'leg_length_m', label: '脚長(m)' },
    { key: 'torso_length_m', label: '胴体長(m)' },
  ];

  const advancedFields = metricDefs.map((def) => {
    const wrap = document.createElement('div');
    wrap.className = 'card stack';

    const modeField = createSelect(`${def.label}モード`, profile[`${def.key}_mode`] || 'auto', ['auto', 'manual'], (opt) => ({
      value: opt,
      label: opt === 'manual' ? '手動' : '自動推定',
    }));

    const valueField = document.createElement('label');
    valueField.className = 'field';
    valueField.append(Object.assign(document.createElement('span'), { textContent: def.label }));
    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.step = '0.001';
    valueInput.min = '0.2';
    valueInput.max = '2.0';
    valueInput.value = toInputNumberText(profile[def.key], 3);
    valueField.append(valueInput);

    wrap.append(modeField.wrap, valueField);
    return { ...def, wrap, modeField, valueInput };
  });

  const collectDraft = () => ({
    sex: sexField.select.value,
    height_cm: toFiniteNumber(heightInput.value),
    weight_kg: toFiniteNumber(weightInput.value),
    ...advancedFields.reduce((acc, field) => {
      acc[field.key] = toFiniteNumber(field.valueInput.value);
      acc[`${field.key}_mode`] = field.modeField.select.value;
      return acc;
    }, {}),
  });

  const applyDraft = (draft = {}) => {
    sexField.select.value = draft.sex || 'unknown';
    heightInput.value = toInputNumberText(draft.height_cm, 1);
    weightInput.value = toInputNumberText(draft.weight_kg, 1);
    advancedFields.forEach((field) => {
      field.modeField.select.value = draft[`${field.key}_mode`] || 'auto';
      field.valueInput.value = toInputNumberText(draft[field.key], 3);
    });
  };

  const updatePreview = () => {
    const draft = collectDraft();
    const estimatedSummary = estimateProfileMetrics(draft);
    const autoApplied = applyAutoProfileEstimation(draft, profile);

    advancedFields.forEach((field) => {
      const isManual = editorMode === 'advance' && field.modeField.select.value === 'manual';
      field.valueInput.disabled = !isManual;
      if (!isManual && autoApplied[field.key] != null) {
        field.valueInput.value = toInputNumberText(autoApplied[field.key], 3);
      }
    });

    preview.innerHTML = '';
    const pTitle = document.createElement('strong');
    pTitle.textContent = '保存前プレビュー';
    const pHint = document.createElement('p');
    pHint.className = 'muted';
    pHint.textContent = editorMode === 'simple'
      ? 'シンプル: 身長・体重・性別から各寸法を自動推定して保存します。'
      : '詳細: 各寸法を自動推定しつつ、手動を選んだ項目のみ上書きできます。';

    const summary = document.createElement('div');
    summary.className = 'stack';
    const items = [
      `性別: ${autoApplied.sex || 'unknown'}`,
      `身長: ${autoApplied.height_cm ?? '-'} cm`,
      `体重: ${autoApplied.weight_kg ?? '-'} kg`,
      ...metricDefs.map((field) => {
        const modeKey = `${field.key}_mode`;
        const currentMode = editorMode === 'simple' ? 'auto' : (autoApplied[modeKey] || 'auto');
        const value = autoApplied[field.key] == null ? '-' : `${Number(autoApplied[field.key]).toFixed(3)} m`;
        const autoValue = estimatedSummary.estimated?.[field.key];
        const autoText = autoValue == null ? '-' : `${Number(autoValue).toFixed(3)} m`;
        return `${field.label}: ${value} (${currentMode === 'manual' ? '手動' : `自動推定 ${autoText}`})`;
      }),
    ];

    items.forEach((text) => {
      const line = document.createElement('p');
      line.className = 'muted';
      line.textContent = text;
      summary.append(line);
    });

    preview.append(pTitle, pHint, summary);
  };

  const renderModeTabs = () => {
    modeTabs.innerHTML = '';
    [
      { key: 'simple', label: 'シンプル' },
      { key: 'advance', label: '詳細' },
    ].forEach((entry) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `tab ${editorMode === entry.key ? 'is-active' : ''}`.trim();
      tab.textContent = entry.label;
      tab.addEventListener('click', () => {
        editorMode = entry.key;
        renderModeTabs();
        renderForm();
        updatePreview();
      });
      modeTabs.append(tab);
    });
  };

  const renderForm = () => {
    form.innerHTML = '';
    form.append(sexField.wrap, heightField, weightField);
    if (editorMode === 'advance') {
      const advancedTitle = document.createElement('strong');
      advancedTitle.textContent = '追加パラメータ（詳細モード）';
      form.append(advancedTitle, ...advancedFields.map((field) => field.wrap));
    }

    hint.textContent = editorMode === 'simple'
      ? 'シンプルは最小入力で自動推定を利用するモードです。'
      : '詳細は推定値を初期値として、必要項目のみ手動上書きするモードです。';
  };

  const validate = () => {
    const height = toFiniteNumber(heightInput.value);
    const weight = toFiniteNumber(weightInput.value);
    if (height == null || height < 100 || height > 250) return '身長は 100〜250cm の範囲で入力してください。';
    if (weight == null || weight < 20 || weight > 300) return '体重は 20〜300kg の範囲で入力してください。';

    if (editorMode === 'advance') {
      for (const field of advancedFields) {
        if (field.modeField.select.value !== 'manual') continue;
        const value = toFiniteNumber(field.valueInput.value);
        if (value == null || value < 0.2 || value > 2.0) {
          return `${field.label}は 0.2〜2.0m の範囲で入力してください。`;
        }
      }
    }
    return null;
  };

  const buildPayload = () => {
    const draft = collectDraft();
    const nextBase = {
      ...profile,
      sex: draft.sex,
      height_cm: draft.height_cm,
      weight_kg: draft.weight_kg,
    };

    if (editorMode === 'simple') {
      const autoProfile = applyAutoProfileEstimation({
        ...nextBase,
        step_length_m_mode: 'auto',
        arm_length_m_mode: 'auto',
        leg_length_m_mode: 'auto',
        torso_length_m_mode: 'auto',
      }, profile);
      return autoProfile;
    }

    const autoProfile = applyAutoProfileEstimation({
      ...nextBase,
      ...advancedFields.reduce((acc, field) => {
        acc[`${field.key}_mode`] = field.modeField.select.value;
        if (field.modeField.select.value === 'manual') {
          acc[field.key] = toFiniteNumber(field.valueInput.value);
        } else {
          acc[field.key] = null;
        }
        return acc;
      }, {}),
    }, profile);

    return autoProfile;
  };

  saveBtn.addEventListener('click', async () => {
    playSfx('ui:select');
    const error = validate();
    if (error) {
      status.textContent = error;
      return;
    }

    saveBtn.disabled = true;
    try {
      const payload = buildPayload();
      if (accountState?.saveProfileSettings) await accountState.saveProfileSettings(payload);
      else await Promise.resolve(store.saveProfileSettings(payload));
      status.textContent = '身体プロフィールを保存しました。';
    } catch (_error) {
      status.textContent = '保存に失敗しました。';
    }
    saveBtn.disabled = false;
    updatePreview();
  });

  resetBtn.addEventListener('click', () => {
    applyDraft(profile);
    updatePreview();
    status.textContent = '入力をリセットしました。';
  });

  [sexField.select, heightInput, weightInput, ...advancedFields.flatMap((field) => [field.modeField.select, field.valueInput])]
    .forEach((el) => {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    });

  renderModeTabs();
  renderForm();
  updatePreview();

  card.append(title, hint, modeTabs, form, preview, actionRow, status);
  return card;
};

const normalizeMenuItem = (item = {}, index = 0, options = {}) => normalizeMenuPlanItem(item, index, {
  ...options,
  findQuestByExercise,
  quests,
});

const sanitizeMenuItems = (items = [], options = {}) => sanitizeMenuPlanItems(items, {
  ...options,
  findQuestByExercise,
  quests,
});

const parseInputNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : null;
};

const createMenuSettings = async ({ store, playSfx }) => {
  const card = document.createElement('div');
  card.className = 'card stack';

  const title = document.createElement('h3');
  title.textContent = 'メニュー設定';

  const workoutCatalogState = buildMenuWorkoutCatalog({ findQuestByExercise });
  const workoutCatalog = workoutCatalogState.workouts;
  const workoutMap = workoutCatalogState.workoutMap;
  const difficulty = store.getSettings?.().difficulty || 'beginner';

  const userId = store.getProfile()?.id || 'local-user';
  const loadedWeekly = await Promise.resolve(store.loadWeeklyPlan(userId));
  const weeklyPlan = { ...(loadedWeekly || {}) };
  const specialPlanCache = {};

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySpecial = await Promise.resolve(store.loadSpecialPlan(userId, todayKey));
  specialPlanCache[todayKey] = sanitizeMenuItems(todaySpecial || [], { workoutMap, difficulty });

  let mode = 'weekly';
  let selectedWeekday = new Date().getDay();
  let selectedDate = todayKey;
  let draftItems = sanitizeMenuItems(weeklyPlan[String(selectedWeekday)] || [], { workoutMap, difficulty });
  let dirty = false;

  const status = document.createElement('p');
  status.className = 'muted';

  const hint = document.createElement('p');
  hint.className = 'muted';

  const modeTabs = document.createElement('div');
  modeTabs.className = 'tabs';

  const contextSlot = document.createElement('div');
  contextSlot.className = 'stack';

  const weekdayTabs = document.createElement('div');
  weekdayTabs.className = 'tabs';

  const dateField = document.createElement('label');
  dateField.className = 'field';
  dateField.append(Object.assign(document.createElement('span'), { textContent: '特別日' }));
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = selectedDate;
  dateField.append(dateInput);

  const list = document.createElement('div');
  list.className = 'stack';

  const actionRow = document.createElement('div');
  actionRow.className = 'hero__actions';
  const selectWorkoutBtn = document.createElement('button');
  selectWorkoutBtn.type = 'button';
  selectWorkoutBtn.textContent = 'ワークアウト選択';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'ghost';
  resetBtn.textContent = '変更を破棄';

  const deleteSpecialBtn = document.createElement('button');
  deleteSpecialBtn.type = 'button';
  deleteSpecialBtn.className = 'ghost';
  deleteSpecialBtn.textContent = '特別日メニューを削除';

  actionRow.append(selectWorkoutBtn, saveBtn, resetBtn, deleteSpecialBtn);

  const categoryFilterField = createSelect('カテゴリー', 'all', [
    { value: 'all', label: '未選択' },
    { value: 'cardio', label: '有酸素' },
    { value: 'bodyweight', label: '自重' },
    { value: 'weights', label: 'ウエイト' },
  ], (opt) => opt);

  const muscleFilterField = createSelect(
    '部位',
    'all',
    [{ value: 'all', label: '未選択' }, ...workoutCatalogState.muscleOptions],
    (opt) => opt,
  );

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'workout-picker-overlay';
  modalOverlay.hidden = true;

  const modal = document.createElement('div');
  modal.className = 'workout-picker-modal card stack';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'workout-picker-title');

  const modalHeader = document.createElement('div');
  modalHeader.className = 'list-header';
  const modalTitle = document.createElement('h3');
  modalTitle.id = 'workout-picker-title';
  modalTitle.textContent = 'ワークアウト選択';
  const modalCount = document.createElement('p');
  modalCount.className = 'muted';
  const modalCloseBtn = document.createElement('button');
  modalCloseBtn.type = 'button';
  modalCloseBtn.className = 'ghost';
  modalCloseBtn.textContent = '✕';
  modalHeader.append(modalTitle, modalCloseBtn);

  const filterGrid = document.createElement('div');
  filterGrid.className = 'workout-picker-filters';
  filterGrid.append(categoryFilterField.wrap, muscleFilterField.wrap);

  const modalList = document.createElement('div');
  modalList.className = 'workout-picker-list';

  const modalActions = document.createElement('div');
  modalActions.className = 'hero__actions';
  const modalCancelBtn = document.createElement('button');
  modalCancelBtn.type = 'button';
  modalCancelBtn.className = 'ghost';
  modalCancelBtn.textContent = 'キャンセル';
  const modalSelectBtn = document.createElement('button');
  modalSelectBtn.type = 'button';
  modalSelectBtn.textContent = '選択';
  modalActions.append(modalCancelBtn, modalSelectBtn);

  modal.append(modalHeader, modalCount, filterGrid, modalList, modalActions);
  modalOverlay.append(modal);

  let modalSelection = [];

  const getModeLabel = () => (mode === 'weekly' ? `${WEEKDAY_LABELS[selectedWeekday]}曜日` : selectedDate);

  const updateHint = () => {
    if (mode === 'weekly') {
      hint.textContent = todaySpecial?.length
        ? `特別日メニュー（${todayKey}）が設定済みのため、ホームの当日TODOはそちらが優先されます。`
        : '週間メニューは、特別日メニューが無い日にホームの当日TODOへ反映されます。';
      saveBtn.textContent = '曜日メニューを保存';
      deleteSpecialBtn.hidden = true;
      return;
    }
    hint.textContent = '特別日メニューは指定日だけ週間メニューより優先されます。';
    saveBtn.textContent = '特別日メニューを保存';
    deleteSpecialBtn.hidden = false;
  };

  const setDirty = (value) => {
    dirty = Boolean(value);
    status.textContent = dirty ? '未保存の変更があります。' : `${getModeLabel()}のメニューは保存済みです。`;
  };

  const loadSpecialDraft = async (dateKey) => {
    if (!dateKey) return [];
    if (!Object.prototype.hasOwnProperty.call(specialPlanCache, dateKey)) {
      const loaded = await Promise.resolve(store.loadSpecialPlan(userId, dateKey));
      specialPlanCache[dateKey] = sanitizeMenuItems(loaded || [], { workoutMap, difficulty });
    }
    return sanitizeMenuItems(specialPlanCache[dateKey] || [], { workoutMap, difficulty });
  };

  const syncDraft = async () => {
    if (mode === 'weekly') {
      draftItems = sanitizeMenuItems(weeklyPlan[String(selectedWeekday)] || [], { workoutMap, difficulty });
    } else {
      draftItems = await loadSpecialDraft(selectedDate);
    }
    setDirty(false);
  };

  const renderModeTabs = () => {
    modeTabs.innerHTML = '';
    [
      { key: 'weekly', label: '曜日メニュー' },
      { key: 'special', label: '特別日メニュー' },
    ].forEach((entry) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `tab ${mode === entry.key ? 'is-active' : ''}`.trim();
      tab.textContent = entry.label;
      tab.addEventListener('click', async () => {
        if (mode === entry.key) return;
        if (dirty && !confirm('未保存の変更があります。切り替えますか？')) return;
        mode = entry.key;
        await syncDraft();
        updateHint();
        renderModeTabs();
        renderContext();
        renderList();
      });
      modeTabs.append(tab);
    });
  };

  const renderWeekdayTabs = () => {
    weekdayTabs.innerHTML = '';
    WEEKDAY_LABELS.forEach((label, weekday) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `tab ${weekday === selectedWeekday ? 'is-active' : ''}`.trim();
      tab.textContent = `${label}曜`;
      tab.addEventListener('click', async () => {
        if (weekday === selectedWeekday) return;
        if (dirty && !confirm('未保存の変更があります。曜日を切り替えますか？')) return;
        selectedWeekday = weekday;
        await syncDraft();
        renderWeekdayTabs();
        renderList();
      });
      weekdayTabs.append(tab);
    });
  };

  const renderContext = () => {
    contextSlot.innerHTML = '';
    if (mode === 'weekly') {
      renderWeekdayTabs();
      contextSlot.append(weekdayTabs);
      return;
    }
    contextSlot.append(dateField);
  };

  const moveItem = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= draftItems.length) return;
    const next = draftItems.slice();
    const [picked] = next.splice(index, 1);
    next.splice(target, 0, picked);
    draftItems = next;
    setDirty(true);
    renderList();
  };

  const updateItem = (index, patch = {}) => {
    draftItems = draftItems.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    setDirty(true);
  };

  const updateWorkoutConfig = (index, patch = {}) => {
    draftItems = draftItems.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const workoutEntry = workoutMap.get(item.exerciseSlug);
      const nextConfig = normalizeMenuItemConfig(
        { ...(item.config || item.workoutConfig || {}), ...patch },
        item.config || item.workoutConfig || {},
        { definition: workoutEntry?.definition, lockInputModeToDefinition: false },
      );
      return {
        ...item,
        config: nextConfig,
        workoutConfig: nextConfig,
      };
    });
    setDirty(true);
  };

  const resolveAvailableWorkoutList = () => {
    const unknownEntries = draftItems
      .filter((item) => item.exerciseSlug && !workoutMap.has(item.exerciseSlug))
      .map((item) => createUnknownMenuWorkout({
        slug: item.exerciseSlug,
        label: item.defaultLabel || item.workoutLabel || item.exerciseSlug || '不明なワークアウト',
        muscles: item.muscles,
      }));
    const dedup = new Map([...workoutCatalog, ...unknownEntries].map((entry) => [entry.slug, entry]));
    return sortMenuWorkouts(Array.from(dedup.values()));
  };

  const applySelection = (selectedSlugs = []) => {
    const existingBySlug = new Map(draftItems.filter((item) => item.exerciseSlug).map((item) => [item.exerciseSlug, item]));
    draftItems = selectedSlugs.map((slug, index) => {
      const existing = existingBySlug.get(slug);
      if (existing) {
        return normalizeMenuItem(existing, index, { workoutMap, difficulty });
      }
      const workoutEntry = workoutMap.get(slug);
      return normalizeMenuItem({
        displayName: '',
        title: '',
        exerciseSlug: slug,
        questId: workoutEntry?.quest?.id || '',
        category: workoutEntry?.category || 'unknown',
        muscles: workoutEntry?.muscles || [],
        defaultLabel: workoutEntry?.label || slug,
        workoutLabel: workoutEntry?.label || slug,
        note: '',
        workoutConfig: buildMenuWorkoutDefaultConfig(workoutEntry, difficulty),
      }, index, { workoutMap, difficulty });
    });
    setDirty(true);
    renderList();
  };

  const renderModalList = () => {
    const listEntries = resolveAvailableWorkoutList().filter((entry) => {
      const categoryOk = categoryFilterField.select.value === 'all' || entry.category === categoryFilterField.select.value;
      const muscleOk = muscleFilterField.select.value === 'all' || (entry.muscles || []).includes(muscleFilterField.select.value);
      return categoryOk && muscleOk;
    });

    modalList.innerHTML = '';
    if (!listEntries.length) {
      modalList.append(createPlaceholder('候補がありません', '絞り込み条件を変更してください。'));
      return;
    }

    listEntries.forEach((entry) => {
      const index = modalSelection.indexOf(entry.slug);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `workout-picker-item ${index >= 0 ? 'is-selected' : ''}`;
      button.innerHTML = `
        <strong>${entry.label}</strong>
        <span class="muted">${entry.categoryLabel} / ${entry.primaryMuscleLabel}${entry.isUnknown ? ' / 不明データ' : ''}</span>
        <span class="workout-picker-item__order">${index >= 0 ? index + 1 : ''}</span>
      `;
      button.addEventListener('click', () => {
        if (index >= 0) modalSelection = modalSelection.filter((slug) => slug !== entry.slug);
        else modalSelection = [...modalSelection, entry.slug];
        renderModalList();
        refreshModalMeta();
      });
      modalList.append(button);
    });
  };

  const openModal = () => {
    categoryFilterField.select.value = 'all';
    muscleFilterField.select.value = 'all';
    modalSelection = draftItems.map((item) => item.exerciseSlug).filter(Boolean);
    modalOverlay.hidden = false;
    renderModalList();
    modalCount.textContent = `${modalSelection.length}件選択中（押した順で番号表示）`;
  };

  const closeModal = () => {
    modalOverlay.hidden = true;
  };

  const renderList = () => {
    list.innerHTML = '';
    if (!draftItems.length) {
      const emptyText = mode === 'weekly'
        ? 'この曜日のメニュー項目はまだありません。「ワークアウト選択」から追加してください。'
        : 'この特別日のメニュー項目はまだありません。「ワークアウト選択」から追加してください。';
      list.append(createPlaceholder('未設定', emptyText));
      return;
    }

    draftItems.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'card stack';

      const workoutLabel = item.defaultLabel || item.workoutLabel || item.exerciseSlug || '不明なワークアウト';
      const heading = Object.assign(document.createElement('strong'), {
        textContent: `項目 ${index + 1}: ${(item.displayName || '').trim() || workoutLabel}`,
      });

      const info = Object.assign(document.createElement('p'), {
        className: 'muted',
        textContent: `${workoutLabel} / ${(MENU_WORKOUT_CATEGORY_LABELS[item.category] || MENU_WORKOUT_CATEGORY_LABELS.unknown)} / ${(item.muscles || []).map((muscle) => MENU_WORKOUT_MUSCLE_LABELS[muscle] || MENU_WORKOUT_MUSCLE_LABELS.other).join(', ') || MENU_WORKOUT_MUSCLE_LABELS.other}`,
      });

      const nameField = document.createElement('label');
      nameField.className = 'field';
      nameField.append(Object.assign(document.createElement('span'), { textContent: '表示名（空欄なら既定名）' }));
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = item.displayName || '';
      nameInput.placeholder = workoutLabel;
      nameField.append(nameInput);

      const noteField = document.createElement('label');
      noteField.className = 'field';
      noteField.append(Object.assign(document.createElement('span'), { textContent: 'メモ(任意)' }));
      const noteInput = document.createElement('textarea');
      noteInput.rows = 2;
      noteInput.value = item.note || '';
      noteField.append(noteInput);

      const config = item.config || item.workoutConfig || {};
      const configShape = getMenuConfigShape(config);
      const configGrid = document.createElement('div');
      configGrid.className = 'workout-config-grid';

      const inputModeField = createSelect('種別', configShape.inputMode, [
        { value: 'weightReps', label: 'weightReps（重量×回数）' },
        { value: 'reps', label: 'reps（回数）' },
        { value: 'time', label: 'time（時間）' },
      ], (opt) => opt);

      const timeModeField = createSelect('モード', configShape.timeMode, [
        { value: 'stopwatch', label: 'ストップウォッチ' },
        { value: 'timer', label: 'タイマー' },
        { value: 'intervalTimer', label: 'インターバルタイマー' },
        { value: 'intervalStopwatch', label: 'インターバルストップウォッチ' },
      ], (opt) => opt);
      timeModeField.wrap.style.display = configShape.inputMode === 'time' ? '' : 'none';

      const createNumberField = (labelText, value, step = '1') => {
        const wrapper = document.createElement('label');
        wrapper.className = 'field';
        wrapper.append(Object.assign(document.createElement('span'), { textContent: labelText }));
        const input = document.createElement('input');
        input.type = 'number';
        input.step = step;
        input.min = '0';
        input.value = value == null ? '' : String(value);
        wrapper.append(input);
        return { wrapper, input };
      };

      const setsField = createNumberField('セット数', config.sets ?? 1);
      const repsField = createNumberField('回数', config.reps);
      const weightField = createNumberField('重量(kg)', config.weight, '0.5');
      const workSecondsField = createNumberField('ワーク時間(秒)', config.workSeconds);
      const restSecondsField = createNumberField('休憩(秒)', config.restSeconds);
      const distanceField = createNumberField('距離(m)', config.distanceMeters);

      const toggleVisibility = (field, key) => {
        field.style.display = configShape.fields.includes(key) ? '' : 'none';
      };
      toggleVisibility(setsField.wrapper, 'sets');
      toggleVisibility(repsField.wrapper, 'reps');
      toggleVisibility(weightField.wrapper, 'weight');
      toggleVisibility(workSecondsField.wrapper, 'workSeconds');
      toggleVisibility(restSecondsField.wrapper, 'restSeconds');
      toggleVisibility(distanceField.wrapper, 'distanceMeters');

      configGrid.append(inputModeField.wrap, timeModeField.wrap, setsField.wrapper, repsField.wrapper, weightField.wrapper, workSecondsField.wrapper, restSecondsField.wrapper, distanceField.wrapper);

      const controls = document.createElement('div');
      controls.className = 'hero__actions';

      const up = document.createElement('button');
      up.type = 'button';
      up.className = 'ghost';
      up.textContent = '↑';
      up.disabled = index === 0;
      up.addEventListener('click', () => moveItem(index, -1));

      const down = document.createElement('button');
      down.type = 'button';
      down.className = 'ghost';
      down.textContent = '↓';
      down.disabled = index === draftItems.length - 1;
      down.addEventListener('click', () => moveItem(index, 1));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ghost';
      remove.textContent = '削除';
      remove.addEventListener('click', () => {
        draftItems = draftItems.filter((_, idx) => idx !== index);
        setDirty(true);
        renderList();
      });

      controls.append(up, down, remove);

      nameInput.addEventListener('input', () => {
        updateItem(index, { displayName: nameInput.value, title: nameInput.value });
        heading.textContent = `項目 ${index + 1}: ${(nameInput.value || '').trim() || workoutLabel}`;
      });

      noteInput.addEventListener('input', () => updateItem(index, { note: noteInput.value }));

      inputModeField.select.addEventListener('change', () => {
        const nextMode = inputModeField.select.value;
        const nextTimerType = nextMode === 'time' ? 'time' : 'setRest';
        const nextTimeMode = nextMode === 'time' ? 'stopwatch' : 'stopwatch';
        updateWorkoutConfig(index, { inputMode: nextMode, timerType: nextTimerType, mode: nextTimerType, timeMode: nextTimeMode });
        renderList();
      });
      timeModeField.select.addEventListener('change', () => {
        updateWorkoutConfig(index, { timeMode: timeModeField.select.value, timerType: 'time', mode: 'time' });
        renderList();
      });
      setsField.input.addEventListener('input', () => updateWorkoutConfig(index, { sets: parseInputNumber(setsField.input.value) || 1 }));
      repsField.input.addEventListener('input', () => updateWorkoutConfig(index, { reps: parseInputNumber(repsField.input.value) }));
      weightField.input.addEventListener('input', () => updateWorkoutConfig(index, { weight: parseInputNumber(weightField.input.value) }));
      workSecondsField.input.addEventListener('input', () => updateWorkoutConfig(index, { workSeconds: parseInputNumber(workSecondsField.input.value) }));
      restSecondsField.input.addEventListener('input', () => updateWorkoutConfig(index, { restSeconds: parseInputNumber(restSecondsField.input.value) }));
      distanceField.input.addEventListener('input', () => updateWorkoutConfig(index, { distanceMeters: parseInputNumber(distanceField.input.value) }));

      row.append(heading, info, nameField, configGrid, noteField, controls);
      list.append(row);
    });
  };

  const refreshModalMeta = () => {
    modalCount.textContent = `${modalSelection.length}件選択中（押した順で番号表示）`;
  };

  [categoryFilterField.select, muscleFilterField.select].forEach((el) => {
    el.addEventListener('change', () => {
      renderModalList();
      refreshModalMeta();
    });
  });

  selectWorkoutBtn.addEventListener('click', () => {
    playSfx('ui:select');
    openModal();
    refreshModalMeta();
  });

  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closeModal();
  });
  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modalOverlay.hidden) closeModal();
  });

  modalSelectBtn.addEventListener('click', () => {
    applySelection(modalSelection);
    closeModal();
  });

  dateInput.addEventListener('change', async () => {
    const nextDate = dateInput.value;
    if (!nextDate || nextDate === selectedDate) return;
    if (dirty && !confirm('未保存の変更があります。日付を切り替えますか？')) {
      dateInput.value = selectedDate;
      return;
    }
    selectedDate = nextDate;
    await syncDraft();
    renderList();
  });

  saveBtn.addEventListener('click', async () => {
    playSfx('ui:select');
    saveBtn.disabled = true;
    try {
      const sanitized = sanitizeMenuItems(draftItems, { workoutMap, difficulty });
      if (mode === 'weekly') {
        const saved = await Promise.resolve(store.saveWeeklyPlan(userId, selectedWeekday, sanitized));
        weeklyPlan[String(selectedWeekday)] = Array.isArray(saved) ? saved : sanitized;
        draftItems = sanitizeMenuItems(weeklyPlan[String(selectedWeekday)] || [], { workoutMap, difficulty });
        status.textContent = `${WEEKDAY_LABELS[selectedWeekday]}曜日のメニューを保存しました。`;
      } else {
        const saved = await Promise.resolve(store.saveSpecialPlan(userId, selectedDate, sanitized));
        specialPlanCache[selectedDate] = sanitizeMenuItems(saved || sanitized, { workoutMap, difficulty });
        draftItems = sanitizeMenuItems(specialPlanCache[selectedDate] || [], { workoutMap, difficulty });
        status.textContent = `${selectedDate} の特別日メニューを保存しました。`;
      }
      setDirty(false);
      renderList();
    } catch (_error) {
      status.textContent = '保存に失敗しました。';
    }
    saveBtn.disabled = false;
  });

  deleteSpecialBtn.addEventListener('click', async () => {
    if (mode !== 'special') return;
    if (!confirm(`${selectedDate} の特別日メニューを削除しますか？`)) return;
    playSfx('ui:select');
    deleteSpecialBtn.disabled = true;
    try {
      await Promise.resolve(store.saveSpecialPlan(userId, selectedDate, []));
      specialPlanCache[selectedDate] = [];
      draftItems = [];
      setDirty(false);
      status.textContent = `${selectedDate} の特別日メニューを削除しました。`;
      renderList();
    } catch (_error) {
      status.textContent = '削除に失敗しました。';
    }
    deleteSpecialBtn.disabled = false;
  });

  resetBtn.addEventListener('click', async () => {
    await syncDraft();
    renderList();
  });

  await syncDraft();
  updateHint();
  renderModeTabs();
  renderContext();
  renderList();

  card.append(title, hint, modeTabs, contextSlot, actionRow, status, list, modalOverlay);
  return card;
};

export const renderSettingsSection = async (params, { navigate, playSfx, store, accountState }) => {
  const section = params.section;
  const container = document.createElement('section');
  container.className = 'stack';

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = '← 設定トップへ戻る';
  back.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/settings');
  });

  container.append(back);

  if (section === 'account') {
    container.append(createAccountSettings({ store, playSfx, accountState }));
  } else if (section === 'body-profile') {
    container.append(createBodyProfileSettings({ store, playSfx, accountState }));
  } else if (section === 'menu') {
    container.append(await createMenuSettings({ store, playSfx }));
  } else if (section === 'general') {
    container.append(createGeneralSettings({ store, playSfx }));
  } else {
    container.append(createPlaceholder('未定義セクション', '存在しない設定画面です。'));
  }

  return container;
};
