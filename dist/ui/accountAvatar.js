import { normalizeIconConfig } from '../core/iconOptions.js';

export const createAccountAvatar = ({ label = 'U', className = '', icon = {} } = {}) => {
  const avatar = document.createElement('span');
  const normalizedIcon = normalizeIconConfig(icon);

  avatar.className = ['account-avatar', className, normalizedIcon.icon_border, normalizedIcon.icon_background].filter(Boolean).join(' ');
  avatar.setAttribute('aria-hidden', 'true');

  const center = document.createElement('span');
  center.className = ['account-avatar__center', normalizedIcon.icon_center_object].join(' ');
  center.textContent = ['dot', 'diamond', 'barbell', 'bolt'].includes(normalizedIcon.icon_center_object)
    ? ''
    : String(label || 'U').slice(0, 1).toUpperCase();

  avatar.append(center);
  return avatar;
};

export const getAvatarLabel = (displayName = '', fallback = 'U') => {
  const trimmed = String(displayName || '').trim();
  return trimmed ? trimmed[0] : fallback;
};
