const fs = require('fs');
const path = require('path');
const { createStoreProvider } = require('../store/storeProvider');

const KEY_ALIASES = {
  agreementVisit: 'agreementVisits',
  appointment: 'appointments',
  assetServiceHistory: 'assetServiceHistory',
  audit: 'audit',
  authEvent: 'authEvents',
  authSession: 'authSessions',
  checklist: 'checklists',
  communication: 'communications',
  customer: 'customers',
  customerAsset: 'customerAssets',
  dispatch: 'dispatch',
  estimate: 'estimates',
  export: 'exports',
  integrity: 'integrity',
  inventory: 'inventory',
  inventoryTransfer: 'inventoryTransfers',
  invoice: 'invoices',
  job: 'jobs',
  knowledgeArticle: 'knowledgeArticles',
  materialUsage: 'materialUsage',
  mediaAttachment: 'mediaAttachments',
  messageTemplate: 'messageTemplates',
  metric: 'metrics',
  notification: 'notifications',
  organizationUnit: 'organizationUnits',
  payment: 'payments',
  portalAccount: 'portalAccounts',
  portalBooking: 'portalBookings',
  priceBook: 'priceBook',
  purchaseOrder: 'purchaseOrders',
  report: 'reports',
  reportSchedule: 'reportSchedules',
  securityEvent: 'securityEvents',
  service: 'services',
  serviceAgreement: 'serviceAgreements',
  stockAdjustment: 'stockAdjustments',
  technician: 'technicians',
  tenantSettings: 'tenantSettings',
  timeEntry: 'timeEntries',
  user: 'users',
  vendor: 'vendors',
  warehouse: 'warehouses',
  workflow: 'workflows'
};

function keyFromCreator(name) {
  const base = name.replace(/^create/, '').replace(/Repository$/, '');
  const inferred = base.charAt(0).toLowerCase() + base.slice(1);
  return KEY_ALIASES[inferred] || inferred;
}

function discoverRepositoryCreators() {
  const creators = [];
  for (const file of fs.readdirSync(__dirname).sort()) {
    if (!file.endsWith('Repository.js') || file === 'repositoryFactory.js') continue;
    const exports = require(path.join(__dirname, file));
    for (const [name, creator] of Object.entries(exports)) {
      if (/^create.+Repository$/.test(name) && typeof creator === 'function') {
        creators.push({ key: keyFromCreator(name), name, creator, file });
      }
    }
  }
  return creators;
}

const repositoryCreators = discoverRepositoryCreators();
let singletonRepositories = null;

function createRepositories(store = createStoreProvider()) {
  const repositories = { store };
  for (const registration of repositoryCreators) {
    if (repositories[registration.key]) {
      throw new Error(`Duplicate repository key: ${registration.key}`);
    }
    repositories[registration.key] = registration.creator(store);
  }
  return repositories;
}

function getRepositories() {
  if (!singletonRepositories) singletonRepositories = createRepositories();
  return singletonRepositories;
}

function resetRepositoriesForTest() {
  singletonRepositories = null;
}

function listRepositoryRegistrations() {
  return repositoryCreators.map(({ key, name, file }) => ({ key, name, file }));
}

module.exports = {
  createRepositories,
  getRepositories,
  resetRepositoriesForTest,
  listRepositoryRegistrations
};
