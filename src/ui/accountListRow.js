import { createAccountAvatar, getAvatarLabel } from './accountAvatar.js';

export const withPrivateLock = (displayName, visibility) => {
  const safeName = displayName || 'Unknown';
  return visibility === 'private' ? `${safeName} 🔒` : safeName;
};

export const createAccountListRow = ({ account = {}, actionEl = null } = {}) => {
  const row = document.createElement('article');
  row.className = 'card account-list-row';

  const top = document.createElement('div');
  top.className = 'list-account-row';

  const displayName = account.display_name || account.displayName || account.id || 'Unknown';
  const visibility = account.account_visibility || account.accountVisibility || 'public';

  const avatar = createAccountAvatar({
    label: getAvatarLabel(displayName, 'U'),
    className: 'account-avatar--inline',
    icon: {
      icon_border: account.icon_border,
      icon_background: account.icon_background,
      icon_center_object: account.icon_center_object,
    },
  });

  const textWrap = document.createElement('div');
  textWrap.className = 'stack';

  const name = document.createElement('strong');
  name.textContent = withPrivateLock(displayName, visibility);

  const idText = document.createElement('p');
  idText.className = 'muted';
  idText.textContent = `ID: ${account.id || 'unknown'}`;

  const vis = document.createElement('span');
  vis.className = 'pill';
  vis.textContent = visibility === 'private' ? 'private 🔒' : 'public';

  textWrap.append(name, idText, vis);
  top.append(avatar, textWrap);

  row.append(top);
  if (actionEl) row.append(actionEl);

  return row;
};
