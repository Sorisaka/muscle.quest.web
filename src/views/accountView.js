const createMetricRow = (label, value, options = {}) => {
  const row = document.createElement('div');
  row.className = 'account-metric__row';
  const name = document.createElement('span');
  name.textContent = label;
  if (options.muted) {
    name.className = 'muted';
  }

  const val = document.createElement('strong');
  val.textContent = value;
  row.append(name, val);
  return row;
};

const createAlert = (message) => {
  const alert = document.createElement('div');
  alert.className = 'card account-card account-card--alert';

  const heading = document.createElement('h3');
  heading.textContent = '設定が必要です';

  const body = document.createElement('p');
  body.className = 'muted';
  body.textContent = message;

  const helper = document.createElement('p');
  helper.className = 'muted';
  helper.textContent = 'dist/config.example.js を dist/config.js としてコピーし、Supabase の URL と anon key を入力してください。';

  alert.append(heading, body, helper);
  return alert;
};

const createLoading = (label = 'Loading...') => {
  const box = document.createElement('div');
  box.className = 'card account-card';

  const text = document.createElement('p');
  text.textContent = label;
  box.append(text);
  return box;
};

const createLoggedOutCard = (accountState) => {
  const card = document.createElement('div');
  card.className = 'card account-card';

  const title = document.createElement('h3');
  title.textContent = 'ログインして同期';

  const copy = document.createElement('p');
  copy.className = 'muted';
  copy.textContent = 'Supabase OAuth を使ってプロフィールを同期します。Google でログインできます。';

  const actions = document.createElement('div');
  actions.className = 'hero__actions';

  const login = document.createElement('button');
  login.type = 'button';
  login.textContent = 'Google でログイン';
  login.addEventListener('click', () => {
    accountState.login();
  });

  actions.append(login);
  card.append(title, copy, actions);
  return card;
};

const createProfileCard = (status, accountState, playSfx) => {
  const card = document.createElement('div');
  card.className = 'card account-card';

  const header = document.createElement('div');
  header.className = 'account-card__header';
  const title = document.createElement('div');
  title.className = 'account-card__title';
  title.textContent = status.displayName || 'User';
  const userId = document.createElement('p');
  userId.className = 'muted';
  userId.textContent = status.email ? `${status.email}` : `ID: ${status.id}`;
  header.append(title, userId);

  const nameLabel = document.createElement('p');
  nameLabel.className = 'eyebrow';
  nameLabel.textContent = 'Display name';
  const nameField = document.createElement('input');
  nameField.type = 'text';
  nameField.value = status.displayName || '';
  nameField.placeholder = '表示名を入力';

  const feedback = document.createElement('p');
  feedback.className = 'muted';

  const actions = document.createElement('div');
  actions.className = 'hero__actions';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.textContent = '保存';
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    playSfx('ui:select');
    feedback.textContent = '保存中...';
    const result = await accountState.setDisplayName(nameField.value.trim());
    feedback.textContent = result ? '保存しました。' : '保存に失敗しました。設定を確認してください。';
    saveBtn.disabled = false;
  });

  const signOut = document.createElement('button');
  signOut.type = 'button';
  signOut.className = 'ghost';
  signOut.textContent = 'サインアウト';
  signOut.addEventListener('click', async () => {
    playSfx('ui:navigate');
    await accountState.logout();
  });

  actions.append(saveBtn, signOut);
  card.append(header, nameLabel, nameField, feedback, actions);
  return card;
};

const createStatsCards = (status, navigate, playSfx) => {
  const statsCard = document.createElement('div');
  statsCard.className = 'card account-card';
  const statsTitle = document.createElement('h3');
  statsTitle.textContent = '獲得状況';
  const statsGrid = document.createElement('div');
  statsGrid.className = 'account-metrics-grid';
  statsGrid.append(
    createMetricRow('総保有消費カロリー', `${status.calories} kcal`),
    createMetricRow('完了クエスト', `${status.completedRuns || 0} 件`),
    createMetricRow('ストリーク', `${status.streak} 日`),
  );
  statsCard.append(statsTitle, statsGrid);

  const totalsCard = document.createElement('div');
  totalsCard.className = 'card account-card';
  const totalsTitle = document.createElement('h3');
  totalsTitle.textContent = '期間別消費カロリー';
  const totalsGrid = document.createElement('div');
  totalsGrid.className = 'account-metrics-grid';
  totalsGrid.append(
    createMetricRow('本日', `${status.totals.daily || 0} kcal`, { muted: true }),
    createMetricRow('直近7日', `${status.totals.weekly || 0} kcal`, { muted: true }),
    createMetricRow('直近30日', `${status.totals.monthly || 0} kcal`, { muted: true }),
  );
  totalsCard.append(totalsTitle, totalsGrid);

  const actions = document.createElement('div');
  actions.className = 'hero__actions';

  const toRank = document.createElement('button');
  toRank.type = 'button';
  toRank.textContent = 'ランキングを見る';
  toRank.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/rank/local');
  });

  const toSettings = document.createElement('button');
  toSettings.type = 'button';
  toSettings.className = 'ghost';
  toSettings.textContent = '設定';
  toSettings.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/settings');
  });

  actions.append(toRank, toSettings);

  return [statsCard, totalsCard, actions];
};


const createSocialCard = (status, store, playSfx) => {
  const card = document.createElement('div');
  card.className = 'card account-card';
  const title = document.createElement('h3');
  title.textContent = 'フォロー';

  const followerCount = document.createElement('p');
  followerCount.className = 'muted';
  const followingCount = document.createElement('p');
  followingCount.className = 'muted';

  const targetField = document.createElement('input');
  targetField.type = 'text';
  targetField.placeholder = 'ユーザーIDを入力';

  const feedback = document.createElement('p');
  feedback.className = 'muted';

  const actions = document.createElement('div');
  actions.className = 'hero__actions';

  const refreshCounts = async () => {
    const followers = await Promise.resolve(store.getFollowers(status.id));
    const following = await Promise.resolve(store.getFollowing(status.id));
    followerCount.textContent = `フォロワー: ${(followers || []).length}`;
    followingCount.textContent = `フォロー中: ${(following || []).length}`;
  };

  const followBtn = document.createElement('button');
  followBtn.type = 'button';
  followBtn.textContent = 'フォロー';
  followBtn.addEventListener('click', async () => {
    const targetId = targetField.value.trim();
    if (!targetId) return;
    playSfx('ui:select');
    await Promise.resolve(store.followUser(status.id, targetId));
    feedback.textContent = `${targetId} をフォローしました。`;
    refreshCounts();
  });

  const unfollowBtn = document.createElement('button');
  unfollowBtn.type = 'button';
  unfollowBtn.className = 'ghost';
  unfollowBtn.textContent = 'フォロー解除';
  unfollowBtn.addEventListener('click', async () => {
    const targetId = targetField.value.trim();
    if (!targetId) return;
    playSfx('ui:select');
    await Promise.resolve(store.unfollowUser(status.id, targetId));
    feedback.textContent = `${targetId} のフォローを解除しました。`;
    refreshCounts();
  });

  actions.append(followBtn, unfollowBtn);
  card.append(title, followerCount, followingCount, targetField, actions, feedback);
  refreshCounts();
  return card;
};

const createPostVisibilityCard = (status, store) => {
  const card = document.createElement('div');
  card.className = 'card account-card';
  const title = document.createElement('h3');
  title.textContent = '投稿公開設定（最近の履歴）';
  const list = document.createElement('div');
  list.className = 'stack';

  const renderList = () => {
    list.innerHTML = '';
    const items = (store.getHistory() || []).slice(0, 5);
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = '履歴がまだありません。';
      list.append(empty);
      return;
    }

    items.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'card stack';
      const label = document.createElement('p');
      label.textContent = `${entry.exerciseSlug || entry.questId || 'workout'} / ${entry.calories || 0} kcal`;

      const visibility = document.createElement('select');
      ['public', 'private', 'archived'].forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        if ((entry.visibility || 'private') === value) option.selected = true;
        visibility.append(option);
      });

      const note = document.createElement('input');
      note.type = 'text';
      note.value = entry.note || '';
      note.placeholder = 'note';

      const save = document.createElement('button');
      save.type = 'button';
      save.textContent = '保存';
      save.addEventListener('click', async () => {
        await Promise.resolve(store.updateWorkoutPost(entry.id, {
          visibility: visibility.value,
          note: note.value,
          published_at: visibility.value === 'archived' ? null : (entry.published_at || new Date().toISOString()),
        }));
        renderList();
      });

      row.append(label, visibility, note, save);
      list.append(row);
    });
  };

  renderList();
  card.append(title, list);
  return card;
};

export const renderAccount = (_params, { navigate, accountState, playSfx, store }) => {
  const container = document.createElement('section');
  container.className = 'stack account-view';

  const heading = document.createElement('div');
  heading.className = 'list-header account-header';

  const title = document.createElement('h2');
  title.textContent = 'アカウント情報';

  const backHome = document.createElement('button');
  backHome.type = 'button';
  backHome.className = 'ghost';
  backHome.textContent = '← ホームに戻る';
  backHome.addEventListener('click', () => {
    playSfx('ui:navigate');
    navigate('#/');
  });

  heading.append(title, backHome);

  const description = document.createElement('p');
  description.className = 'muted';
  description.textContent = 'Supabase 認証と profiles を使って表示名を同期します。設定が無い場合は下の案内を確認してください。';

  const content = document.createElement('div');
  content.className = 'stack';

  const renderState = (status) => {
    content.innerHTML = '';

    if (status.supabaseError && !status.supabaseReady) {
      content.append(createAlert(status.supabaseError));
      return;
    }

    if (status.loading) {
      content.append(createLoading('セッション確認中...'));
      return;
    }

    if (!status.loggedIn) {
      content.append(createLoggedOutCard(accountState));
      return;
    }

    if (status.supabaseError) {
      const errorBox = document.createElement('div');
      errorBox.className = 'card account-card account-card--alert';
      const errorHeading = document.createElement('h3');
      errorHeading.textContent = 'エラーが発生しました';
      const errorCopy = document.createElement('p');
      errorCopy.className = 'muted';
      errorCopy.textContent = status.supabaseError;
      errorBox.append(errorHeading, errorCopy);
      content.append(errorBox);
    }

    content.append(createProfileCard(status, accountState, playSfx));
    const stats = createStatsCards(status, navigate, playSfx);
    content.append(...stats);
    content.append(createSocialCard(status, store, playSfx));
    content.append(createPostVisibilityCard(status, store));
  };

  renderState(accountState.getStatus());
  const unsubscribe = accountState.subscribe((next) => renderState(next));
  container.addEventListener('DOMNodeRemoved', () => unsubscribe());

  container.append(heading, description, content);
  return container;
};
