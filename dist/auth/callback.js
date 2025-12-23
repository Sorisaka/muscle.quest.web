import { getSupabaseClient } from '../lib/supabaseClient.js';
import { buildAccountUrl, buildCallbackUrl, inferBasePath } from '../lib/basePath.js';
import { authError, authLog } from '../lib/authDebug.js';

const statusEl = document.querySelector('[data-status]');
const errorEl = document.querySelector('[data-error]');

const basePath = inferBasePath(window.location.pathname || '/');
const origin = window.location.origin;
const callbackHref = buildCallbackUrl(basePath, origin);
const accountHref = buildAccountUrl(basePath, origin);

function parseAuthParams(search, hash) {
  const params = new URLSearchParams(search || '');
  const hadCodeInSearch = params.has('code');

  const fragment = (hash || '').replace(/^#/, '');
  if (fragment) {
    const queryIndex = fragment.indexOf('?');
    const fragmentQuery = queryIndex >= 0 ? fragment.slice(queryIndex + 1) : fragment;
    if (fragmentQuery) {
      const hashParams = new URLSearchParams(fragmentQuery);
      ['code', 'state', 'error', 'error_description'].forEach((key) => {
        if (!params.has(key) && hashParams.has(key)) {
          params.set(key, hashParams.get(key));
        }
      });
    }
  }

  const codeFromHash = !hadCodeInSearch && params.has('code');

  return { params, codeFromHash };
}

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function showError(message) {
  setStatus('Sign-in failed.');
  if (errorEl) {
    errorEl.hidden = false;
    errorEl.textContent = message;
  }
}

function cleanCallbackUrl() {
  if (typeof history.replaceState === 'function') {
    history.replaceState(null, '', callbackHref);
  } else {
    window.location.replace(callbackHref);
  }
}

function redirectToAccount() {
  window.location.replace(accountHref);
}

async function run() {
  const { client, ready, error } = getSupabaseClient();
  if (!client || !ready) {
    showError('Supabase credentials are missing. Please configure the app and try again.');
    authError('callback client missing', error?.message || error);
    return;
  }

  const loadedHref = window.location.href;
  const { params, codeFromHash } = parseAuthParams(window.location.search, window.location.hash);
  const code = params.get('code');
  const state = params.get('state');
  const oauthError = params.get('error');
  const oauthErrorDescription = params.get('error_description');
  const hasCode = Boolean(code);

  const initialSessionResult = await client.auth.getSession();
  const initialHasSession = Boolean(initialSessionResult?.data?.session);

  authLog('callback loaded', {
    href: loadedHref,
    hasCode,
    codeFromHash,
    callbackHref,
    accountHref,
    initialHasSession,
  });

  if (initialHasSession) {
    cleanCallbackUrl();
    setStatus('Sign-in complete. Redirecting…');
    redirectToAccount();
    return;
  }

  if (oauthError) {
    const message = oauthErrorDescription || oauthError || 'OAuth failed.';
    showError(message);
    authError('callback oauth error', { oauthError, oauthErrorDescription });
    return;
  }

  let exchangeError = null;
  if (hasCode) {
    const exchangeHref = codeFromHash
      ? (() => {
          const url = new URL(callbackHref);
          url.searchParams.set('code', code);
          if (state) url.searchParams.set('state', state);
          return url.toString();
        })()
      : loadedHref;

    try {
      const exchangeResult = await client.auth.exchangeCodeForSession(exchangeHref);
      exchangeError = exchangeResult?.error || null;
      authLog('exchangeCodeForSession', exchangeError?.message || 'success');
    } catch (caught) {
      exchangeError = caught;
      authError('exchangeCodeForSession threw', caught?.message || caught);
    }
  } else {
    authLog('callback no code present', null);
  }

  const sessionResult = await client.auth.getSession();
  const hasSession = Boolean(sessionResult?.data?.session);
  authLog('post-callback getSession', { hasSession });

  if (exchangeError) {
    showError('Authentication failed. Please try signing in again.');
    return;
  }

  if (!hasCode && !hasSession) {
    showError('Authentication failed. Please try signing in again.');
    return;
  }

  if (hasCode && !hasSession) {
    showError('Authentication failed. Please try signing in again.');
    return;
  }

  cleanCallbackUrl();
  setStatus('Sign-in complete. Redirecting…');
  redirectToAccount();
}

run().catch((caught) => {
  authError('callback fatal', caught?.message || caught);
  showError('Unexpected error during sign-in. Please try again.');
});
