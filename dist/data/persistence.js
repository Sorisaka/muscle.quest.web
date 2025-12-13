import { createStorageAdapter } from '../services/storage/StorageAdapter.js';

export const createPersistence = (driver = 'local', options = {}) => createStorageAdapter(driver, options);
