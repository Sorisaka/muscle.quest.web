# Supabase Audit

## 1. Current architecture (simplified)

```
window.__APP_CONFIG__ (dist/config.js) -- read via runtimeConfig
        |
        v
lib/supabaseClient -> vendor/supabase-js/dist/index.js (auth-only client)
        |
        +--> authService (OAuth helpers) -> src/auth/callback.js (code exchange)
        |
        +--> profileService (REST fetch to /rest/v1/profiles)
        |
        +--> accountState (wires auth/profile into UI store)

storage/StorageAdapter -> localPersistence (Supabase driver falls back to local; account/profile sync stays in profileService)
```

## 2. Root cause of `client.from is not a function`

* The embedded vendor client implements only `createClient` with `{ supabaseUrl, supabaseKey, auth }` and **no database schema helpers** such as `from` / `rpc`.
* Earlier versions of `profileService` called `client.from('profiles')...`, which triggered `client.from is not a function` at runtime despite auth working via PKCE/OAuth.
* The current implementation avoids the mismatch by using direct REST calls (`/rest/v1/profiles`) with bearer/apikey headers, so database access no longer depends on `client.from`.

## 3. Configuration handling gaps (keys / redirect)

* Runtime config is expected on `window.__APP_CONFIG__` (`supabaseUrl`, `supabaseAnonKey`, `oauthRedirectTo`). `dist/config.js` is **not checked into the repo** and `scripts/build.js` copies `dist/config.example.js` when missing, so builds silently fall back to placeholder values unless CI injects real secrets.
* The example file exposes only placeholders for `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `OAUTH_REDIRECT_TO` (now redacted by default); there is no validation that a supplied redirect matches the Supabase project settings. When omitted or mis-set, `authService`/`callback.js` surface only generic errors.
* Because bundling is avoided, secrets live in a global object. Any deploy that ships `dist/config.example.js` unchanged will never have credentials, leading `getSupabaseClient` to return `{ client: null, error: 'Supabase credentials were not found.' }` and stopping Supabase features entirely.

## 4. Remediation options (respecting "no bundler")

* **A. Rework `profileService` to use REST fetch** (implemented)
  * Call `fetch` directly against `${supabaseUrl}/rest/v1/profiles` with `apikey`/`Authorization` headers from runtime config. Handles profiles without needing the JS client library. Keeps auth client minimal.
* **B. Extend the embedded vendor client with `from`** (deprioritized)
  * Implement a lightweight PostgREST query builder (`from`, `select`, `eq`, `maybeSingle`, `upsert`) inside `vendor/supabase-js/dist/index.js` to match the methods `profileService` expects. Minimal change footprint but must mirror Supabase semantics manually.
* **C. Add official `@supabase/supabase-js` without bundler** (future option)
  * Use the ESM bundle via `<script type="module">` or ship the CDN build into `vendor/` and expose it without a bundler. Provides full API compatibility (including `from`) at the cost of a larger payload; must ensure tree-shaking is not relied upon.

Supabase-backed persistence beyond auth/profile remains routed through `profileService`; storage adapters default to local until a full Supabase driver is implemented. All options must also ensure `dist/config.js` is generated with real `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and a redirect URL registered in the Supabase OAuth settings to keep PKCE working.
