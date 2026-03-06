import { createAccountAvatar, getAvatarLabel } from './accountAvatar.js';

const createMetricRow = (label, value) => {
  const row = document.createElement('div');
  row.className = 'account-metrics__row';
  row.append(Object.assign(document.createElement('span'), { textContent: label }), Object.assign(document.createElement('strong'), { textContent: value }));
  return row;
};

export const createAccountDrawer = ({ triggerEl, drawerEl, overlayEl, accountState, navigate, playSfx }) => {
  if (!triggerEl || !drawerEl || !overlayEl) return null;

  const closeDrawer = () => {
    drawerEl.classList.remove('is-open');
    overlayEl.classList.remove('is-active');
  };

  const openDrawer = () => {
    renderDrawer();
    drawerEl.classList.add('is-open');
    overlayEl.classList.add('is-active');
  };

  const renderDrawer = () => {
    const status = accountState.getStatus();
    drawerEl.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'account-drawer__header';
    header.append(Object.assign(document.createElement('strong'), { textContent: 'メニュー' }));

    const body = document.createElement('div');
    body.className = 'account-drawer__body';

    const summary = document.createElement('div');
    summary.className = 'account-summary';
    const identity = document.createElement('div');
    identity.className = 'list-account-row';
    const avatar = createAccountAvatar({
      label: getAvatarLabel(status.displayName, 'G'),
      className: 'account-avatar--inline',
      icon: {
        icon_border: status.profile?.icon_border,
        icon_background: status.profile?.icon_background,
        icon_center_object: status.profile?.icon_center_object,
      },
    });
    const name = document.createElement('div');
    name.className = 'account-summary__name';
    const visibility = accountState.getStatus().profile?.account_visibility || 'private';
    const label = status.displayName || 'Guest';
    name.textContent = visibility === 'private' ? `${label} 🔒` : label;
    identity.append(avatar, name);

    const id = document.createElement('div');
    id.className = 'account-summary__id';
    id.textContent = `ID: ${status.id || 'guest'}`;

    summary.append(identity, id);

    const metrics = document.createElement('div');
    metrics.className = 'account-metrics';
    metrics.append(
      createMetricRow('総消費カロリー', `${status.calories} kcal`),
      createMetricRow('ストリーク', `${status.streak} 日`),
      createMetricRow('完了ワークアウト', `${status.completedRuns || 0} 件`),
    );

    const actions = document.createElement('div');
    actions.className = 'drawer-actions';

    const settingsBtn = document.createElement('button');
    settingsBtn.type = 'button';
    settingsBtn.textContent = '設定';
    settingsBtn.addEventListener('click', () => {
      playSfx('ui:navigate');
      navigate('#/settings');
      closeDrawer();
    });

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'ghost';
    logoutBtn.textContent = status.isGuest ? 'Google でログイン' : 'ログアウト';
    logoutBtn.addEventListener('click', async () => {
      playSfx('ui:navigate');
      if (status.isGuest) await accountState.login();
      else await accountState.logout();
      closeDrawer();
    });

    const requestsBtn = document.createElement('button');
    requestsBtn.type = 'button';
    requestsBtn.className = 'ghost';
    requestsBtn.textContent = 'フォローリクエスト一覧';
    requestsBtn.addEventListener('click', () => {
      playSfx('ui:navigate');
      navigate('#/follow-requests');
      closeDrawer();
    });

    actions.append(settingsBtn, requestsBtn, logoutBtn);
    body.append(summary, metrics, actions);
    drawerEl.append(header, body);
  };

  const triggerAvatar = () => {
    const status = accountState.getStatus();
    triggerEl.innerHTML = '';
    triggerEl.append(createAccountAvatar({
      label: getAvatarLabel(status.displayName, 'G'),
      icon: {
        icon_border: status.profile?.icon_border,
        icon_background: status.profile?.icon_background,
        icon_center_object: status.profile?.icon_center_object,
      },
    }));
  };

  overlayEl.addEventListener('click', closeDrawer);
  triggerEl.addEventListener('click', () => {
    playSfx('ui:navigate');
    if (drawerEl.classList.contains('is-open')) {
      closeDrawer();
      navigate('#/account');
      return;
    }
    openDrawer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });

  accountState.subscribe(() => {
    triggerAvatar();
    if (drawerEl.classList.contains('is-open')) renderDrawer();
  });
  triggerAvatar();

  return { openDrawer, closeDrawer };
};
