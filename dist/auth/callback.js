import { getSupabaseClient } from '../lib/supabaseClient.js';
import { buildAccountUrl, buildCallbackUrl, inferBasePath } from '../lib/basePath.js';
import { authError, authLog } from '../lib/authDebug.js';

const statusEl = document.querySelector('[data-status]');
const errorEl = document.querySelector('[data-error]');
const actionEl = document.querySelector('[data-action]');

function setStatus(message) {
  if (!statusEl) return;
  statusEl.textContent = message;
}

function setActionLink(href, label) {
  if (!actionEl) return;
  if (!href) {
    actionEl.hidden = true;
    actionEl.textContent = '';
    return;
  }
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.textContent = label || 'Try signing in again';
  anchor.rel = 'noopener noreferrer';
  actionEl.innerHTML = '';
  actionEl.append(anchor);
  actionEl.hidden = false;
}

function showError(prefix, error, actionHref) {
  if (!errorEl) return;
  const description = error?.message || error || 'Unknown error';
  setStatus('Sign-in failed.');
  setActionLink(actionHref, 'Return to sign-in');
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
  const accountUrl = buildAccountUrl(basePath);
  const { client, ready, error } = getSupabaseClient();

  if (!client || !ready) {
    showError('Supabase configuration is missing.', error, accountUrl);
    cleanCallbackUrl(basePath);
    return;
  }

  const currentUrl = window.location.href;
  const params = new URL(currentUrl).searchParams;
  const hasAuthorizationCode = params.has('code');
  const errorCode = params.get('error_code');
  const errorDescription = params.get('error_description') || params.get('error');
  const state = params.get('state');
  authLog('callback href', {
    href: currentUrl,
    hasCode: hasAuthorizationCode,
    state,
    errorCode,
  });

  if (!hasAuthorizationCode && (errorCode || errorDescription)) {
    showError(
      'Authentication was rejected.',
      `${errorCode || 'error'}: ${errorDescription || 'Unknown error'}`,
      accountUrl,
    );
    cleanCallbackUrl(basePath);
    return;
  }

  try {
    setStatus(hasAuthorizationCode ? 'Exchanging authorization code…' : 'Checking existing session…');
    const result = hasAuthorizationCode
      ? await client.auth.exchangeCodeForSession(currentUrl)
      : await client.auth.getSession();

    if (result?.error) {
      throw result.error;
    }

    const session = result?.data?.session || null;
    authLog('exchange result', session ? 'session established' : 'no session');

    cleanCallbackUrl(basePath);

    const sessionCheck = await client.auth.getSession();
    const sessionPresent = Boolean(sessionCheck?.data?.session);
    authLog('post-exchange getSession', {
      hasSession: sessionPresent,
      userId: sessionCheck?.data?.session?.user?.id || null,
    });

    setStatus('Sign-in complete. Redirecting…');
  } catch (caughtError) {
    showError('Authentication failed. Redirecting to account.', caughtError, accountUrl);
  } finally {
    redirectToAccount(basePath);
  }
}

handleCallback().catch((error) => {
  showError('Unexpected error during callback handling.', error);
});
