// Minimal-but-functional Supabase auth client implementation for browsers.
// Replaces the previous stub that returned only { auth } without Supabase URL metadata.

const SESSION_KEY_PREFIX = 'musclequest:auth:session:';
const PKCE_KEY_PREFIX = 'musclequest:auth:pkce:';
const REFRESH_MARGIN_SECONDS = 60; // Refresh a minute before expiry when possible.

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

function normalizeUrl(url) {
  if (!url) return url;
  return url.replace(/\/+$/, '');
}

function hostFromUrl(url) {
  try {
    return new URL(url).host || 'unknown-host';
  } catch (_error) {
    return 'unknown-host';
  }
}

function storageKey(prefix, supabaseUrl) {
  return `${prefix}${hostFromUrl(supabaseUrl)}`;
}

function getStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_error) {}
}

function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (_error) {}
}

function loadJson(key) {
  const raw = getStorageItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function persistJson(key, value) {
  setStorageItem(key, JSON.stringify(value));
  return value;
}

function buildHeaders(apiKey, accessToken) {
  const headers = {
    apikey: apiKey,
    Authorization: `Bearer ${accessToken || apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Info': 'musclequest-embedded-supabase',
  };
  return headers;
}

function normalizeSession(response) {
  if (!response) return null;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresIn = response.expires_in ?? 3600;
  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    token_type: response.token_type || 'bearer',
    expires_in: expiresIn,
    expires_at: response.expires_at ?? nowSeconds + expiresIn,
    user: response.user || null,
    provider_token: response.provider_token,
    provider_refresh_token: response.provider_refresh_token,
  };
}

async function postJson(url, apiKey, payload, accessToken) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(apiKey, accessToken),
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data?.error_description || data?.error || data?.message || response.statusText;
      return { data, error: new Error(message) };
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

function createAuthClient(supabaseUrl, supabaseKey, options = {}) {
  const authBaseUrl = `${normalizeUrl(supabaseUrl)}/auth/v1`;
  const sessionStorageKey = storageKey(SESSION_KEY_PREFIX, supabaseUrl);
  const pkceStorageKey = storageKey(PKCE_KEY_PREFIX, supabaseUrl);

  const emitter = createEmitter();
  let memorySession = null;
  let inFlightRefresh = null;

  const persistSession = options.persistSession !== false;
  const autoRefreshToken = options.autoRefreshToken !== false;

  const readPkceState = () => loadJson(pkceStorageKey);
  const clearPkceState = () => removeStorageItem(pkceStorageKey);

  const readSession = () => {
    if (memorySession) return memorySession;
    if (!persistSession) return null;
    memorySession = loadJson(sessionStorageKey);
    return memorySession;
  };

  const saveSession = (session) => {
    memorySession = session;
    if (persistSession && session) {
      persistJson(sessionStorageKey, session);
    }
    if (!session && persistSession) {
      removeStorageItem(sessionStorageKey);
    }
    return session;
  };

  const refreshWithToken = async (refreshToken) => {
    const { data, error } = await postJson(
      `${authBaseUrl}/token?grant_type=refresh_token`,
      supabaseKey,
      { refresh_token: refreshToken },
      supabaseKey,
    );
    if (error) return { data: null, error };
    const session = normalizeSession(data);
    saveSession(session);
    emitter.emit('TOKEN_REFRESHED', session, null);
    return { data: { session }, error: null };
  };

  const auth = {
    async signInWithOAuth({ provider, options: oauthOptions = {} }) {
      if (!provider) {
        return { data: null, error: new Error('OAuth provider is required.') };
      }
      const redirectTo = oauthOptions.redirectTo;
      if (!redirectTo) {
        return { data: null, error: new Error('redirectTo is required for OAuth sign-in.') };
      }

      clearPkceState();

      const authorizeUrl = new URL(`${authBaseUrl}/authorize`);
      authorizeUrl.searchParams.set('provider', provider);
      authorizeUrl.searchParams.set('redirect_to', redirectTo);

      const authorizeHref = authorizeUrl.toString();

      if (!oauthOptions.skipBrowserRedirect && authorizeHref) {
        window.location.assign(authorizeHref);
      }

      return { data: { url: authorizeHref, provider }, error: null };
    },

    async exchangeCodeForSession(input) {
      const pkceState = readPkceState();
      const parsed = (() => {
        if (!input) return { code: null, state: null, redirectTo: null };
        if (typeof input === 'string') {
          try {
            const url = new URL(input, window.location?.origin || undefined);
            const params = url.searchParams;
            const redirectTo = `${url.origin}${url.pathname}`;
            return { code: params.get('code') || input, state: params.get('state'), redirectTo };
          } catch (_error) {
            return { code: input, state: null, redirectTo: null };
          }
        }
        return {
          code: input.code || null,
          state: input.state || null,
          redirectTo: input.redirectTo || null,
        };
      })();

      if (!parsed.code) {
        return { data: null, error: new Error('No authorization code found.') };
      }

      const redirectTo = normalizeUrl(pkceState?.redirectTo || parsed.redirectTo);
      const usePkceGrant = Boolean(pkceState?.codeVerifier);
      const tokenUrl = usePkceGrant
        ? `${authBaseUrl}/token?grant_type=pkce`
        : `${authBaseUrl}/token?grant_type=authorization_code`;

      const { data, error } = await postJson(
        tokenUrl,
        supabaseKey,
        {
          auth_code: parsed.code,
          code: parsed.code,
          code_verifier: pkceState?.codeVerifier,
          redirect_to: redirectTo,
        },
        supabaseKey,
      );

      clearPkceState();

      if (error) return { data: null, error };

      const session = normalizeSession(data);
      saveSession(session);
      emitter.emit('SIGNED_IN', session, null);
      return { data: { session }, error: null };
    },

    async getSession() {
      const existing = readSession();
      const nowSeconds = Math.floor(Date.now() / 1000);

      if (!existing) {
        return { data: { session: null }, error: null };
      }

      if (
        autoRefreshToken &&
        existing.refresh_token &&
        existing.expires_at &&
        existing.expires_at - REFRESH_MARGIN_SECONDS <= nowSeconds
      ) {
        if (!inFlightRefresh) {
          inFlightRefresh = refreshWithToken(existing.refresh_token).finally(() => {
            inFlightRefresh = null;
          });
        }
        const refreshed = await inFlightRefresh;
        if (refreshed?.data?.session) {
          return { data: { session: refreshed.data.session }, error: null };
        }
        if (refreshed?.error) {
          return { data: { session: existing }, error: refreshed.error };
        }
      }

      return { data: { session: existing }, error: null };
    },

    onAuthStateChange(callback) {
      return emitter.subscribe((event, session, error) => callback(event, session, error));
    },

    async signOut() {
      const session = readSession();
      saveSession(null);
      clearPkceState();

      if (!session?.access_token) {
        emitter.emit('SIGNED_OUT', null, null);
        return { error: null };
      }

      const { error } = await postJson(
        `${authBaseUrl}/logout`,
        supabaseKey,
        { scope: 'global' },
        session.access_token,
      );

      emitter.emit('SIGNED_OUT', null, null);
      return { error };
    },
  };

  return auth;
}

export function createClient(supabaseUrl, supabaseKey, options = {}) {
  const auth = createAuthClient(supabaseUrl, supabaseKey, options.auth || {});
  return { supabaseUrl: normalizeUrl(supabaseUrl), supabaseKey, auth };
}

export default { createClient };
