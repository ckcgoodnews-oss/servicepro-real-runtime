const { makeId, now } = require('../services/id');
const svc = require('../services/retentionService');

function createRetentionRepository(store) {
  if (store.type === 'json') return createJsonRetentionRepository(store);
  if (store.type === 'postgres') return createPostgresRetentionRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureRetention(data) {
  data.retentionPolicies ||= [];
  data.documentClassifications ||= [];
  data.legalHolds ||= [];
  data.retentionReviews ||= [];
  data.complianceExportJobs ||= [];
  return data;
}

function createJsonRetentionRepository(store) {
  return {
    listPolicies(filters = {}) {
      return ensureRetention(store.read()).retentionPolicies
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.documentType || x.documentType === filters.documentType)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createPolicy(input) {
      const data = ensureRetention(store.read());
      const row = { id: makeId('retpol'), ...svc.normalizeRetentionPolicyInput(input), createdAt: now(), updatedAt: now() };
      data.retentionPolicies.push(row);
      store.write(data);
      return row;
    },
    listClassifications(filters = {}) {
      return ensureRetention(store.read()).documentClassifications
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.documentType || x.documentType === filters.documentType)
        .filter(x => !filters.classificationLevel || x.classificationLevel === filters.classificationLevel)
        .sort((a, b) => String(b.classifiedAt).localeCompare(String(a.classifiedAt)));
    },
    classifyDocument(input) {
      const data = ensureRetention(store.read());
      const normalized = svc.normalizeClassificationInput(input);
      const policy = data.retentionPolicies.find(x => x.id === normalized.policyId) || data.retentionPolicies.find(x => x.documentType === normalized.documentType && x.status === 'active');
      const withPolicy = policy ? svc.applyPolicy(normalized, policy) : normalized;
      const row = { id: makeId('docclass'), ...withPolicy, createdAt: now(), updatedAt: now() };
      data.documentClassifications.push(row);
      store.write(data);
      return row;
    },
    listLegalHolds(filters = {}) {
      return ensureRetention(store.read()).legalHolds
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.documentId || x.documentId === filters.documentId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.placedAt).localeCompare(String(a.placedAt)));
    },
    placeLegalHold(input) {
      const data = ensureRetention(store.read());
      const row = { id: makeId('hold'), ...svc.normalizeLegalHoldInput(input), createdAt: now(), updatedAt: now() };
      data.legalHolds.push(row);
      store.write(data);
      return row;
    },
    releaseLegalHold(id, releasedBy) {
      const data = ensureRetention(store.read());
      const idx = data.legalHolds.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.legalHolds[idx] = svc.releaseLegalHold(data.legalHolds[idx], releasedBy);
      store.write(data);
      return data.legalHolds[idx];
    },
    queueReview(input) {
      const data = ensureRetention(store.read());
      const row = { id: makeId('retrev'), ...svc.normalizeRetentionReviewInput(input), createdAt: now(), updatedAt: now() };
      data.retentionReviews.push(row);
      store.write(data);
      return row;
    },
    listReviews(filters = {}) {
      return ensureRetention(store.read()).retentionReviews
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
    },
    approveReview(id, reviewedBy) {
      const data = ensureRetention(store.read());
      const idx = data.retentionReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      if (svc.isBlockedByHold(data.retentionReviews[idx].documentId, data.legalHolds)) {
        data.retentionReviews[idx] = svc.rejectDeletionReview(data.retentionReviews[idx], reviewedBy, 'Document is under active legal hold');
      } else {
        data.retentionReviews[idx] = svc.approveDeletionReview(data.retentionReviews[idx], reviewedBy);
      }
      store.write(data);
      return data.retentionReviews[idx];
    },
    rejectReview(id, reviewedBy, reason = '') {
      const data = ensureRetention(store.read());
      const idx = data.retentionReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionReviews[idx] = svc.rejectDeletionReview(data.retentionReviews[idx], reviewedBy, reason);
      store.write(data);
      return data.retentionReviews[idx];
    },
    markDeleted(id) {
      const data = ensureRetention(store.read());
      const idx = data.retentionReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionReviews[idx] = svc.markDeleted(data.retentionReviews[idx]);
      store.write(data);
      return data.retentionReviews[idx];
    },
    createExportJob(input) {
      const data = ensureRetention(store.read());
      const row = { id: makeId('compexp'), ...svc.normalizeExportJobInput(input), createdAt: now(), updatedAt: now() };
      data.complianceExportJobs.push(row);
      store.write(data);
      return row;
    },
    startExportJob(id) {
      const data = ensureRetention(store.read());
      const idx = data.complianceExportJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.complianceExportJobs[idx] = svc.startExportJob(data.complianceExportJobs[idx]);
      store.write(data);
      return data.complianceExportJobs[idx];
    },
    completeExportJob(id, outputUrl) {
      const data = ensureRetention(store.read());
      const idx = data.complianceExportJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.complianceExportJobs[idx] = svc.completeExportJob(data.complianceExportJobs[idx], outputUrl);
      store.write(data);
      return data.complianceExportJobs[idx];
    },
    summary(tenantId) {
      const data = ensureRetention(store.read());
      return {
        policies: data.retentionPolicies.filter(x => x.status === 'active').length,
        classifiedDocuments: data.documentClassifications.filter(x => !tenantId || x.tenantId === tenantId).length,
        activeHolds: data.legalHolds.filter(x => (!tenantId || x.tenantId === tenantId) && x.status === 'active').length,
        pendingReviews: data.retentionReviews.filter(x => (!tenantId || x.tenantId === tenantId) && x.status === 'pending').length,
        completedExports: data.complianceExportJobs.filter(x => (!tenantId || x.tenantId === tenantId) && x.status === 'completed').length
      };
    }
  };
}

function createPostgresRetentionRepository() {
  return {
    async listPolicies() { return []; },
    async createPolicy(input) { return { id: 'postgres-retpol-placeholder', ...svc.normalizeRetentionPolicyInput(input) }; },
    async listClassifications() { return []; },
    async classifyDocument(input) { return { id: 'postgres-docclass-placeholder', ...svc.normalizeClassificationInput(input) }; },
    async listLegalHolds() { return []; },
    async placeLegalHold(input) { return { id: 'postgres-hold-placeholder', ...svc.normalizeLegalHoldInput(input) }; },
    async releaseLegalHold() { return null; },
    async queueReview(input) { return { id: 'postgres-review-placeholder', ...svc.normalizeRetentionReviewInput(input) }; },
    async listReviews() { return []; },
    async approveReview() { return null; },
    async rejectReview() { return null; },
    async markDeleted() { return null; },
    async createExportJob(input) { return { id: 'postgres-export-placeholder', ...svc.normalizeExportJobInput(input) }; },
    async startExportJob() { return null; },
    async completeExportJob() { return null; },
    async summary() { return { policies: 0, classifiedDocuments: 0, activeHolds: 0, pendingReviews: 0, completedExports: 0 }; }
  };
}

module.exports = { createRetentionRepository };
