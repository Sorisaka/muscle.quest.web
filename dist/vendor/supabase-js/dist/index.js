// Minimal-but-functional Supabase auth client implementation for browsers.
// Replaces the previous stub that returned only { auth } without Supabase URL metadata.
//
// Flow note: this client now drives the PKCE OAuth flow end-to-end.
// - signInWithOAuth generates a code_verifier + code_challenge and stores them in
//   sessionStorage so the callback can exchange the authorization code.
// - exchangeCodeForSession calls /auth/v1/token?grant_type=pkce, persists the session, and emits
//   auth events for UI updates.

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

function getSessionStorageItem(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_error) {}
}

function setSessionStorageItem(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (_error) {}
}

function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (_error) {}
}

function removeSessionStorageItem(key) {
  try {
    sessionStorage.removeItem(key);
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

function loadSessionJson(key) {
  const raw = getSessionStorageItem(key);
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

function persistSessionJson(key, value) {
  setSessionStorageItem(key, JSON.stringify(value));
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

function toBase64Url(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer || 0);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomBytes(size) {
  try {
    const array = new Uint8Array(size);
    if (typeof crypto?.getRandomValues === 'function') {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < size; i += 1) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array;
  } catch (_error) {
    return null;
  }
}

async function sha256Base64Url(value) {
  if (!value || typeof value !== 'string') {
    throw new Error('code_verifier is required');
  }
  if (typeof crypto?.subtle?.digest !== 'function') {
    throw new Error('Crypto digest is not available in this environment.');
  }
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toBase64Url(digest);
}

function generateCodeVerifier() {
  const bytes = randomBytes(32);
  if (!bytes) throw new Error('Failed to generate code verifier');
  return toBase64Url(bytes);
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
  const pkceFlowType = (options.flowType || options.flow_type || 'pkce').toLowerCase();
  const isPkceEnabled = pkceFlowType === 'pkce';

  const readPkceState = () => loadSessionJson(pkceStorageKey);
  const savePkceState = (state) => persistSessionJson(pkceStorageKey, state);
  const clearPkceState = () => removeSessionStorageItem(pkceStorageKey);

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

      let pkceState = null;
      if (isPkceEnabled) {
        try {
          const codeVerifier = generateCodeVerifier();
          const codeChallenge = await sha256Base64Url(codeVerifier);

          pkceState = { codeVerifier, redirectTo };
          savePkceState(pkceState);

          authorizeUrl.searchParams.set('flow_type', 'pkce');
          authorizeUrl.searchParams.set('code_challenge_method', 'S256');
          authorizeUrl.searchParams.set('code_challenge', codeChallenge);
        } catch (error) {
          clearPkceState();
          return { data: null, error };
        }
      }

      const authorizeHref = authorizeUrl.toString();

      if (!oauthOptions.skipBrowserRedirect && authorizeHref) {
        window.location.assign(authorizeHref);
      }

      return { data: { url: authorizeHref, provider }, error: null };
    },

    async exchangeCodeForSession(input) {
      const pkceState = readPkceState();
      const parsed = (() => {
        if (!input) return { code: null, redirectTo: null };
        if (typeof input === 'string') {
          try {
            const url = new URL(input, window.location?.origin || undefined);
            const params = url.searchParams;
            const redirectTo = `${url.origin}${url.pathname}`;
            return { code: params.get('code') || input, redirectTo };
          } catch (_error) {
            return { code: input, redirectTo: null };
          }
        }
        return {
          code: input.code || null,
          redirectTo: input.redirectTo || null,
        };
      })();

      if (!parsed.code) {
        return { data: null, error: new Error('No authorization code found.') };
      }

      const redirectTo = normalizeUrl(pkceState?.redirectTo || parsed.redirectTo);

      const usePkceGrant = Boolean(pkceState?.codeVerifier) || isPkceEnabled;
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

      if (!session?.access_token && !session?.refresh_token) {
        emitter.emit('SIGNED_OUT', null, null);
        return { error: null };
      }

      const payload = { scope: 'global' };
      if (session?.refresh_token) {
        payload.refresh_token = session.refresh_token;
      }

      const { error } = await postJson(
        `${authBaseUrl}/logout`,
        supabaseKey,
        payload,
        session?.access_token || supabaseKey,
      );

      emitter.emit('SIGNED_OUT', null, null);
      return { error };
    },
  };

  return auth;
}

async function parseJsonResponse(response) {
  const contentType = response?.headers?.get?.('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }
  const text = await response.text().catch(() => null);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_error) {
    return text;
  }
}

function createPostgrestClient(supabaseUrl, supabaseKey, auth) {
  const normalizedUrl = normalizeUrl(supabaseUrl);

  const resolveAccessToken = async () => {
    if (typeof auth?.getSession !== 'function') return null;
    const { data } = await auth.getSession();
    return data?.session?.access_token || null;
  };

  class PostgrestQuery {
    constructor(table) {
      this.table = table;
      this.method = 'GET';
      this.params = {};
      this.body = null;
      this.headers = {};
      this.single = false;
    }

    select(columns = '*') {
      if (columns) {
        this.params.select = columns;
      }
      return this;
    }

    eq(column, value) {
      this.params[column] = `eq.${encodeURIComponent(value)}`;
      return this;
    }

    order(column, options = {}) {
      const ascending = options?.ascending !== false;
      this.params.order = `${column}.${ascending ? 'asc' : 'desc'}`;
      return this;
    }

    limit(count) {
      if (Number.isFinite(count)) {
        this.params.limit = count;
      }
      return this;
    }

    insert(values) {
      this.method = 'POST';
      this.body = values;
      this.headers.Prefer = 'return=representation';
      return this;
    }

    update(values) {
      this.method = 'PATCH';
      this.body = values;
      this.headers.Prefer = 'return=representation';
      return this;
    }

    maybeSingle() {
      this.single = true;
      this.headers.Accept = 'application/vnd.pgrst.object+json';
      return this;
    }

    async execute() {
      const url = new URL(`${normalizedUrl}/rest/v1/${this.table}`);
      Object.entries(this.params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });

      const accessToken = await resolveAccessToken().catch(() => null);
      const headers = { ...buildHeaders(supabaseKey, accessToken), ...this.headers };
      const requestInit = { method: this.method, headers };

      if (this.body !== null && this.body !== undefined && this.method !== 'GET') {
        requestInit.body = JSON.stringify(this.body);
      }

      const response = await fetch(url.toString(), requestInit);
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        const message = data?.error_description || data?.message || data?.error || response.statusText;
        return { data: null, error: new Error(message || 'Request failed') };
      }

      if (this.single) {
        if (!data) return { data: null, error: null };
        if (Array.isArray(data)) {
          if (data.length === 0) return { data: null, error: null };
          if (data.length === 1) return { data: data[0], error: null };
          return { data: null, error: new Error('Multiple rows returned') };
        }
      }

      return { data, error: null };
    }

    then(onFulfilled, onRejected) {
      return this.execute().then(onFulfilled, onRejected);
    }
  }

  const rpc = async (fn, args = {}) => {
    const accessToken = await resolveAccessToken().catch(() => null);
    const url = `${normalizedUrl}/rest/v1/rpc/${fn}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(supabaseKey, accessToken),
      body: JSON.stringify(args || {}),
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      const message = data?.error_description || data?.error || data?.message || response.statusText;
      return { data: null, error: new Error(message || 'Request failed') };
    }

    return { data, error: null };
  };

  return {
    from: (table) => new PostgrestQuery(table),
    rpc,
  };
}

export function createClient(supabaseUrl, supabaseKey, options = {}) {
  const auth = createAuthClient(supabaseUrl, supabaseKey, options.auth || {});
  const postgrest = createPostgrestClient(supabaseUrl, supabaseKey, auth);
  return { supabaseUrl: normalizeUrl(supabaseUrl), supabaseKey, auth, ...postgrest };
}

export default { createClient };
