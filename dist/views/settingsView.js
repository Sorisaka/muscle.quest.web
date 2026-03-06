import {
  ICON_BACKGROUND_OPTIONS,
  ICON_BORDER_OPTIONS,
  ICON_CENTER_OBJECT_OPTIONS,
  normalizeIconConfig,
} from '../core/iconOptions.js';
import { createAccountAvatar, getAvatarLabel } from '../ui/accountAvatar.js';

const SETTINGS_SECTIONS = [
  { key: 'account', label: 'アカウント設定', description: '表示名 / アイコン / 公開範囲' },
  { key: 'body-profile', label: '身体プロフィール設定', description: '身長・体重など' },
  { key: 'menu', label: 'メニュー設定', description: '曜日ごとのトレーニング計画' },
  { key: 'general', label: '一般設定', description: '通知や表示設定' },
];

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

const createPlaceholder = (titleText, bodyText) => {
  const card = document.createElement('div');
  card.className = 'card stack';
  card.append(
    Object.assign(document.createElement('h3'), { textContent: titleText }),
    Object.assign(document.createElement('p'), { className: 'muted', textContent: bodyText }),
  );
  return card;
};

const createSelect = (label, value, options = []) => {
  const wrap = document.createElement('label');
  wrap.className = 'field';
  const text = document.createElement('span');
  text.textContent = label;
  const select = document.createElement('select');
  options.forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    if (opt === value) o.selected = true;
    select.append(o);
  });
  wrap.append(text, select);
  return { wrap, select };
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

export const renderSettingsSection = (params, { navigate, playSfx, store }) => {
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
    container.append(createPlaceholder('メニュー設定', '曜日別メニュー編集UIをここに集約します（既存データ層に接続予定）。'));
  } else if (section === 'general') {
    container.append(createPlaceholder('一般設定', '通知・言語・表示挙動の設定を追加予定です。'));
  } else {
    container.append(createPlaceholder('未定義セクション', '存在しない設定画面です。'));
  }

  return container;
};
