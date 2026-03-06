import { getRuntimeConfig, hasSupabaseCredentials } from '../lib/runtimeConfig.js';
import { getSession, onAuthStateChange, signInWithOAuth, signOut } from '../services/authService.js';
import { fetchProfile, upsertProfile } from '../services/profileService.js';
import { authLog, authWarn } from '../lib/authDebug.js';

const ACCOUNT_SESSION_KEY = 'musclequest:account';

const readLocalSession = () => {
  try {
    const raw = localStorage.getItem(ACCOUNT_SESSION_KEY);
    if (!raw) return { loggedIn: false };
    return JSON.parse(raw);
  } catch (error) {
    return { loggedIn: false };
  }
};

const persistLocalSession = (session) => {
  localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(session));
  return session;
};


const toProfilePatch = (profile = {}) => ({
  ...(profile || {}),
  display_name: profile.display_name ?? profile.displayName,
  displayName: profile.displayName ?? profile.display_name,
  account_visibility: profile.account_visibility ?? profile.accountVisibility,
  default_visibility: profile.default_visibility ?? profile.defaultVisibility,
  icon_border: profile.icon_border ?? profile.iconBorder,
  icon_background: profile.icon_background ?? profile.iconBackground,
  icon_center_object: profile.icon_center_object ?? profile.iconCenterObject,
});

const missingConfigMessage = [
  'Supabase の設定が不足しています。',
  'dist/config.example.js をもとに dist/config.js を作成し、SUPABASE_URL と SUPABASE_ANON_KEY を設定してください。',
  'その後、OAuth ログインを再実行するとクラウド同期を利用できます。',
].join(' ');

export const createAccountState = (store) => {
  let state = {
    loading: true,
    supabaseReady: false,
    supabaseError: null,
    session: null,
    profile: null,
    localSession: readLocalSession(),
  };

  const subscribers = new Set();
  let loginInFlight = false;

  const setState = (partial) => {
    state = { ...state, ...partial };
    notify();
  };

  const notify = () => {
    const snapshot = getStatus();
    subscribers.forEach((callback) => callback(snapshot));
  };

  const getEffectiveProfile = () => ({
    ...toProfilePatch(state.profile || {}),
    ...toProfilePatch(store.getProfile() || {}),
  });

  const deriveDisplayName = () => {
    const profile = getEffectiveProfile();
    const supaName = profile.display_name || profile.displayName;
    if (supaName) return supaName;
    if (state.session?.user?.email) return state.session.user.email;
    return 'ゲスト';
  };

  const getStatus = () => {
    const profile = getEffectiveProfile();
    const calorieSummary = store.getCalorieSummary ? store.getCalorieSummary() : store.getPointSummary();
    const loggedIn = Boolean(state.session && state.supabaseReady && !state.supabaseError);

    return {
      loading: state.loading,
      supabaseReady: state.supabaseReady,
      supabaseError: state.supabaseError,
      session: state.session,
      profile,
      loggedIn,
      isGuest: !loggedIn,
      id: loggedIn ? state.session?.user?.id || state.profile?.id : profile?.id || 'local-user',
      email: state.session?.user?.email || null,
      displayName: deriveDisplayName(),
      calories: profile?.totalCalories || profile?.total_calories || 0,
      points: profile?.points || 0,
      completedRuns: profile?.completedRuns || 0,
      streak: calorieSummary.streak || 0,
      totals: calorieSummary.totals || { daily: 0, weekly: 0, monthly: 0 },
    };
  };

  const syncProfileToStore = (displayName) => {
    if (displayName) {
      store.setProfileName(displayName);
    }
  };

  const loadProfile = async (user) => {
    if (!user?.id) return;
    const { data, error } = await fetchProfile(user.id);
    if (error) {
      setState({ supabaseError: error.message || String(error) });
      return;
    }
    if (data) {
      setState({ profile: data });
      syncProfileToStore(data.display_name);
    }
  };

  const refreshSession = async () => {
    const runtimeConfig = getRuntimeConfig();
    const hasCredentials = hasSupabaseCredentials(runtimeConfig);
    if (!hasCredentials) {
      setState({
        loading: false,
        supabaseReady: false,
        supabaseError: missingConfigMessage,
        session: null,
        profile: null,
      });
      return;
    }

    setState({ loading: true, supabaseError: null });
    const { data, error } = await getSession();
    if (error) {
      setState({
        loading: false,
        supabaseReady: false,
        supabaseError: error.message || String(error),
        session: null,
        profile: null,
      });
      return;
    }

    const session = data?.session || null;
    setState({
      loading: false,
      supabaseReady: true,
      supabaseError: null,
      session,
      profile: null,
    });

    if (session?.user) {
      await loadProfile(session.user);
    }
  };

  const login = async () => {
    if (loginInFlight) {
      authWarn('oauth sign-in already in progress');
      return { data: null, error: new Error('OAuth ログインはすでに進行中です。') };
    }

    loginInFlight = true;
    const result = await signInWithOAuth('google');
    if (result?.error) {
      setState({ supabaseError: result.error.message || String(result.error) });
      loginInFlight = false;
    }
    authLog('oauth sign-in initiated', { redirected: !result?.error });
    return result;
  };

  const logout = async () => {
    await signOut();
    setState({ session: null, profile: null, supabaseReady: true, supabaseError: null });
    persistLocalSession({ ...state.localSession, loggedIn: false });
  };


  const saveProfileSettings = async (partialProfile = {}) => {
    const result = await Promise.resolve(store.saveProfileSettings(partialProfile));
    const mergedProfile = {
      ...toProfilePatch(state.profile || {}),
      ...toProfilePatch(result || {}),
      ...toProfilePatch(partialProfile || {}),
    };
    setState({ profile: mergedProfile, supabaseError: null });
    return mergedProfile;
  };

  const setDisplayName = async (name) => {
    const loggedIn = Boolean(state.session && state.supabaseReady && !state.supabaseError);
    if (!loggedIn) {
      const snapshot = store.setProfileName(name);
      setState({ profile: state.profile });
      return snapshot;
    }

    const { data, error } = await upsertProfile({ id: state.session.user.id, display_name: name });
    if (error) {
      setState({ supabaseError: error.message || String(error) });
      return null;
    }

    setState({ profile: data });
    syncProfileToStore(name);
    return data;
  };

  store.subscribeProfile(() => notify());

  const authUnsubscribe = onAuthStateChange((event, _session, error) => {
    if (error) {
      setState({ supabaseError: error.message || String(error) });
      return;
    }
    if (event === 'SIGNED_OUT') {
      setState({ session: null, profile: null, supabaseReady: state.supabaseReady });
      return;
    }
    refreshSession();
  });

  refreshSession();

  const subscribe = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };

  return {
    getStatus,
    subscribe,
    login,
    logout,
    setDisplayName,
    saveProfileSettings,
    refreshSession,
    destroy: () => authUnsubscribe && authUnsubscribe(),
  };
};
