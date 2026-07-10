const { makeId, now } = require('../services/id');
const svc = require('../services/legalHoldService');

function createLegalHoldRepository(store) {
  if (store.type === 'json') return createJsonLegalHoldRepository(store);
  if (store.type === 'postgres') return createPostgresLegalHoldRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureLegal(data) {
  data.legalMatters ||= [];
  data.legalHolds ||= [];
  data.legalHoldCustodians ||= [];
  data.legalPreservationScopes ||= [];
  data.legalCollectionJobs ||= [];
  data.legalExportJobs ||= [];
  return data;
}

function createJsonLegalHoldRepository(store) {
  return {
    listMatters(filters = {}) {
      return ensureLegal(store.read()).legalMatters
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.matterType || x.matterType === filters.matterType)
        .sort((a, b) => String(b.openedAt).localeCompare(String(a.openedAt)));
    },
    createMatter(input) {
      const data = ensureLegal(store.read());
      const row = { id: makeId('matter'), ...svc.normalizeMatterInput(input), createdAt: now(), updatedAt: now() };
      row.matterNumber = row.matterNumber || `MAT-${String(data.legalMatters.length + 1).padStart(6, '0')}`;
      data.legalMatters.push(row);
      store.write(data);
      return row;
    },
    closeMatter(id) {
      const data = ensureLegal(store.read());
      const idx = data.legalMatters.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalMatters[idx] = svc.closeMatter(data.legalMatters[idx]);
      store.write(data);
      return data.legalMatters[idx];
    },
    createHold(input) {
      const data = ensureLegal(store.read());
      const row = { id: makeId('hold'), ...svc.normalizeHoldInput(input), createdAt: now(), updatedAt: now() };
      data.legalHolds.push(row);
      store.write(data);
      return row;
    },
    listHolds(filters = {}) {
      return ensureLegal(store.read()).legalHolds
        .filter(x => !filters.matterId || x.matterId === filters.matterId)
        .filter(x => !filters.status || x.status === filters.status);
    },
    issueHold(id, issuedBy) {
      const data = ensureLegal(store.read());
      const idx = data.legalHolds.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalHolds[idx] = svc.issueHold(data.legalHolds[idx], issuedBy);
      store.write(data);
      return data.legalHolds[idx];
    },
    releaseHold(id, releasedBy) {
      const data = ensureLegal(store.read());
      const idx = data.legalHolds.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalHolds[idx] = svc.releaseHold(data.legalHolds[idx], releasedBy);
      for (let i = 0; i < data.legalHoldCustodians.length; i++) {
        if (data.legalHoldCustodians[i].holdId === id) data.legalHoldCustodians[i] = svc.releaseCustodian(data.legalHoldCustodians[i]);
      }
      store.write(data);
      return data.legalHolds[idx];
    },
    createCustodian(input) {
      const data = ensureLegal(store.read());
      const row = { id: makeId('custodian'), ...svc.normalizeCustodianInput(input), createdAt: now(), updatedAt: now() };
      data.legalHoldCustodians.push(row);
      store.write(data);
      return row;
    },
    listCustodians(holdId) {
      return ensureLegal(store.read()).legalHoldCustodians.filter(x => x.holdId === holdId);
    },
    acknowledgeCustodian(id) {
      const data = ensureLegal(store.read());
      const idx = data.legalHoldCustodians.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalHoldCustodians[idx] = svc.acknowledgeCustodian(data.legalHoldCustodians[idx]);
      store.write(data);
      return data.legalHoldCustodians[idx];
    },
    createScope(input) {
      const data = ensureLegal(store.read());
      const row = { id: makeId('scope'), ...svc.normalizeScopeInput(input), createdAt: now(), updatedAt: now() };
      data.legalPreservationScopes.push(row);
      store.write(data);
      return row;
    },
    listScopes(holdId) {
      return ensureLegal(store.read()).legalPreservationScopes.filter(x => x.holdId === holdId);
    },
    markScopePreserved(id) {
      const data = ensureLegal(store.read());
      const idx = data.legalPreservationScopes.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalPreservationScopes[idx] = svc.markScopePreserved(data.legalPreservationScopes[idx]);
      store.write(data);
      return data.legalPreservationScopes[idx];
    },
    createCollection(input) {
      const data = ensureLegal(store.read());
      const row = { id: makeId('collect'), ...svc.normalizeCollectionJobInput(input), createdAt: now(), updatedAt: now() };
      data.legalCollectionJobs.push(row);
      store.write(data);
      return row;
    },
    startCollection(id) {
      const data = ensureLegal(store.read());
      const idx = data.legalCollectionJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalCollectionJobs[idx] = svc.startCollection(data.legalCollectionJobs[idx]);
      store.write(data);
      return data.legalCollectionJobs[idx];
    },
    completeCollection(id, itemCount, outputLocation) {
      const data = ensureLegal(store.read());
      const idx = data.legalCollectionJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalCollectionJobs[idx] = svc.completeCollection(data.legalCollectionJobs[idx], itemCount, outputLocation);
      store.write(data);
      return data.legalCollectionJobs[idx];
    },
    createExport(input) {
      const data = ensureLegal(store.read());
      const row = { id: makeId('lexport'), ...svc.normalizeExportJobInput(input), createdAt: now(), updatedAt: now() };
      data.legalExportJobs.push(row);
      store.write(data);
      return row;
    },
    startExport(id) {
      const data = ensureLegal(store.read());
      const idx = data.legalExportJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalExportJobs[idx] = svc.startExport(data.legalExportJobs[idx]);
      store.write(data);
      return data.legalExportJobs[idx];
    },
    completeExport(id, outputUrl, itemCount) {
      const data = ensureLegal(store.read());
      const idx = data.legalExportJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalExportJobs[idx] = svc.completeExport(data.legalExportJobs[idx], outputUrl, itemCount);
      store.write(data);
      return data.legalExportJobs[idx];
    },
    metrics(tenantId) {
      const data = ensureLegal(store.read());
      return svc.legalHoldMetrics({
        matters: data.legalMatters.filter(x => !tenantId || x.tenantId === tenantId),
        holds: data.legalHolds.filter(x => !tenantId || x.tenantId === tenantId),
        custodians: data.legalHoldCustodians.filter(x => !tenantId || x.tenantId === tenantId),
        collections: data.legalCollectionJobs.filter(x => !tenantId || x.tenantId === tenantId),
        exports: data.legalExportJobs.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresLegalHoldRepository() {
  return {
    async listMatters() { return []; },
    async createMatter(input) { return { id: 'postgres-matter-placeholder', ...svc.normalizeMatterInput(input) }; },
    async closeMatter() { return null; },
    async createHold(input) { return { id: 'postgres-hold-placeholder', ...svc.normalizeHoldInput(input) }; },
    async listHolds() { return []; },
    async issueHold() { return null; },
    async releaseHold() { return null; },
    async createCustodian(input) { return { id: 'postgres-custodian-placeholder', ...svc.normalizeCustodianInput(input) }; },
    async listCustodians() { return []; },
    async acknowledgeCustodian() { return null; },
    async createScope(input) { return { id: 'postgres-scope-placeholder', ...svc.normalizeScopeInput(input) }; },
    async listScopes() { return []; },
    async markScopePreserved() { return null; },
    async createCollection(input) { return { id: 'postgres-collection-placeholder', ...svc.normalizeCollectionJobInput(input) }; },
    async startCollection() { return null; },
    async completeCollection() { return null; },
    async createExport(input) { return { id: 'postgres-export-placeholder', ...svc.normalizeExportJobInput(input) }; },
    async startExport() { return null; },
    async completeExport() { return null; },
    async metrics() { return svc.legalHoldMetrics({}); }
  };
}

module.exports = { createLegalHoldRepository };
