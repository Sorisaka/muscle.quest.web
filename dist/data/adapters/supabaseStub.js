import { createSupabaseAdapter } from '../../services/supabase/supabaseAdapter.js';

export const createSupabasePersistence = (options = {}) => createSupabaseAdapter(options);
