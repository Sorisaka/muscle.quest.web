import { getSupabaseClient } from '../lib/supabaseClient.js';
import { buildAccountUrl, buildCallbackUrl, inferBasePath } from '../lib/basePath.js';
import {
  authError,
  authLog,
  maskToken,
  sanitizeSessionForLog,
  sanitizeUrlForLog,
} from '../lib/authDebug.js';

/*
  OAuth callback flow expectations

  - PKCE (expected): /auth/v1/authorize -> /auth/callback.html?code=... (+ optional Supabase-managed state)
    -> exchangeCodeForSession() -> /auth/v1/token
  - Implicit fallback (observed): /auth/v1/authorize (no code_challenge) -> /auth/v1/callback#access_token=...
    -> no code to exchange, session remains null

  We log only masked tokens and sanitized URLs to trace where the flow stops without leaking secrets.
*/

const statusEl = document.querySelector('[data-status]');
const errorEl = document.querySelector('[data-error]');
const errorActionsEl = document.querySelector('[data-error-actions]');
const errorBackEl = document.querySelector('[data-error-back]');
const errorRetryEl = document.querySelector('[data-error-retry]');

const basePath = inferBasePath(window.location.pathname || '/');
const origin = window.location.origin;
const callbackHref = buildCallbackUrl(basePath, origin);
const accountHref = buildAccountUrl(basePath, origin);

function parseFragmentParams(fragment) {
  if (!fragment) return new URLSearchParams();

  try {
    const trimmed = fragment.startsWith('#') ? fragment.slice(1) : fragment;
    const queryIndex = trimmed.indexOf('?');
    const searchPart = queryIndex >= 0 ? trimmed.slice(queryIndex + 1) : trimmed;
    if (!searchPart || !searchPart.includes('=')) return new URLSearchParams();
    return new URLSearchParams(searchPart);
  } catch (_error) {
    return new URLSearchParams();
  }
}

function parseAuthParams(locationHref, locationHash) {
  try {
    const parsedUrl = new URL(locationHref);
    const searchParams = parsedUrl.searchParams;
    // Some identity providers return code/state inside the URL fragment when using hash routing.
    // Parse both query and hash to avoid missing the PKCE code.
    const fragmentParams = parseFragmentParams(locationHash ?? parsedUrl.hash);

    const hasQueryParams =
      searchParams.has('code') || searchParams.has('error') || searchParams.has('error_description');
    const hasHashParams =
      fragmentParams.has('code') || fragmentParams.has('error') || fragmentParams.has('error_description');

    const source = hasQueryParams ? 'query' : hasHashParams ? 'hash' : 'none';
    const params = source === 'query' ? searchParams : source === 'hash' ? fragmentParams : new URLSearchParams();

    return {
      code: params.get('code'),
      state: params.get('state'),
      error: params.get('error'),
      errorDescription: params.get('error_description'),
      source,
    };
  } catch (error) {
    authError('callback url parse failed', error?.message || error);
    return {
      code: null,
      state: null,
      error: null,
      errorDescription: null,
      source: 'none',
    };
  }
}

function sanitizeAuthParamsForLog(params) {
  return {
    source: params.source,
    hasCode: Boolean(params.code),
    code: maskToken(params.code),
    hasState: Boolean(params.state),
    state: params.state ? `${params.state.slice(0, 4)}…${params.state.slice(-4)}` : null,
    error: params.error,
    errorDescription: params.errorDescription,
  };
}

function summarizeFragmentTokens(fragment) {
  const params = parseFragmentParams(fragment);
  const keys = Array.from(params.keys());
  return {
    keys,
    hasAccessToken: params.has('access_token'),
    hasRefreshToken: params.has('refresh_token'),
    hasProviderToken: params.has('provider_token') || params.has('provider_refresh_token'),
    tokens: {
      accessToken: maskToken(params.get('access_token')),
      refreshToken: maskToken(params.get('refresh_token')),
      providerToken: maskToken(params.get('provider_token')),
      providerRefreshToken: maskToken(params.get('provider_refresh_token')),
    },
  };
}

function summarizeLocationForLog(locationHref, locationHash, fragmentSummary) {
  let searchKeys = [];
  try {
    searchKeys = Array.from(new URL(locationHref).searchParams.keys());
  } catch (_error) {}

  return {
    href: sanitizeUrlForLog(locationHref),
    hashPresent: Boolean(locationHash),
    hashKeys: fragmentSummary.keys,
    searchKeys,
  };
}

function logSession(label, sessionResult) {
  const session = sessionResult?.data?.session;
  authLog(label, { hasSession: Boolean(session), session: sanitizeSessionForLog(session) });
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
  if (errorActionsEl) {
    errorActionsEl.hidden = false;
  }
}

function cleanCallbackUrl() {
  // Always strip query/hash so reloading the page does not re-run the exchange.
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
  const locationHash = window.location.hash;
  const authParams = parseAuthParams(loadedHref, locationHash);
  const fragmentSummary = summarizeFragmentTokens(locationHash);
  const locationSummary = summarizeLocationForLog(loadedHref, locationHash, fragmentSummary);
  const sanitizedAuthParams = sanitizeAuthParamsForLog(authParams);
  const hasCode = Boolean(authParams.code);

  const preflightSession = await client.auth.getSession();

  if (errorBackEl) {
    errorBackEl.href = accountHref;
  }
  if (errorRetryEl) {
    errorRetryEl.href = accountHref;
  }

  authLog('callback loaded', {
    location: locationSummary,
    callbackHref: sanitizeUrlForLog(callbackHref),
    accountHref: sanitizeUrlForLog(accountHref),
  });
  authLog('callback fragment tokens', fragmentSummary);
  authLog('callback auth params', sanitizedAuthParams);
  logSession('callback pre-flight session', preflightSession);

  if (authParams.error || authParams.errorDescription) {
    showError(authParams.errorDescription || authParams.error || 'Authentication failed. Please try again.');
    authError('callback received oauth error', {
      error: authParams.error,
      errorDescription: authParams.errorDescription,
      source: authParams.source,
    });
    cleanCallbackUrl();
    return;
  }

  if (!hasCode) {
    if (fragmentSummary.hasAccessToken || fragmentSummary.hasRefreshToken) {
      authLog('callback implicit fragment detected', {
        fragmentSummary,
        message: 'Tokens present in hash but no authorization code; PKCE exchange skipped.',
      });
    }

    const hasSession = Boolean(preflightSession?.data?.session);
    authLog('callback no code present', {
      hasSession,
      fragmentSummary,
      session: sanitizeSessionForLog(preflightSession?.data?.session),
    });

    if (!hasSession) {
      showError('No OAuth code found. Please retry sign-in.');
      cleanCallbackUrl();
      return;
    }

    cleanCallbackUrl();
    setStatus('Sign-in complete. Redirecting…');
    redirectToAccount();
    return;
  }

  const exchangeUrl = new URL(callbackHref);
  exchangeUrl.searchParams.set('code', authParams.code);

  authLog('exchangeCodeForSession invoking', {
    url: sanitizeUrlForLog(exchangeUrl.toString()),
    codeSource: authParams.source,
    code: maskToken(authParams.code),
    statePresent: Boolean(authParams.state),
    stateForwarded: false,
  });

  let exchangeError = null;
  try {
    const exchangeResult = await client.auth.exchangeCodeForSession(exchangeUrl.toString());
    exchangeError = exchangeResult?.error || null;
    authLog('exchangeCodeForSession result', exchangeError?.message || 'success');
  } catch (caught) {
    exchangeError = caught;
    authError('exchangeCodeForSession threw', caught?.message || caught);
  }

  const sessionResult = await client.auth.getSession();
  logSession('post-callback getSession', sessionResult);
  const hasSession = Boolean(sessionResult?.data?.session);

  if (exchangeError || !hasSession) {
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
