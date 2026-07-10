const { createStoreProvider } = require('../store/storeProvider');
const { createPrivacyDsarOpsRepository } = require('./privacyDsarOpsRepository');
const { createPrivacyCaseOrchestrationRepository } = require('./privacyCaseOrchestrationRepository');
let singletonRepositories = null;
function createRepositories(store = createStoreProvider()) {
  let existing = {};
  try { const prior = require('./repositoryFactory.previous'); existing = prior.createRepositories ? prior.createRepositories(store) : {}; } catch (_) { existing = { store }; }
  return {
    ...existing,
    store,
    privacyDsarOps: createPrivacyDsarOpsRepository(store),
    privacyCaseOrchestration: createPrivacyCaseOrchestrationRepository(store)
  };
}
function getRepositories() { if (!singletonRepositories) singletonRepositories = createRepositories(); return singletonRepositories; }
function resetRepositoriesForTest() { singletonRepositories = null; }
module.exports = { createRepositories, getRepositories, resetRepositoriesForTest };
