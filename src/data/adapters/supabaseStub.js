import { createLocalPersistence } from './localPersistence.js';

// Supabase persistence is currently served by account/profile services.
// This stub returns the local adapter while keeping the factory signature.
export const createSupabasePersistence = (options = {}) => {
  console.warn('Supabase persistence stub: using local persistence instead.');
  return createLocalPersistence(options);
};
