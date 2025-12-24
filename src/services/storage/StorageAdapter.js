import { createLocalPersistence } from '../../data/adapters/localPersistence.js';
import { createSupabaseAdapter } from '../supabase/supabaseAdapter.js';

const REQUIRED_METHODS = [
  'loadProfile',
  'saveProfile',
  'recordResult',
  'updateDisplayName',
  'loadLeaderboard',
  'loadHistory',
  'saveLastPlan',
  'getLastPlan',
];

const adapterFactories = {
  local: () => createLocalPersistence(),
  supabase: (options) => createSupabaseAdapter(options),
};

const ensureInterface = (adapter, driver) => {
  const safeAdapter = { ...adapter };
  REQUIRED_METHODS.forEach((method) => {
    if (typeof safeAdapter[method] !== 'function') {
      console.warn(`Storage adapter "${driver}" is missing method: ${method}`);
      safeAdapter[method] = (...args) => {
        console.warn(`Storage adapter "${driver}" stub called for ${method}.`, args);
        return method.startsWith('get') || method.startsWith('load') ? null : undefined;
      };
    }
  });
  return safeAdapter;
};

export const createStorageAdapter = (driver = 'local', options = {}) => {
  const factory = adapterFactories[driver] || adapterFactories.local;
  const adapter = factory(options) || {};
  return ensureInterface(adapter, driver);
};

export const listStorageDrivers = () => Object.keys(adapterFactories);
