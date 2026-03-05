import { trainingDefinitions } from '../data/trainingDefinitions.js';
import { applyAutoProfileEstimation, estimateProfileMetrics } from '../core/calorie/estimateProfile.js';

const SEX_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const MODE_OPTIONS = [
  { value: 'auto', label: 'auto' },
  { value: 'manual', label: 'manual' },
];

const CATEGORY_OPTIONS = [
  { value: 'cardio', label: 'cardio' },
  { value: 'bodyweight', label: 'bodyweight' },
  { value: 'weights', label: 'weights' },
];

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const LENGTH_FIELDS = [
  { key: 'step_length_m', label: 'Step length (m)' },
  { key: 'arm_length_m', label: 'Arm length (m)' },
  { key: 'leg_length_m', label: 'Leg length (m)' },
  { key: 'torso_length_m', label: 'Torso length (m)' },
];

const profileDefaults = {
  height_cm: '',
  weight_kg: '',
  sex: 'unknown',
  step_length_m: '',
  arm_length_m: '',
  leg_length_m: '',
  torso_length_m: '',
  step_length_m_mode: 'auto',
  arm_length_m_mode: 'auto',
  leg_length_m_mode: 'auto',
  torso_length_m_mode: 'auto',
};

const toTextValue = (value, digits = 3) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '';
  return String(Number(num.toFixed(digits)));
};

const normalizeDraft = (profile = {}) => ({
  ...profileDefaults,
  ...profile,
  height_cm: profile?.height_cm ?? '',
  weight_kg: profile?.weight_kg ?? '',
});

const createToggleField = (labelText, checked, onToggle) => {
  const field = document.createElement('label');
  field.className = 'field';

  const text = document.createElement('span');
  text.textContent = labelText;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', (event) => onToggle(event.target.checked));

  field.append(text, input);
  return field;
};

const createRangeField = (labelText, value, onChange) => {
  const field = document.createElement('label');
  field.className = 'field';

  const text = document.createElement('span');
  text.textContent = labelText;

  const wrapper = document.createElement('div');
  wrapper.className = 'range-field';

  const display = document.createElement('span');
  display.className = 'muted';
  display.textContent = `${Math.round(value * 100)}%`;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = '0';
  input.max = '1';
  input.step = '0.05';
  input.value = value;
  input.addEventListener('input', (event) => {
    const nextValue = Number(event.target.value);
    display.textContent = `${Math.round(nextValue * 100)}%`;
    onChange(nextValue);
  });

  wrapper.append(display, input);
  field.append(text, wrapper);
  return field;
};

const createSelectField = (labelText, value, options, onChange) => {
  const field = document.createElement('label');
  field.className = 'field';

  const text = document.createElement('span');
  text.textContent = labelText;

  const select = document.createElement('select');
  options.forEach((option) => {
    const element = document.createElement('option');
    element.value = option.value;
    element.textContent = option.label;
    if (option.value === value) element.selected = true;
    select.append(element);
  });

  select.addEventListener('change', (event) => onChange(event.target.value));
  field.append(text, select);
  return field;
};

const createInputField = (labelText, value, { type = 'number', step = '0.1', min = '0', readOnly = false } = {}, onChange) => {
  const field = document.createElement('label');
  field.className = 'field';
  const text = document.createElement('span');
  text.textContent = labelText;

  const input = document.createElement('input');
  input.type = type;
  input.step = step;
  input.min = min;
  input.value = value;
  input.readOnly = readOnly;
  if (readOnly) input.classList.add('muted');
  input.addEventListener('input', (event) => onChange?.(event.target.value));

  field.append(text, input);
  return { field, input };
};

const defaultMenuItem = () => ({
  exerciseSlug: Object.keys(trainingDefinitions)[0] || 'squats',
  category: 'bodyweight',
  target: {},
});

const cloneItems = (items = []) => (Array.isArray(items) ? items.map((item) => ({ ...defaultMenuItem(), ...item })) : []);

export const renderSettings = (_params, { store, navigate, playSfx }) => {
  const settings = store.getSettings();
  const profile = store.getProfile();
  let activeTab = 'simple';
  let draft = normalizeDraft(profile);
  let activeWeekday = String(new Date().getDay());
  let specialDate = new Date().toISOString().slice(0, 10);
  let weeklyItems = [];
  let specialItems = [];

  const container = document.createElement('section');
  container.className = 'stack';

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ghost';
  back.textContent = '← ホームに戻る';
  back.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/');
  });

  const title = document.createElement('h2');
  title.textContent = 'Settings';
  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = 'Simple/Advanced でプロフィール値を管理し、消費カロリー計算に利用します。';

  const saveFeedback = document.createElement('p');
  saveFeedback.className = 'muted';

  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  const tabSimple = document.createElement('button');
  tabSimple.type = 'button';
  tabSimple.className = 'tab is-active';
  tabSimple.textContent = 'Simple';
  const tabAdvanced = document.createElement('button');
  tabAdvanced.type = 'button';
  tabAdvanced.className = 'tab';
  tabAdvanced.textContent = 'Advanced';
  tabs.append(tabSimple, tabAdvanced);

  const profileCard = document.createElement('div');
  profileCard.className = 'card stack';
  const weeklyCard = document.createElement('div');
  weeklyCard.className = 'card stack';
  const specialCard = document.createElement('div');
  specialCard.className = 'card stack';

  const profileId = () => store.getProfile()?.id || 'local-user';

  const recomputeAutoFields = () => {
    const merged = applyAutoProfileEstimation(draft, draft);
    draft = {
      ...draft,
      ...merged,
      step_length_m: toTextValue(merged.step_length_m),
      arm_length_m: toTextValue(merged.arm_length_m),
      leg_length_m: toTextValue(merged.leg_length_m),
      torso_length_m: toTextValue(merged.torso_length_m),
    };
  };

  const setTab = (next) => {
    activeTab = next;
    tabSimple.classList.toggle('is-active', next === 'simple');
    tabAdvanced.classList.toggle('is-active', next === 'advanced');
    renderProfileForm();
  };

  tabSimple.addEventListener('click', () => setTab('simple'));
  tabAdvanced.addEventListener('click', () => setTab('advanced'));

  const renderMenuItemsEditor = (items, onChange) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'stack';

    items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'card stack';

      row.append(
        createSelectField('Exercise', item.exerciseSlug, Object.keys(trainingDefinitions).map((slug) => ({ value: slug, label: slug })), (value) => {
          const next = cloneItems(items);
          next[index].exerciseSlug = value;
          onChange(next);
        }),
      );

      row.append(
        createSelectField('Category', item.category || 'bodyweight', CATEGORY_OPTIONS, (value) => {
          const next = cloneItems(items);
          next[index].category = value;
          onChange(next);
        }),
      );

      const { field: targetField } = createInputField('Target(JSON)', JSON.stringify(item.target || {}), { type: 'text' }, (value) => {
        const next = cloneItems(items);
        try {
          next[index].target = value ? JSON.parse(value) : {};
        } catch (_error) {
          next[index].target = next[index].target || {};
        }
        onChange(next);
      });
      row.append(targetField);

      const actions = document.createElement('div');
      actions.className = 'hero__actions';

      const up = document.createElement('button');
      up.type = 'button';
      up.className = 'ghost';
      up.textContent = '↑';
      up.disabled = index === 0;
      up.addEventListener('click', () => {
        if (index === 0) return;
        const next = cloneItems(items);
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        onChange(next);
      });

      const down = document.createElement('button');
      down.type = 'button';
      down.className = 'ghost';
      down.textContent = '↓';
      down.disabled = index === items.length - 1;
      down.addEventListener('click', () => {
        if (index >= items.length - 1) return;
        const next = cloneItems(items);
        [next[index + 1], next[index]] = [next[index], next[index + 1]];
        onChange(next);
      });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ghost';
      remove.textContent = '削除';
      remove.addEventListener('click', () => {
        const next = cloneItems(items).filter((_, i) => i !== index);
        onChange(next);
      });

      actions.append(up, down, remove);
      row.append(actions);
      wrapper.append(row);
    });

    return wrapper;
  };

  const renderProfileForm = () => {
    profileCard.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = activeTab === 'simple' ? 'Simple profile' : 'Advanced profile';
    profileCard.append(heading);

    const baseFields = document.createElement('div');
    baseFields.className = 'stack';

    const height = createInputField('Height (cm)', draft.height_cm, { step: '1', min: '0' }, (value) => {
      draft.height_cm = value;
      recomputeAutoFields();
      renderProfileForm();
    });
    const weight = createInputField('Weight (kg)', draft.weight_kg, { step: '0.1', min: '1' }, (value) => {
      draft.weight_kg = value;
      recomputeAutoFields();
      renderProfileForm();
    });

    baseFields.append(height.field, weight.field);
    baseFields.append(
      createSelectField('Sex', draft.sex, SEX_OPTIONS, (value) => {
        draft.sex = value;
        recomputeAutoFields();
        renderProfileForm();
      }),
    );

    profileCard.append(baseFields);

    if (activeTab === 'simple') {
      const { estimated } = estimateProfileMetrics(draft);
      LENGTH_FIELDS.forEach(({ key, label }) => {
        const { field } = createInputField(`${label} (estimated)`, toTextValue(estimated[key]), { readOnly: true }, null);
        profileCard.append(field);
      });
      return;
    }

    LENGTH_FIELDS.forEach(({ key, label }) => {
      const modeKey = `${key}_mode`;
      const row = document.createElement('div');
      row.className = 'card stack';

      row.append(
        createSelectField(`${label} mode`, draft[modeKey] || 'auto', MODE_OPTIONS, (value) => {
          draft[modeKey] = value;
          recomputeAutoFields();
          renderProfileForm();
        }),
      );

      const isManual = draft[modeKey] === 'manual';
      const { field } = createInputField(label, draft[key], { step: '0.001', min: '0', readOnly: !isManual }, (value) => {
        draft[key] = value;
      });
      row.append(field);

      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'ghost';
      resetBtn.textContent = '推定に戻す';
      resetBtn.addEventListener('click', () => {
        draft[modeKey] = 'auto';
        recomputeAutoFields();
        renderProfileForm();
      });
      row.append(resetBtn);

      profileCard.append(row);
    });
  };

  const renderWeeklyEditor = () => {
    weeklyCard.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = '週間メニュー';

    weeklyCard.append(heading);
    weeklyCard.append(
      createSelectField('Weekday', activeWeekday, WEEKDAY_LABELS.map((label, idx) => ({ value: String(idx), label })), async (value) => {
        activeWeekday = value;
        const next = await Promise.resolve(store.loadWeeklyPlan(profileId()));
        weeklyItems = cloneItems(next?.[activeWeekday] || []);
        renderWeeklyEditor();
      }),
    );

    weeklyCard.append(renderMenuItemsEditor(weeklyItems, (next) => {
      weeklyItems = next;
      renderWeeklyEditor();
    }));

    const actions = document.createElement('div');
    actions.className = 'hero__actions';

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'ghost';
    add.textContent = '項目追加';
    add.addEventListener('click', () => {
      weeklyItems = [...weeklyItems, defaultMenuItem()];
      renderWeeklyEditor();
    });

    const save = document.createElement('button');
    save.type = 'button';
    save.textContent = `${WEEKDAY_LABELS[Number(activeWeekday)]} を保存`;
    save.addEventListener('click', async () => {
      await Promise.resolve(store.saveWeeklyPlan(profileId(), Number(activeWeekday), weeklyItems));
      saveFeedback.textContent = '週間メニューを保存しました。';
    });

    actions.append(add, save);
    weeklyCard.append(actions);
  };

  const renderSpecialEditor = () => {
    specialCard.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = '特別日メニュー';

    specialCard.append(heading);
    const dateField = createInputField('Date', specialDate, { type: 'date' }, async (value) => {
      specialDate = value;
      specialItems = cloneItems((await Promise.resolve(store.loadSpecialPlan(profileId(), specialDate))) || []);
      renderSpecialEditor();
    });
    specialCard.append(dateField.field);

    specialCard.append(renderMenuItemsEditor(specialItems, (next) => {
      specialItems = next;
      renderSpecialEditor();
    }));

    const actions = document.createElement('div');
    actions.className = 'hero__actions';

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'ghost';
    add.textContent = '項目追加';
    add.addEventListener('click', () => {
      specialItems = [...specialItems, defaultMenuItem()];
      renderSpecialEditor();
    });

    const save = document.createElement('button');
    save.type = 'button';
    save.textContent = '特別日を保存';
    save.addEventListener('click', async () => {
      await Promise.resolve(store.saveSpecialPlan(profileId(), specialDate, specialItems));
      saveFeedback.textContent = '特別日メニューを保存しました。';
    });

    actions.append(add, save);
    specialCard.append(actions);
  };

  recomputeAutoFields();
  renderProfileForm();

  const saveProfileButton = document.createElement('button');
  saveProfileButton.type = 'button';
  saveProfileButton.textContent = 'プロフィールを保存';
  saveProfileButton.addEventListener('click', async () => {
    saveProfileButton.disabled = true;
    saveFeedback.textContent = '保存中...';
    const payload = {
      height_cm: draft.height_cm === '' ? null : Number(draft.height_cm),
      weight_kg: draft.weight_kg === '' ? null : Number(draft.weight_kg),
      sex: draft.sex,
      step_length_m: draft.step_length_m === '' ? null : Number(draft.step_length_m),
      arm_length_m: draft.arm_length_m === '' ? null : Number(draft.arm_length_m),
      leg_length_m: draft.leg_length_m === '' ? null : Number(draft.leg_length_m),
      torso_length_m: draft.torso_length_m === '' ? null : Number(draft.torso_length_m),
      step_length_m_mode: draft.step_length_m_mode || 'auto',
      arm_length_m_mode: draft.arm_length_m_mode || 'auto',
      leg_length_m_mode: draft.leg_length_m_mode || 'auto',
      torso_length_m_mode: draft.torso_length_m_mode || 'auto',
    };

    const result = await Promise.resolve(store.saveProfileSettings(payload));
    draft = normalizeDraft(result || store.getProfile());
    recomputeAutoFields();
    renderProfileForm();
    saveFeedback.textContent = result ? 'プロフィールを保存しました。' : '保存に失敗しました。';
    saveProfileButton.disabled = false;
  });

  const appSettingsCard = document.createElement('div');
  appSettingsCard.className = 'card stack';
  appSettingsCard.append(
    createSelectField(
      'Preferred language',
      settings.language,
      [
        { value: 'en', label: 'English' },
        { value: 'ja', label: '日本語' },
      ],
      (value) => store.updateSettings({ language: value }),
    ),
    createSelectField(
      'Difficulty',
      settings.difficulty,
      [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
      ],
      (value) => store.updateSettings({ difficulty: value }),
    ),
    createToggleField('効果音を鳴らす', settings.sfxEnabled, (checked) =>
      store.updateSettings({ sfxEnabled: checked }),
    ),
    createRangeField('効果音の音量', settings.sfxVolume, (value) =>
      store.updateSettings({ sfxVolume: Math.max(0, Math.min(1, value)) }),
    ),
  );

  const initMenus = async () => {
    const weekly = await Promise.resolve(store.loadWeeklyPlan(profileId()));
    weeklyItems = cloneItems(weekly?.[activeWeekday] || []);
    specialItems = cloneItems((await Promise.resolve(store.loadSpecialPlan(profileId(), specialDate))) || []);
    renderWeeklyEditor();
    renderSpecialEditor();
  };

  initMenus();

  container.append(
    back,
    title,
    description,
    tabs,
    profileCard,
    saveProfileButton,
    saveFeedback,
    weeklyCard,
    specialCard,
    appSettingsCard,
  );
  return container;
};
