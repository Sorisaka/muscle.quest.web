import { createAccountAvatar, getAvatarLabel } from './accountAvatar.js';
import { normalizeAccountVisibility } from '../core/privacy/visibility.js';

export const withPrivateLock = (displayName, visibility) => {
  const safeName = displayName || '不明';
  return visibility === 'private' ? `${safeName} 🔒` : safeName;
};

export const createAccountListRow = ({ account = {}, actionEl = null } = {}) => {
  const row = document.createElement('article');
  row.className = 'card account-list-row';

  const top = document.createElement('div');
  top.className = 'list-account-row';

  const displayName = account.display_name || account.displayName || account.id || '不明';
  const visibility = normalizeAccountVisibility(
    account.account_visibility || account.accountVisibility || account.visibility,
    'private',
  );

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
  idText.textContent = `ID: ${account.id || '不明'}`;

  textWrap.append(name, idText);
  top.append(avatar, textWrap);

  row.append(top);
  if (actionEl) row.append(actionEl);

  return row;
};
