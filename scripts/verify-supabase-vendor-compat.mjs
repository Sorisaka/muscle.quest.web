import { createClient } from '../vendor/supabase-js/dist/index.js';

const calls = [];

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  calls.push({ url: String(url), init });

  if (String(url).includes('/body_metrics')) {
    return {
      ok: true,
      headers: { get: (name) => (name?.toLowerCase() === 'content-type' ? 'application/json' : null) },
      json: async () => [{ user_id: 'u1', date: '2026-03-04', weight_kg: 70, body_fat_pct: 15 }],
      text: async () => '',
      statusText: 'OK',
    };
  }

  return {
    ok: true,
    headers: { get: (name) => (name?.toLowerCase() === 'content-type' ? 'application/json' : null) },
    json: async () => [],
    text: async () => '',
    statusText: 'OK',
  };
};

try {
  const client = createClient('https://example.supabase.co', 'anon-key');

  if (typeof client.from('body_metrics').upsert !== 'function') {
    throw new Error('upsert is not defined');
  }

  const upsertResult = await client
    .from('body_metrics')
    .upsert({ user_id: 'u1', date: '2026-03-04', weight_kg: 70 }, { onConflict: 'user_id,date' })
    .select('user_id,date,weight_kg')
    .maybeSingle();

  if (upsertResult.error) {
    throw new Error(`Unexpected upsert error: ${upsertResult.error.message}`);
  }

  const rangeResult = await client
    .from('body_metrics')
    .select('*')
    .eq('user_id', 'u1')
    .gte('date', '2026-03-01')
    .lte('date', '2026-03-31');

  if (rangeResult.error) {
    throw new Error(`Unexpected range error: ${rangeResult.error.message}`);
  }

  const [upsertCall, rangeCall] = calls;
  const upsertUrl = new URL(upsertCall.url);
  const rangeUrl = new URL(rangeCall.url);

  if (upsertUrl.searchParams.get('on_conflict') !== 'user_id,date') {
    throw new Error('on_conflict query param was not set correctly');
  }

  const prefer = String(upsertCall.init?.headers?.Prefer || '');
  if (!prefer.includes('resolution=merge-duplicates')) {
    throw new Error('upsert request is missing resolution=merge-duplicates Prefer header');
  }

  const dateFilters = rangeUrl.searchParams.getAll('date');
  if (!dateFilters.includes('gte.2026-03-01')) {
    throw new Error('gte filter was not applied');
  }

  if (!dateFilters.includes('lte.2026-03-31')) {
    throw new Error('lte filter was not applied');
  }

  if (rangeUrl.searchParams.get('user_id') !== 'eq.u1') {
    throw new Error('eq filter was not applied');
  }

  console.log('Vendor supabase compatibility checks passed.');
} finally {
  globalThis.fetch = originalFetch;
}
