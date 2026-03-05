import { toDateKey } from '../../lib/dateKey.js';

const buildMonthCells = (year, month) => {
  const first = new Date(year, month - 1, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDateKey(new Date(year, month - 1, day)));
  }
  return cells;
};

export const createMonthGrid = ({
  year,
  month,
  activeDate = null,
  workoutDates = new Set(),
  onSelectDate,
} = {}) => {
  const grid = document.createElement('div');
  grid.className = 'history-calendar';

  buildMonthCells(year, month).forEach((dateKey) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'history-calendar__cell';
    if (!dateKey) {
      cell.disabled = true;
      cell.classList.add('history-calendar__cell--blank');
      cell.textContent = '';
    } else {
      cell.textContent = String(Number(dateKey.slice(-2)));
      if (workoutDates.has(dateKey)) cell.classList.add('history-calendar__cell--active');
      if (activeDate === dateKey) cell.classList.add('history-calendar__cell--selected');
      cell.addEventListener('click', () => {
        if (typeof onSelectDate === 'function') onSelectDate(dateKey);
      });
    }
    grid.append(cell);
  });

  return grid;
};
