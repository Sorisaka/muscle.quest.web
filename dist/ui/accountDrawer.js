import { createAccountAvatar, getAvatarLabel } from './accountAvatar.js';

const createMetricRow = (label, value) => {
  const row = document.createElement('div');
  row.className = 'account-metrics__row';
  row.append(Object.assign(document.createElement('span'), { textContent: label }), Object.assign(document.createElement('strong'), { textContent: value }));
  return row;
};

const summarizeHistory = (history = [], days = 1) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const from = start.getTime();

  return (Array.isArray(history) ? history : []).reduce((acc, entry) => {
    const source = entry?.timestamp || entry?.result?.timestamp || entry?.created_at || entry?.published_at;
    if (!source) return acc;
    const at = new Date(source).getTime();
    if (Number.isNaN(at) || at < from) return acc;
    acc.calories += Number(entry?.calories || 0);
    acc.runs += 1;
    return acc;
  }, { calories: 0, runs: 0 });
};

export const createAccountDrawer = ({ triggerEl, drawerEl, overlayEl, accountState, navigate, playSfx, store }) => {
  if (!triggerEl || !drawerEl || !overlayEl) return null;

  const closeDrawer = () => {
    drawerEl.classList.remove('is-open');
    overlayEl.classList.remove('is-active');
  };

  const openDrawer = () => {
    Promise.resolve(store.fetchNotificationUnreadCount({ force: true })).catch(() => {}).finally(() => renderDrawer());
    renderDrawer();
    drawerEl.classList.add('is-open');
    overlayEl.classList.add('is-active');
  };

  const renderDrawer = () => {
    const status = accountState.getStatus();
    const history = store?.getHistory?.() || [];
    const today = summarizeHistory(history, 1);
    const weekly = summarizeHistory(history, 7);
    const monthly = summarizeHistory(history, 30);

    const notificationState = store.getNotificationState ? store.getNotificationState() : { unreadCount: 0 };

    drawerEl.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'account-drawer__header';
    header.append(Object.assign(document.createElement('strong'), { textContent: 'メニュー' }));

    const body = document.createElement('div');
    body.className = 'account-drawer__body';

    const summary = document.createElement('div');
    summary.className = 'account-summary';

    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'account-summary__header';

    const identity = document.createElement('div');
    identity.className = 'list-account-row account-summary__identity';
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
    const label = status.displayName || 'ゲスト';
    name.textContent = visibility === 'private' ? `${label} 🔒` : label;
    identity.append(avatar, name);

    const profileLink = document.createElement('button');
    profileLink.type = 'button';
    profileLink.className = 'account-summary__link';
    profileLink.setAttribute('aria-label', 'アカウント情報へ移動');
    profileLink.textContent = 'アカウント情報へ';
    profileLink.addEventListener('click', () => {
      playSfx('ui:navigate');
      navigate('#/account');
      closeDrawer();
    });

    summaryHeader.append(identity, profileLink);

    const idRow = document.createElement('div');
    idRow.className = 'account-summary__id-row';

    const id = document.createElement('div');
    id.className = 'account-summary__id';
    id.textContent = `ID: ${status.id || 'guest'}`;

    const copyStatus = document.createElement('p');
    copyStatus.className = 'account-summary__copy-status';
    copyStatus.setAttribute('role', 'status');
    copyStatus.setAttribute('aria-live', 'polite');

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'ghost account-summary__copy';
    copyBtn.textContent = 'コピー';

    const copyTextFallback = (value) => {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.append(textarea);
      textarea.focus();
      textarea.select();
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } finally {
        textarea.remove();
      }
      if (!copied) {
        throw new Error('copy-fallback-failed');
      }
    };

    const showCopied = (labelText) => {
      copyBtn.textContent = labelText;
      copyStatus.textContent = labelText;
      window.setTimeout(() => {
        copyBtn.textContent = 'コピー';
        copyStatus.textContent = '';
      }, 1400);
    };

    copyBtn.addEventListener('click', async () => {
      const idText = status.id || 'guest';
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(idText);
        } else {
          copyTextFallback(idText);
        }
        playSfx('ui:select');
        showCopied('コピーしました');
      } catch (error) {
        try {
          copyTextFallback(idText);
          playSfx('ui:select');
          showCopied('コピーしました');
        } catch (_fallbackError) {
          copyBtn.textContent = 'コピー不可';
          copyStatus.textContent = 'この環境ではコピーできません';
          window.setTimeout(() => {
            copyBtn.textContent = 'コピー';
            copyStatus.textContent = '';
          }, 1800);
        }
      }
    });

    idRow.append(id, copyBtn);
    summary.append(summaryHeader, idRow, copyStatus);

    const metrics = document.createElement('div');
    metrics.className = 'account-metrics';
    metrics.append(
      createMetricRow('総消費カロリー', `${status.calories} kcal`),
      createMetricRow('完了ワークアウト', `${status.completedRuns || 0} 件`),
      createMetricRow('ストリーク', `${status.streak} 日`),
      createMetricRow('本日', `${Math.round(today.calories)}kcal / ${today.runs} 件`),
      createMetricRow('直近7日', `${Math.round(weekly.calories)}kcal / ${weekly.runs} 件`),
      createMetricRow('直近30日', `${Math.round(monthly.calories)}kcal / ${monthly.runs} 件`),
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

    const notificationsBtn = document.createElement('button');
    notificationsBtn.type = 'button';
    notificationsBtn.className = 'ghost drawer-notification-button';
    notificationsBtn.append(Object.assign(document.createElement('span'), { textContent: '通知' }));
    if (notificationState.unreadCount > 0) {
      notificationsBtn.append(Object.assign(document.createElement('span'), { className: 'drawer-notification-badge', textContent: String(notificationState.unreadCount) }));
    }
    notificationsBtn.addEventListener('click', () => {
      playSfx('ui:navigate');
      navigate('#/notifications');
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

    actions.append(settingsBtn, notificationsBtn, requestsBtn, logoutBtn);
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
