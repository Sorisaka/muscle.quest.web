export const renderRun = (params, { navigate, store }) => {
  const { difficulty, sound } = store.getSettings();

  const container = document.createElement('section');
  container.className = 'stack';

  const heading = document.createElement('h2');
  heading.textContent = `Run quest: ${params.id}`;

  const summary = document.createElement('p');
  summary.className = 'muted';
  summary.textContent = `Difficulty: ${difficulty} • Sound: ${sound ? 'on' : 'muted'}`;

  const reminder = document.createElement('p');
  reminder.textContent = 'Use this space to show live stats, timers, or exercise steps.';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.textContent = 'Back to quests';
  backButton.addEventListener('click', () => navigate('#/'));

  container.append(heading, summary, reminder, backButton);
  return container;
};
