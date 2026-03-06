import {
  ICON_BACKGROUND_OPTIONS,
  ICON_BORDER_OPTIONS,
  ICON_CENTER_OBJECT_OPTIONS,
  normalizeIconConfig,
} from '../core/iconOptions.js';
import { createAccountAvatar, getAvatarLabel } from '../ui/accountAvatar.js';
import { quests } from '../core/content.js';

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

const createAccountSettings = ({ store, playSfx }) => {
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
    const displayName = nameInput.value.trim() || 'Guest';
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
      displayName: nameInput.value.trim() || 'Guest',
      account_visibility: visField.select.value,
      default_visibility: visField.select.value,
      icon_border: borderField.select.value,
      icon_background: bgField.select.value,
      icon_center_object: centerField.select.value,
    };

    try {
      await Promise.resolve(store.saveProfileSettings(payload));
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

const normalizeMenuItem = (item = {}, index = 0) => {
  const exerciseSlug = item.exerciseSlug || item.exercise_slug || '';
  const quest = item.questId ? (quests || []).find((entry) => entry.id === item.questId) : findQuestByExercise(exerciseSlug);
  return {
    id: item.id || `${Date.now()}-${index}`,
    title: item.title || item.displayName || exerciseSlug || `項目${index + 1}`,
    exerciseSlug,
    questId: item.questId || quest?.id || '',
    category: item.category || quest?.tier || 'custom',
    note: item.note || '',
  };
};

const sanitizeMenuItems = (items = []) => (items || [])
  .map((item, index) => normalizeMenuItem(item, index))
  .map((item, index) => {
    const quest = item.questId ? (quests || []).find((entry) => entry.id === item.questId) : findQuestByExercise(item.exerciseSlug);
    const exerciseSlug = item.exerciseSlug || '';
    const title = (item.title || '').trim() || exerciseSlug || `メニュー${index + 1}`;
    return {
      id: item.id || `${Date.now()}-${index}`,
      title,
      displayName: title,
      exerciseSlug,
      questId: item.questId || quest?.id || '',
      category: item.category || quest?.tier || 'custom',
      note: (item.note || '').trim(),
    };
  });

const createMenuSettings = async ({ store, playSfx }) => {
  const card = document.createElement('div');
  card.className = 'card stack';

  const title = document.createElement('h3');
  title.textContent = 'メニュー設定';

  const userId = store.getProfile()?.id || 'local-user';
  const loadedWeekly = await Promise.resolve(store.loadWeeklyPlan(userId));
  const weeklyPlan = { ...(loadedWeekly || {}) };

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySpecial = await Promise.resolve(store.loadSpecialPlan(userId, todayKey));

  let selectedWeekday = new Date().getDay();
  let draftItems = sanitizeMenuItems(weeklyPlan[String(selectedWeekday)] || []);
  let dirty = false;

  const status = document.createElement('p');
  status.className = 'muted';
  const hint = document.createElement('p');
  hint.className = 'muted';
  hint.textContent = todaySpecial?.length
    ? `特別日メニュー（${todayKey}）が設定済みのため、ホームの当日TODOはそちらが優先されます。`
    : `週間メニューは、特別日メニューが無い日にホームの当日TODOへ反映されます。`;

  const weekdayTabs = document.createElement('div');
  weekdayTabs.className = 'tabs';

  const list = document.createElement('div');
  list.className = 'stack';

  const actionRow = document.createElement('div');
  actionRow.className = 'hero__actions';
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = '項目を追加';
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.textContent = '曜日メニューを保存';
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'ghost';
  resetBtn.textContent = '変更を破棄';
  actionRow.append(addBtn, saveBtn, resetBtn);

  const exerciseOptions = buildExerciseOptions();

  const setDirty = (value) => {
    dirty = Boolean(value);
    status.textContent = dirty ? '未保存の変更があります。' : '保存済みです。';
  };

  const syncDraftFromWeekday = () => {
    draftItems = sanitizeMenuItems(weeklyPlan[String(selectedWeekday)] || []);
    setDirty(false);
  };

  const renderTabs = () => {
    weekdayTabs.innerHTML = '';
    WEEKDAY_LABELS.forEach((label, weekday) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `tab ${weekday === selectedWeekday ? 'is-active' : ''}`.trim();
      tab.textContent = `${label}曜`;
      tab.addEventListener('click', () => {
        if (weekday === selectedWeekday) return;
        if (dirty && !confirm('未保存の変更があります。曜日を切り替えますか？')) return;
        selectedWeekday = weekday;
        syncDraftFromWeekday();
        renderTabs();
        renderList();
      });
      weekdayTabs.append(tab);
    });
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

  const renderList = () => {
    list.innerHTML = '';
    if (!draftItems.length) {
      list.append(createPlaceholder('未設定', 'この曜日のメニュー項目はまだありません。項目を追加してください。'));
      return;
    }

    draftItems.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'card stack';

      const nameField = document.createElement('label');
      nameField.className = 'field';
      nameField.append(Object.assign(document.createElement('span'), { textContent: '表示名' }));
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = item.title || '';
      nameField.append(nameInput);

      const exerciseField = createSelect('対応種目', item.exerciseSlug || '', [{ value: '', label: '(未選択)' }, ...exerciseOptions], (opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt));
      const questField = createSelect(
        '対応ワークアウト',
        item.questId || '',
        [{ value: '', label: '(自動/未選択)' }, ...(quests || []).map((quest) => ({ value: quest.id, label: `${quest.title || quest.id} (${quest.tier})` }))],
        (opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt),
      );

      const noteField = document.createElement('label');
      noteField.className = 'field';
      noteField.append(Object.assign(document.createElement('span'), { textContent: 'メモ(任意)' }));
      const noteInput = document.createElement('textarea');
      noteInput.rows = 2;
      noteInput.value = item.note || '';
      noteField.append(noteInput);

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

      const updateItem = () => {
        const next = draftItems.slice();
        const exerciseSlug = exerciseField.select.value;
        const linkedQuest = findQuestByExercise(exerciseSlug);
        next[index] = {
          ...next[index],
          title: nameInput.value,
          exerciseSlug,
          questId: questField.select.value || linkedQuest?.id || '',
          category: linkedQuest?.tier || next[index].category || 'custom',
          note: noteInput.value,
        };
        draftItems = next;
        setDirty(true);
      };

      [nameInput, exerciseField.select, questField.select, noteInput].forEach((el) => {
        el.addEventListener('input', updateItem);
        el.addEventListener('change', updateItem);
      });

      row.append(
        Object.assign(document.createElement('strong'), { textContent: `項目 ${index + 1}` }),
        nameField,
        exerciseField.wrap,
        questField.wrap,
        noteField,
        controls,
      );

      list.append(row);
    });
  };

  addBtn.addEventListener('click', () => {
    draftItems.push(normalizeMenuItem({ title: '', exerciseSlug: '', questId: '', note: '' }, draftItems.length));
    setDirty(true);
    renderList();
  });

  saveBtn.addEventListener('click', async () => {
    playSfx('ui:select');
    saveBtn.disabled = true;
    try {
      const sanitized = sanitizeMenuItems(draftItems);
      const saved = await Promise.resolve(store.saveWeeklyPlan(userId, selectedWeekday, sanitized));
      weeklyPlan[String(selectedWeekday)] = Array.isArray(saved) ? saved : sanitized;
      draftItems = sanitizeMenuItems(weeklyPlan[String(selectedWeekday)] || []);
      setDirty(false);
      status.textContent = `${WEEKDAY_LABELS[selectedWeekday]}曜日のメニューを保存しました。`;
      renderList();
    } catch (_error) {
      status.textContent = '保存に失敗しました。';
    }
    saveBtn.disabled = false;
  });

  resetBtn.addEventListener('click', () => {
    syncDraftFromWeekday();
    renderList();
  });

  syncDraftFromWeekday();
  renderTabs();
  renderList();

  card.append(title, hint, weekdayTabs, actionRow, status, list);
  return card;
};

export const renderSettingsSection = async (params, { navigate, playSfx, store }) => {
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
    container.append(createAccountSettings({ store, playSfx }));
  } else if (section === 'body-profile') {
    const profile = store.getProfile();
    container.append(createPlaceholder('身体プロフィール設定', `height: ${profile.height_cm || '-'} / weight: ${profile.weight_kg || '-'}`));
  } else if (section === 'menu') {
    container.append(await createMenuSettings({ store, playSfx }));
  } else if (section === 'general') {
    container.append(createPlaceholder('一般設定', '通知・言語・表示挙動の設定を追加予定です。'));
  } else {
    container.append(createPlaceholder('未定義セクション', '存在しない設定画面です。'));
  }

  return container;
};
