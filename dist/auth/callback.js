import { getSupabaseClient } from '../lib/supabaseClient.js';
import { buildAccountUrl, buildCallbackUrl, inferBasePath } from '../lib/basePath.js';
import { authError, authLog } from '../lib/authDebug.js';

const statusEl = document.querySelector('[data-status]');
const errorEl = document.querySelector('[data-error]');

function setStatus(message) {
  if (!statusEl) return;
  statusEl.textContent = message;
}

function showError(prefix, error) {
  if (!errorEl) return;
  const description = error?.message || error || 'Unknown error';
  setStatus('Sign-in failed. Returning to the app.');
  errorEl.textContent = `${prefix}\n${description}`;
  errorEl.hidden = false;
  authError(prefix, description);
}

function cleanCallbackUrl(basePath) {
  const cleanHref = buildCallbackUrl(basePath);
  if (typeof history.replaceState === 'function') {
    history.replaceState(null, '', cleanHref);
  } else {
    window.location.replace(cleanHref);
  }
}

function redirectToAccount(basePath) {
  const accountUrl = buildAccountUrl(basePath);
  // Allow the UI message to render before navigating.
  setTimeout(() => window.location.assign(accountUrl), 250);
}

async function handleCallback() {
  const basePath = inferBasePath(window.location.pathname || '/');
  const { client, ready, error } = getSupabaseClient();

  if (!client || !ready) {
    showError('Supabase configuration is missing.', error);
    cleanCallbackUrl(basePath);
    redirectToAccount(basePath);
    return;
  }

  const currentUrl = window.location.href;
  const params = new URL(currentUrl).searchParams;
  const hasAuthorizationCode = params.has('code');
  const code = params.get('code');
  const state = params.get('state');
  authLog('callback href', { href: currentUrl, hasCode: hasAuthorizationCode, state });

  try {
    setStatus(hasAuthorizationCode ? 'Exchanging authorization code…' : 'Checking existing session…');
    const result = hasAuthorizationCode
      ? await client.auth.exchangeCodeForSession({ code, state })
      : await client.auth.getSession();

    if (result?.error) {
      throw result.error;
    }

    const session = result?.data?.session || null;
    authLog('exchange result', session ? 'session established' : 'no session');

    setStatus('Sign-in complete. Redirecting…');
  } catch (caughtError) {
    showError('Authentication failed. Redirecting to account.', caughtError);
  } finally {
    // Remove sensitive query params/fragments to avoid redirect loops on reload.
    cleanCallbackUrl(basePath);
    redirectToAccount(basePath);
  }
}

handleCallback().catch((error) => {
  showError('Unexpected error during callback handling.', error);
});
