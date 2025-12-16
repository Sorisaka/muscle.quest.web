import {
  DEFAULT_OAUTH_PROVIDER,
  getSession,
  onAuthStateChange,
  signInWithOAuth,
  signOut,
} from '../services/authService.js';
import { fetchProfileByUserId, updateProfileDisplayName } from '../services/profileService.js';
import { insertWorkoutEvent } from '../services/trainingService.js';
import { isSupabaseConfigured } from '../lib/supabaseClient.js';

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

const createNotice = (message, tone = 'muted') => {
  const notice = document.createElement('p');
  notice.className = tone === 'error' ? 'muted error' : 'muted';
  notice.textContent = message;
  return notice;
};

export const renderAccount = (_params, { navigate, accountState, playSfx }) => {
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
  description.textContent =
    'Supabase Auth と profiles を利用して、ログインと表示名の編集を行う画面です。';

  const profileCard = document.createElement('div');
  profileCard.className = 'card account-card';

  const profileHeader = document.createElement('div');
  profileHeader.className = 'account-card__header';
  const profileTitle = document.createElement('div');
  profileTitle.className = 'account-card__title';
  profileTitle.textContent = 'ログイン状態';
  const profileId = document.createElement('p');
  profileId.className = 'muted';
  profileId.textContent = 'セッション確認中...';
  profileHeader.append(profileTitle, profileId);

  const authNotice = createNotice('OAuth ログインでセッションを開始できます。');

  const loginActions = document.createElement('div');
  loginActions.className = 'hero__actions';

  const loginBtn = document.createElement('button');
  loginBtn.type = 'button';
  loginBtn.textContent = 'GitHub でログイン';
  loginBtn.addEventListener('click', () => {
    playSfx('ui:navigate');
    loginBtn.disabled = true;
    signInWithOAuth(DEFAULT_OAUTH_PROVIDER)
      .then(({ error }) => {
        if (error) {
          authNotice.textContent = `OAuth 開始に失敗しました: ${error.message}`;
          authNotice.className = 'muted error';
        } else {
          authNotice.textContent = 'Supabase へリダイレクトします...';
          authNotice.className = 'muted';
        }
      })
      .finally(() => {
        loginBtn.disabled = false;
      });
  });

  const emailPlaceholder = document.createElement('p');
  emailPlaceholder.className = 'muted';
  emailPlaceholder.textContent = 'メール/パスワードは今後対応予定のプレースホルダーです。';

  loginActions.append(loginBtn, emailPlaceholder);

  const profileForm = document.createElement('div');
  profileForm.className = 'stack';

  const nameLabel = document.createElement('p');
  nameLabel.className = 'eyebrow';
  nameLabel.textContent = 'Display name';
  const nameField = document.createElement('input');
  nameField.type = 'text';
  nameField.placeholder = '表示名を入力';
  nameField.disabled = true;

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.textContent = '表示名を保存';
  saveBtn.disabled = true;

  const saveNotice = createNotice('ログインすると profiles.display_name を編集できます。');

  const signOutBtn = document.createElement('button');
  signOutBtn.type = 'button';
  signOutBtn.className = 'ghost';
  signOutBtn.textContent = 'Sign out';
  signOutBtn.disabled = true;

  profileForm.append(nameLabel, nameField, saveBtn, saveNotice, signOutBtn);

  profileCard.append(profileHeader, authNotice, loginActions, profileForm);

  const statsCard = document.createElement('div');
  statsCard.className = 'card account-card';
  const statsTitle = document.createElement('h3');
  statsTitle.textContent = '獲得状況';
  const statsGrid = document.createElement('div');
  statsGrid.className = 'account-metrics-grid';
  const totalsCard = document.createElement('div');
  totalsCard.className = 'card account-card';
  const totalsTitle = document.createElement('h3');
  totalsTitle.textContent = '期間別ポイント';
  const totalsGrid = document.createElement('div');
  totalsGrid.className = 'account-metrics-grid';

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

  const showDebugTools = typeof window !== 'undefined' && window.location.search.includes('devtools=1');
  let debugCard;
  if (showDebugTools) {
    debugCard = document.createElement('div');
    debugCard.className = 'card account-card';

    const debugTitle = document.createElement('h3');
    debugTitle.textContent = '開発用デバッグ';

    const debugNotice = createNotice('Supabase の workout_events 挿入テストを行います。');

    const testInsertBtn = document.createElement('button');
    testInsertBtn.type = 'button';
    testInsertBtn.textContent = 'デバッグ: 1pt イベントを追加';
    testInsertBtn.addEventListener('click', async () => {
      testInsertBtn.disabled = true;
      const { error } = await insertWorkoutEvent({
        event_type: 'debug_insert',
        points: 1,
        occurred_at: new Date().toISOString(),
        metadata: { source: 'account-devtools' },
      });
      if (error) {
        debugNotice.textContent = `挿入に失敗しました: ${error.message}`;
        debugNotice.className = 'muted error';
      } else {
        debugNotice.textContent = 'デバッグ挿入が完了しました。';
        debugNotice.className = 'muted';
      }
      testInsertBtn.disabled = false;
    });

    debugCard.append(debugTitle, debugNotice, testInsertBtn);
  }

  container.append(heading, description, profileCard, statsCard, totalsCard, actions);
  if (debugCard) {
    container.append(debugCard);
  }

  let currentUser = null;
  let currentProfile = null;
  let unsubscribeAuth = null;

  const updateMetrics = () => {
    const status = accountState.getStatus();
    statsGrid.innerHTML = '';
    statsGrid.append(
      createMetricRow('総保有ポイント', `${status.points} pts`),
      createMetricRow('完了クエスト', `${status.completedRuns || 0} 件`),
      createMetricRow('ストリーク', `${status.streak} 日`),
    );

    totalsGrid.innerHTML = '';
    totalsGrid.append(
      createMetricRow('本日', `${status.totals.daily || 0} pts`, { muted: true }),
      createMetricRow('直近7日', `${status.totals.weekly || 0} pts`, { muted: true }),
      createMetricRow('直近30日', `${status.totals.monthly || 0} pts`, { muted: true }),
    );
  };

  const setConfigGuard = () => {
    authNotice.textContent =
      'Supabase の URL / anon key が未設定です。src/lib/supabaseClient.js の SUPABASE_URL / SUPABASE_ANON_KEY を入力してください。';
    authNotice.className = 'muted error';
    profileId.textContent = 'Supabase 未設定';
    loginBtn.disabled = true;
    saveBtn.disabled = true;
    nameField.disabled = true;
    signOutBtn.disabled = true;
  };

  const renderLoggedOut = () => {
    profileTitle.textContent = '未ログイン';
    profileId.textContent = 'セッションが見つかりません';
    nameField.value = '';
    nameField.disabled = true;
    saveBtn.disabled = true;
    signOutBtn.disabled = true;
    authNotice.textContent = 'OAuth ログインでセッションを開始できます。';
    authNotice.className = 'muted';
  };

  const renderLoggedIn = () => {
    const email = currentUser?.email || 'メール未登録';
    const idText = currentUser?.id || '不明なユーザー';
    const displayName = currentProfile?.display_name || email || 'Cloud User';

    profileTitle.textContent = displayName;
    profileId.textContent = `ID: ${idText}\nEmail: ${email}`;
    nameField.value = currentProfile?.display_name || '';
    nameField.disabled = false;
    saveBtn.disabled = false;
    signOutBtn.disabled = false;
    authNotice.textContent = 'ログイン中。表示名は profiles.display_name を編集します。';
    authNotice.className = 'muted';
  };

  const refreshProfile = async (user) => {
    const { data, error } = await fetchProfileByUserId(user.id);
    if (error) {
      saveNotice.textContent = `profiles の取得に失敗しました: ${error.message}`;
      saveNotice.className = 'muted error';
      currentProfile = null;
      return;
    }
    currentProfile = data || null;
    if (!data) {
      saveNotice.textContent =
        'profiles に該当行が見つかりませんでした。SQL (supabase/sql/001_profiles.sql) を実行しているか確認してください。';
      saveNotice.className = 'muted error';
    } else {
      saveNotice.textContent = '表示名を編集して保存できます。';
      saveNotice.className = 'muted';
    }
  };

  const applySession = async (session) => {
    currentUser = session?.user || null;
    if (!currentUser) {
      currentProfile = null;
      renderLoggedOut();
      accountState.logout();
      return;
    }

    await refreshProfile(currentUser);
    renderLoggedIn();
    const displayName = currentProfile?.display_name || currentUser.email || currentUser.id;
    accountState.login(displayName);
    if (currentProfile?.display_name) {
      accountState.setDisplayName(currentProfile.display_name);
    }
  };

  const checkSession = async () => {
    profileId.textContent = 'セッション確認中...';
    const { data, error } = await getSession();
    if (error) {
      authNotice.textContent = `セッション取得に失敗しました: ${error.message}`;
      authNotice.className = 'muted error';
      renderLoggedOut();
      return;
    }
    await applySession(data?.session || null);
  };

  saveBtn.addEventListener('click', async () => {
    if (!currentUser) return;
    const desired = nameField.value.trim();
    saveBtn.disabled = true;
    const { data, error } = await updateProfileDisplayName(currentUser.id, desired);
    if (error) {
      saveNotice.textContent = `保存に失敗しました: ${error.message}`;
      saveNotice.className = 'muted error';
    } else {
      currentProfile = data;
      saveNotice.textContent = 'プロフィールを更新しました。';
      saveNotice.className = 'muted';
      renderLoggedIn();
      accountState.setDisplayName(data?.display_name || desired);
    }
    saveBtn.disabled = false;
  });

  signOutBtn.addEventListener('click', async () => {
    signOutBtn.disabled = true;
    const { error } = await signOut();
    if (error) {
      authNotice.textContent = `サインアウトに失敗しました: ${error.message}`;
      authNotice.className = 'muted error';
    }
    await checkSession();
    accountState.logout();
    signOutBtn.disabled = false;
  });

  if (!isSupabaseConfigured) {
    setConfigGuard();
  } else {
    checkSession();
    unsubscribeAuth = onAuthStateChange(async (_event, session) => {
      await applySession(session);
    });
  }

  updateMetrics();
  accountState.subscribe(() => {
    updateMetrics();
  });

  container.addEventListener('removed', () => {
    if (unsubscribeAuth) {
      unsubscribeAuth();
    }
  });

  return container;
};
