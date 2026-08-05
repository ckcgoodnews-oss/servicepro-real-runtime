const fs = require('fs');
const path = require('path');
const { createStoreProvider } = require('../store/storeProvider');
const { createTenantStore } = require('../store/tenantStore');

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
  workflow: 'workflows',
  workspace: 'workspaces',
  trial: 'trials',
  trialSite: 'trialSites',
  deal: 'deals',
  recordAssociation: 'recordAssociations',
  activityTimeline: 'activityTimeline',
  crmContact: 'crmContacts',
  crmPropertyDefinition: 'crmPropertyDefinitions',
  task: 'tasks',
  leadAssignmentRule: 'leadAssignmentRules',
  board: 'boards',
  ticket: 'tickets',
  audienceSegment: 'audienceSegments',
  leadCaptureForm: 'leadCaptureForms',
  campaignAttribution: 'campaignAttributions',
  dashboard: 'customDashboards',
  aiInsight: 'aiInsights',
  salesSequence: 'salesSequences',
  meetingBooking: 'meetingBookings',
  callLog: 'callLogs',
  automationRule: 'automationRules',
  dataImport: 'dataImports'
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

// The base store is a singleton — one pool shared across all requests.
let baseStore = null;

function getBaseStore() {
  if (!baseStore) baseStore = createStoreProvider();
  return baseStore;
}

/**
 * Build a repositories object backed by the given store.
 * For JSON store: a single singleton is fine (no connection context needed).
 * For Postgres: called per-request with a tenant-scoped store so every query
 * automatically runs after `SET LOCAL app.current_tenant = tenantId`.
 */
function createRepositories(store) {
  const repositories = { store };
  for (const registration of repositoryCreators) {
    if (repositories[registration.key]) {
      throw new Error(`Duplicate repository key: ${registration.key}`);
    }
    repositories[registration.key] = registration.creator(store);
  }
  return repositories;
}

// JSON-store singleton — safe because JSON has no connection state.
let jsonSingletonRepositories = null;

/**
 * Returns a repositories object appropriate for the request.
 *
 * - JSON store: returns the global singleton (no RLS needed).
 * - Postgres store: returns a fresh set of repositories backed by a
 *   tenant-scoped store wrapper so RLS context is set on every query.
 *   The underlying pg.Pool is still shared; only the store wrapper is new.
 */
function getRepositoriesForTenant(tenantId) {
  const store = getBaseStore();

  if (store.type === 'json') {
    if (!jsonSingletonRepositories) jsonSingletonRepositories = createRepositories(store);
    return jsonSingletonRepositories;
  }

  // Postgres: wrap the shared pool in a tenant-scoped store for this request.
  const tenantStore = createTenantStore(store, tenantId);
  return createRepositories(tenantStore);
}

/**
 * Legacy helper — returns the global repositories (no tenant scoping).
 * Used during server startup and for platform-admin operations that
 * intentionally bypass tenant isolation.
 * @deprecated Prefer getRepositoriesForTenant(tenantId) in request handlers.
 */
function getRepositories() {
  const store = getBaseStore();
  if (store.type === 'json') {
    if (!jsonSingletonRepositories) jsonSingletonRepositories = createRepositories(store);
    return jsonSingletonRepositories;
  }
  return createRepositories(store);
}

function resetRepositoriesForTest() {
  jsonSingletonRepositories = null;
  baseStore = null;
}

function listRepositoryRegistrations() {
  return repositoryCreators.map(({ key, name, file }) => ({ key, name, file }));
}

module.exports = {
  createRepositories,
  getRepositories,
  getRepositoriesForTenant,
  getBaseStore,
  resetRepositoriesForTest,
  listRepositoryRegistrations
};
