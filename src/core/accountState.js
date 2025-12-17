import { getRuntimeConfig, hasSupabaseCredentials } from '../lib/runtimeConfig.js';
import { getSession, onAuthStateChange, signInWithOAuth, signOut } from '../services/authService.js';
import { fetchProfile, upsertProfile } from '../services/profileService.js';

const ACCOUNT_SESSION_KEY = 'musclequest:account';

const DEFAULT_LOCAL_SESSION = { loggedIn: false, registered: false };

const readLocalSession = () => {
  try {
    const raw = localStorage.getItem(ACCOUNT_SESSION_KEY);
    if (!raw) return { ...DEFAULT_LOCAL_SESSION };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_LOCAL_SESSION, ...parsed };
  } catch (error) {
    return { ...DEFAULT_LOCAL_SESSION };
  }
};

const persistLocalSession = (session) => {
  const normalized = { ...DEFAULT_LOCAL_SESSION, ...session };
  localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(normalized));
  return normalized;
};

const missingConfigMessage = [
  'Supabase settings are missing.',
  'Create dist/config.js from dist/config.example.js with SUPABASE_URL and SUPABASE_ANON_KEY.',
  'Then retry OAuth sign-in to enable cloud sync.',
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

  const setState = (partial) => {
    state = { ...state, ...partial };
    notify();
  };

  const notify = () => {
    const snapshot = getStatus();
    subscribers.forEach((callback) => callback(snapshot));
  };

  const deriveDisplayName = () => {
    const profile = store.getProfile();
    const supaName = state.profile?.display_name;
    if (supaName) return supaName;
    if (profile?.displayName) return profile.displayName;
    if (state.session?.user?.email) return state.session.user.email;
    return 'Guest';
  };

  const getStatus = () => {
    const profile = store.getProfile();
    const pointSummary = store.getPointSummary();
    const loggedIn = Boolean(state.session && state.supabaseReady && !state.supabaseError);
    const hasAccount = Boolean(loggedIn || state.localSession.registered);

    return {
      loading: state.loading,
      supabaseReady: state.supabaseReady,
      supabaseError: state.supabaseError,
      session: state.session,
      profile: state.profile,
      loggedIn,
      isGuest: !loggedIn,
      hasAccount,
      id: loggedIn ? state.session?.user?.id || state.profile?.id : profile?.id || 'local-user',
      email: state.session?.user?.email || null,
      displayName: deriveDisplayName(),
      points: profile?.points || 0,
      completedRuns: profile?.completedRuns || 0,
      streak: pointSummary.streak || 0,
      totals: pointSummary.totals || { daily: 0, weekly: 0, monthly: 0 },
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
      localSession: session
        ? persistLocalSession({ ...state.localSession, loggedIn: true, registered: true })
        : state.localSession,
    });

    if (session?.user) {
      await loadProfile(session.user);
    }
  };

  const login = async (provider = 'github') => {
    const status = getStatus();
    if (!status.hasAccount) {
      return { data: null, error: new Error('そのアカウントは存在しません。') };
    }
    const result = await signInWithOAuth(provider);
    if (result?.error) {
      setState({ supabaseError: result.error.message || String(result.error) });
    }
    return result;
  };

  const signUp = async (provider = 'github') => {
    const status = getStatus();
    if (status.hasAccount) {
      return { data: null, error: new Error('そのアカウントは既に存在します。') };
    }
    const result = await signInWithOAuth(provider);
    if (result?.error) {
      setState({ supabaseError: result.error.message || String(result.error) });
      return result;
    }
    const localSession = persistLocalSession({ ...state.localSession, registered: true, loggedIn: true });
    setState({ localSession });
    return result;
  };

  const logout = async () => {
    await signOut();
    const localSession = persistLocalSession({ ...state.localSession, loggedIn: false });
    setState({
      session: null,
      profile: null,
      supabaseReady: true,
      supabaseError: null,
      localSession,
    });
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
    signUp,
    logout,
    setDisplayName,
    refreshSession,
    destroy: () => authUnsubscribe && authUnsubscribe(),
  };
};
