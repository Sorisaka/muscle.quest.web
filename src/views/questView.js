import quests from '../data/quests.json' assert { type: 'json' };

const starDisplay = (count) => '★'.repeat(count) || 'No rating yet';

const createExerciseList = (exercises) => {
  const list = document.createElement('ul');
  list.className = 'pill-list';
  exercises.forEach((exercise) => {
    const item = document.createElement('li');
    item.className = 'pill';
    item.textContent = exercise;
    list.append(item);
  });
  return list;
};

export const renderQuest = (params, { navigate }) => {
  const quest = quests.find((entry) => entry.id === params.id);

  const container = document.createElement('section');
  container.className = 'stack';

  if (!quest) {
    const title = document.createElement('h2');
    title.textContent = 'Quest not found';
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = 'Back to quests';
    back.addEventListener('click', () => navigate('#/'));
    container.append(title, back);
    return container;
  }

  const title = document.createElement('h2');
  title.textContent = quest.title;

  const description = document.createElement('p');
  description.textContent = quest.description;

  const stars = document.createElement('p');
  stars.className = 'muted';
  stars.textContent = `${starDisplay(quest.stars)} • ~${quest.estimatedMinutes} minutes`;

  const exercises = createExerciseList(quest.exercises);

  const runButton = document.createElement('button');
  runButton.type = 'button';
  runButton.textContent = 'Start run';
  runButton.addEventListener('click', () => navigate(`#/run/${quest.id}`));

  const learnButton = document.createElement('a');
  learnButton.href = `./content/exercises/${quest.exercises[0] || 'push-ups'}.html`;
  learnButton.className = 'link';
  learnButton.textContent = 'How-to guide';

  container.append(title, description, stars, exercises, runButton, learnButton);
  return container;
};
