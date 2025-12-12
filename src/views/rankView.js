const createRankRow = (position, name, score) => {
  const row = document.createElement('div');
  row.className = 'row';

  const badge = document.createElement('span');
  badge.className = 'pill';
  badge.textContent = `#${position}`;

  const user = document.createElement('span');
  user.textContent = name;

  const points = document.createElement('strong');
  points.textContent = `${score} pts`;

  row.append(badge, user, points);
  return row;
};

export const renderRank = (params) => {
  const container = document.createElement('section');
  container.className = 'stack';

  const heading = document.createElement('h2');
  heading.textContent = `Rank board: ${params.id}`;
  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = 'Static sample data shows how route params map into the view.';

  const board = document.createElement('div');
  board.className = 'stack';

  const sample = [
    createRankRow(1, 'Atlas', 9800),
    createRankRow(2, 'Valkyrie', 9100),
    createRankRow(3, 'Nova', 8400),
  ];

  board.append(...sample);
  container.append(heading, description, board);
  return container;
};
