const ACCOUNT_SESSION_KEY = 'musclequest:account';

const readSession = () => {
  try {
    const raw = localStorage.getItem(ACCOUNT_SESSION_KEY);
    if (!raw) return { loggedIn: false };
    const parsed = JSON.parse(raw);
    return { loggedIn: Boolean(parsed.loggedIn) };
  } catch (error) {
    return { loggedIn: false };
  }
};

const persistSession = (session) => {
  localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(session));
  return session;
};

export const createAccountState = (store) => {
  let session = readSession();
  const subscribers = new Set();

  const notify = () => {
    const snapshot = getStatus();
    subscribers.forEach((callback) => callback(snapshot));
  };

  const setSession = (next) => {
    session = persistSession(next);
    notify();
  };

  const getStatus = () => {
    const profile = store.getProfile();
    const pointSummary = store.getPointSummary();
    const loggedIn = Boolean(session.loggedIn);

    return {
      loggedIn,
      isGuest: !loggedIn,
      id: profile?.id || 'local-user',
      displayName: profile?.displayName || 'Guest',
      points: profile?.points || 0,
      completedRuns: profile?.completedRuns || 0,
      streak: pointSummary.streak || 0,
      totals: pointSummary.totals || { daily: 0, weekly: 0, monthly: 0 },
    };
  };

  const login = (displayName) => {
    if (displayName) {
      store.setProfileName(displayName);
    }
    setSession({ ...session, loggedIn: true });
  };

  const logout = () => {
    setSession({ ...session, loggedIn: false });
  };

  const setDisplayName = (name) => {
    store.setProfileName(name);
    const snapshot = getStatus();
    notify();
    return snapshot;
  };

  store.subscribeProfile(() => {
    notify();
  });

  const subscribe = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };

  return { getStatus, login, logout, setDisplayName, subscribe };
};
