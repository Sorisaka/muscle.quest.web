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
    if (option.value === value) {
      element.selected = true;
    }
    select.append(element);
  });

  select.addEventListener('change', (event) => onChange(event.target.value));

  field.append(text, select);
  return field;
};

export const renderSettings = (_params, { store, navigate, playSfx }) => {
  const settings = store.getSettings();
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
  description.textContent = 'Settings are stored in localStorage so they persist between visits.';

  const form = document.createElement('div');
  form.className = 'stack';

  form.append(
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

  container.append(back, title, description, form);
  return container;
};
