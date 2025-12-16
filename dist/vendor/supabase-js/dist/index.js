// Minimal stub of @supabase/supabase-js for offline development.
// Provides a subset of the auth client interface used by the app.
function createEmitter() {
  const listeners = new Set();
  return {
    emit(event, session, error = null) {
      for (const listener of listeners) {
        try {
          listener(event, session, error);
        } catch (err) {
          console.error('Auth listener error', err);
        }
      }
    },
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

export function createClient(_url, _key, options = {}) {
  let session = null;
  const emitter = createEmitter();
  const redirectTo = options?.auth?.options?.redirectTo;

  const auth = {
    async getSession() {
      return { data: { session }, error: null };
    },
    async exchangeCodeForSession(_url) {
      const now = Math.floor(Date.now() / 1000);
      session = {
        provider: 'oauth',
        access_token: 'stub-token',
        expires_at: now + 3600,
      };
      emitter.emit('SIGNED_IN', session);
      return { data: { session }, error: null };
    },
    onAuthStateChange(callback) {
      return emitter.subscribe((event, sess, error) => {
        callback(event, sess); // mimic supabase-js signature
        if (error) {
          console.error(error);
        }
      });
    },
    async signInWithOAuth({ provider }) {
      const now = Math.floor(Date.now() / 1000);
      session = {
        provider,
        access_token: 'stub-token',
        expires_at: now + 3600,
      };
      emitter.emit('SIGNED_IN', session);
      return { data: { url: redirectTo || null }, error: null };
    },
    async signOut() {
      session = null;
      emitter.emit('SIGNED_OUT', null);
      return { error: null };
    },
  };

  return { auth };
}

export default { createClient };
