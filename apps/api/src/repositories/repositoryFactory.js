const { createStoreProvider } = require('../store/storeProvider');
const { createPrivacyDsarOpsRepository } = require('./privacyDsarOpsRepository');
let singletonRepositories = null;
function createRepositories(store = createStoreProvider()) {
  let existing = {};
  try { const prior = require('./repositoryFactory.previous'); existing = prior.createRepositories ? prior.createRepositories(store) : {}; } catch (_) { existing = { store }; }
  return { ...existing, store, privacyDsarOps: createPrivacyDsarOpsRepository(store) };
}
function getRepositories() { if (!singletonRepositories) singletonRepositories = createRepositories(); return singletonRepositories; }
function resetRepositoriesForTest() { singletonRepositories = null; }
module.exports = { createRepositories, getRepositories, resetRepositoriesForTest };
