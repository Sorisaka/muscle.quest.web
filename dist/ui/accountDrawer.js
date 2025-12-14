const createMetricRow = (label, value) => {
  const row = document.createElement('div');
  row.className = 'account-metrics__row';

  const name = document.createElement('span');
  name.textContent = label;

  const val = document.createElement('strong');
  val.textContent = value;

  row.append(name, val);
  return row;
};

export const createAccountDrawer = ({
  triggerEl,
  drawerEl,
  overlayEl,
  accountState,
  navigate,
  playSfx,
}) => {
  if (!triggerEl || !drawerEl || !overlayEl) return null;

  const renderDrawer = () => {
    const status = accountState.getStatus();
    drawerEl.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'account-drawer__header';
    const title = document.createElement('strong');
    title.textContent = 'Account';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ghost';
    closeBtn.textContent = '閉じる';
    closeBtn.addEventListener('click', () => closeDrawer());
    header.append(title, closeBtn);

    const body = document.createElement('div');
    body.className = 'account-drawer__body';

    const summary = document.createElement('div');
    summary.className = 'account-summary';
    const name = document.createElement('div');
    name.className = 'account-summary__name';
    name.textContent = status.displayName || 'Guest';
    const meta = document.createElement('div');
    meta.className = 'account-summary__meta';
    meta.textContent = status.isGuest
      ? 'ゲストとして利用中。データは端末にのみ保存されます。'
      : 'ログイン中';
    summary.append(name, meta);

    const metrics = document.createElement('div');
    metrics.className = 'account-metrics';
    metrics.append(
      createMetricRow('Streak', `${status.streak} 日`),
      createMetricRow('総保有ポイント', `${status.points} pts`),
      createMetricRow('本日', `${status.totals.daily || 0} pts`),
      createMetricRow('直近7日', `${status.totals.weekly || 0} pts`),
      createMetricRow('直近30日', `${status.totals.monthly || 0} pts`),
    );

    const actions = document.createElement('div');
    actions.className = 'drawer-actions';

    if (status.isGuest) {
      const helper = document.createElement('p');
      helper.className = 'muted drawer-actions__note';
      helper.textContent = 'ゲストとしての操作です。ログインするとクラウド連携予定です。';

      const loginBtn = document.createElement('button');
      loginBtn.type = 'button';
      loginBtn.textContent = 'ログイン';
      loginBtn.addEventListener('click', () => {
        playSfx('ui:navigate');
        alert('ダミーログイン: ローカルでログイン状態を切り替えます。');
        accountState.login();
        closeDrawer();
      });

      const settingsLink = document.createElement('button');
      settingsLink.type = 'button';
      settingsLink.className = 'ghost';
      settingsLink.textContent = '設定';
      settingsLink.addEventListener('click', () => {
        playSfx('ui:navigate');
        navigate('#/settings');
        closeDrawer();
      });

      actions.append(helper, loginBtn, settingsLink);
    } else {
      const idRow = document.createElement('p');
      idRow.className = 'account-summary__meta account-summary__id';
      idRow.textContent = `ID: ${status.id}`;

      const accountButton = document.createElement('button');
      accountButton.type = 'button';
      accountButton.textContent = 'アカウント情報へ';
      accountButton.addEventListener('click', () => {
        playSfx('ui:navigate');
        navigate('#/account');
        closeDrawer();
      });

      const settingsLink = document.createElement('button');
      settingsLink.type = 'button';
      settingsLink.className = 'ghost';
      settingsLink.textContent = '設定';
      settingsLink.addEventListener('click', () => {
        playSfx('ui:navigate');
        navigate('#/settings');
        closeDrawer();
      });

      const logoutBtn = document.createElement('button');
      logoutBtn.type = 'button';
      logoutBtn.textContent = 'ログアウト';
      logoutBtn.addEventListener('click', () => {
        playSfx('ui:navigate');
        alert('ダミーログアウト: ローカルのログイン状態を解除します。');
        accountState.logout();
        closeDrawer();
      });

      actions.append(idRow, accountButton, settingsLink, logoutBtn);
    }

    body.append(summary, metrics, actions);
    drawerEl.append(header, body);
  };

  const openDrawer = () => {
    renderDrawer();
    drawerEl.classList.add('is-open');
    overlayEl.classList.add('is-active');
  };

  const closeDrawer = () => {
    drawerEl.classList.remove('is-open');
    overlayEl.classList.remove('is-active');
  };

  overlayEl.addEventListener('click', () => closeDrawer());
  triggerEl.addEventListener('click', () => {
    playSfx('ui:navigate');
    openDrawer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  });

  accountState.subscribe(() => {
    if (drawerEl.classList.contains('is-open')) {
      renderDrawer();
    }
  });

  return { openDrawer, closeDrawer };
};
