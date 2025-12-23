import { getSupabaseClient } from '../lib/supabaseClient.js';
import { buildAccountUrl, buildCallbackUrl, inferBasePath } from '../lib/basePath.js';
import { authError, authLog } from '../lib/authDebug.js';

const statusEl = document.querySelector('[data-status]');
const errorEl = document.querySelector('[data-error]');

const basePath = inferBasePath(window.location.pathname || '/');
const origin = window.location.origin;
const callbackHref = buildCallbackUrl(basePath, origin);
const accountHref = buildAccountUrl(basePath, origin);

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
  const params = new URL(loadedHref).searchParams;
  const hasCode = params.has('code');

  authLog('callback loaded', { href: loadedHref, hasCode, callbackHref, accountHref });

  let exchangeError = null;
  if (hasCode) {
    try {
      const exchangeResult = await client.auth.exchangeCodeForSession(loadedHref);
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

  if (exchangeError || (!hasSession && hasCode)) {
    showError('Authentication failed. Please try signing in again.');
    cleanCallbackUrl();
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
