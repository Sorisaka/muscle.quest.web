export const createCountsSummaryBlock = ({ counts = {}, onOpenFollowing, onOpenFollowers, onOpenFollowSearch } = {}) => {
  const wrap = document.createElement('div');
  wrap.className = 'account-counts-summary';

  const countsGrid = document.createElement('div');
  countsGrid.className = 'account-metrics-grid';

  const following = document.createElement('button');
  following.type = 'button';
  following.className = 'account-metric__row metric-link';
  following.innerHTML = `<span>フォロー数</span><strong>${counts.following || 0}</strong>`;
  following.addEventListener('click', () => onOpenFollowing?.());

  const followers = document.createElement('button');
  followers.type = 'button';
  followers.className = 'account-metric__row metric-link';
  followers.innerHTML = `<span>フォロワー数</span><strong>${counts.followers || 0}</strong>`;
  followers.addEventListener('click', () => onOpenFollowers?.());

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'account-add-follow';
  addBtn.textContent = '+';
  addBtn.setAttribute('aria-label', '新規フォロー');
  addBtn.addEventListener('click', () => onOpenFollowSearch?.());

  countsGrid.append(following, followers);
  wrap.append(countsGrid, addBtn);
  return wrap;
};
