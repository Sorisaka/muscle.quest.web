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

export const renderSettings = (_params, { store }) => {
  const settings = store.getSettings();
  const container = document.createElement('section');
  container.className = 'stack';

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
    createToggleField('Enable sound', settings.sound, (checked) => store.updateSettings({ sound: checked })),
  );

  container.append(title, description, form);
  return container;
};
