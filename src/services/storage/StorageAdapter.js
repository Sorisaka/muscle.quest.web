import { createLocalPersistence } from '../../data/adapters/localPersistence.js';
// Supabase-backed persistence is currently handled directly by auth/profile services.
// The storage adapter only provides local persistence and warns when a Supabase
// driver is requested.

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
  supabase: () => {
    console.warn(
      'Supabase storage driver is not available; falling back to local persistence. Profile sync uses profileService directly.'
    );
    return createLocalPersistence();
  },
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
