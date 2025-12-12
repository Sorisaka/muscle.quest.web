import quests from '../data/quests.json' assert { type: 'json' };

const createQuestCard = (quest, navigate) => {
  const card = document.createElement('article');
  card.className = 'card';

  const title = document.createElement('h3');
  title.textContent = quest.title;

  const description = document.createElement('p');
  description.textContent = quest.description;

  const meta = document.createElement('p');
  meta.className = 'muted';
  meta.textContent = `${quest.stars}★ • ~${quest.estimatedMinutes} min`;

  const startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.textContent = 'View quest';
  startButton.addEventListener('click', () => navigate(`#/quest/${quest.id}`));

  card.append(title, description, meta, startButton);
  return card;
};

export const renderHome = (_params, { navigate }) => {
  const container = document.createElement('section');
  container.className = 'stack';

  const header = document.createElement('header');
  header.className = 'stack';
  const title = document.createElement('h2');
  title.textContent = 'Choose your quest';
  const subtitle = document.createElement('p');
  subtitle.className = 'muted';
  subtitle.textContent = 'Hash-based routing keeps the app simple and GitHub Pages friendly.';
  header.append(title, subtitle);

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  quests.forEach((quest) => {
    grid.append(createQuestCard(quest, navigate));
  });

  container.append(header, grid);
  return container;
};
