import { createSupabaseClient, resolveRuntimeConfig } from './supabaseClientStub.js';

const notReady = (method) => {
  console.warn(`Supabase adapter stub invoked: ${method}`);
};

export const createSupabaseAdapter = (options = {}) => {
  const client = createSupabaseClient(options);
  const config = resolveRuntimeConfig(options.runtimeConfig || {});

  const baseProfile = {
    id: 'supabase-user',
    displayName: config.profileDisplayName || 'Cloud Guest',
    points: 0,
    completedRuns: 0,
    lastResult: null,
  };

  const loadProfile = () => ({ ...baseProfile });
  const saveProfile = (profile) => ({ ...profile });
  const recordResult = (result) => {
    notReady('recordResult');
    return { ...result, recordedWith: 'supabase-stub' };
  };

  const updateDisplayName = (name) => {
    notReady('updateDisplayName');
    return { ...baseProfile, displayName: name || baseProfile.displayName };
  };

  const loadLeaderboard = () => {
    notReady('loadLeaderboard');
    return [];
  };

  const loadHistory = () => {
    notReady('loadHistory');
    return [];
  };

  const saveLastPlan = (questId, difficulty, plan) => {
    notReady('saveLastPlan');
    return { questId, difficulty, plan };
  };

  const getLastPlan = () => null;

  return {
    client,
    loadProfile,
    saveProfile,
    recordResult,
    updateDisplayName,
    loadLeaderboard,
    loadHistory,
    saveLastPlan,
    getLastPlan,
  };
};
