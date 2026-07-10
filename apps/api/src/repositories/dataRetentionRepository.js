const { makeId, now } = require('../services/id');
const svc = require('../services/dataRetentionService');

function createDataRetentionRepository(store) {
  if (store.type === 'json') return createJsonDataRetentionRepository(store);
  if (store.type === 'postgres') return createPostgresDataRetentionRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureRetention(data) {
  data.retentionPolicies ||= [];
  data.retentionRecordClasses ||= [];
  data.retentionSchedules ||= [];
  data.retentionDispositionReviews ||= [];
  data.retentionDeletionJobs ||= [];
  return data;
}

function createJsonDataRetentionRepository(store) {
  return {
    listPolicies(filters = {}) {
      return ensureRetention(store.read()).retentionPolicies
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createPolicy(input) {
      const data = ensureRetention(store.read());
      const row = { id: makeId('retpol'), ...svc.normalizePolicyInput(input), createdAt: now(), updatedAt: now() };
      data.retentionPolicies.push(row);
      store.write(data);
      return row;
    },
    listRecordClasses(filters = {}) {
      return ensureRetention(store.read()).retentionRecordClasses
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createRecordClass(input) {
      const data = ensureRetention(store.read());
      const row = { id: makeId('retclass'), ...svc.normalizeRecordClassInput(input), createdAt: now(), updatedAt: now() };
      data.retentionRecordClasses.push(row);
      store.write(data);
      return row;
    },
    createSchedule(input) {
      const data = ensureRetention(store.read());
      const policy = data.retentionPolicies.find(x => x.id === input.policyId);
      const normalized = svc.normalizeScheduleInput({
        ...input,
        eligibleAt: input.eligibleAt || (policy ? svc.calculateEligibleAt(policy, input.triggerAt || new Date().toISOString()) : '')
      });
      const row = { id: makeId('retsched'), ...normalized, createdAt: now(), updatedAt: now() };
      data.retentionSchedules.push(row);
      store.write(data);
      return row;
    },
    listSchedules(filters = {}) {
      return ensureRetention(store.read()).retentionSchedules
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.policyId || x.policyId === filters.policyId)
        .filter(x => !filters.recordClassId || x.recordClassId === filters.recordClassId)
        .sort((a, b) => String(a.eligibleAt).localeCompare(String(b.eligibleAt)));
    },
    markEligible(id) {
      const data = ensureRetention(store.read());
      const idx = data.retentionSchedules.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionSchedules[idx] = svc.markEligible(data.retentionSchedules[idx]);
      store.write(data);
      return data.retentionSchedules[idx];
    },
    blockForLegalHold(id, legalHoldId) {
      const data = ensureRetention(store.read());
      const idx = data.retentionSchedules.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionSchedules[idx] = svc.blockForLegalHold(data.retentionSchedules[idx], legalHoldId);
      store.write(data);
      return data.retentionSchedules[idx];
    },
    unblockLegalHold(id) {
      const data = ensureRetention(store.read());
      const idx = data.retentionSchedules.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionSchedules[idx] = svc.unblockLegalHold(data.retentionSchedules[idx]);
      store.write(data);
      return data.retentionSchedules[idx];
    },
    createReview(input) {
      const data = ensureRetention(store.read());
      const row = { id: makeId('retrev'), ...svc.normalizeDispositionReviewInput(input), createdAt: now(), updatedAt: now() };
      data.retentionDispositionReviews.push(row);
      store.write(data);
      return row;
    },
    approveReview(id, comments = '') {
      const data = ensureRetention(store.read());
      const idx = data.retentionDispositionReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionDispositionReviews[idx] = svc.approveDisposition(data.retentionDispositionReviews[idx], comments);
      store.write(data);
      return data.retentionDispositionReviews[idx];
    },
    rejectReview(id, comments = '') {
      const data = ensureRetention(store.read());
      const idx = data.retentionDispositionReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionDispositionReviews[idx] = svc.rejectDisposition(data.retentionDispositionReviews[idx], comments);
      store.write(data);
      return data.retentionDispositionReviews[idx];
    },
    markDisposed(id) {
      const data = ensureRetention(store.read());
      const idx = data.retentionSchedules.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionSchedules[idx] = svc.markDisposed(data.retentionSchedules[idx]);
      store.write(data);
      return data.retentionSchedules[idx];
    },
    createDeletionJob(input) {
      const data = ensureRetention(store.read());
      const row = { id: makeId('retjob'), ...svc.normalizeDeletionJobInput(input), createdAt: now(), updatedAt: now() };
      data.retentionDeletionJobs.push(row);
      store.write(data);
      return row;
    },
    startJob(id) {
      const data = ensureRetention(store.read());
      const idx = data.retentionDeletionJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionDeletionJobs[idx] = svc.startJob(data.retentionDeletionJobs[idx]);
      store.write(data);
      return data.retentionDeletionJobs[idx];
    },
    completeJob(id, recordsProcessed = 0, recordsFailed = 0) {
      const data = ensureRetention(store.read());
      const idx = data.retentionDeletionJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.retentionDeletionJobs[idx] = svc.completeJob(data.retentionDeletionJobs[idx], recordsProcessed, recordsFailed);
      for (const scheduleId of data.retentionDeletionJobs[idx].scheduleIds || []) {
        const sidx = data.retentionSchedules.findIndex(x => x.id === scheduleId && !x.blockedByHold);
        if (sidx !== -1) data.retentionSchedules[sidx] = svc.markDisposed(data.retentionSchedules[sidx]);
      }
      store.write(data);
      return data.retentionDeletionJobs[idx];
    },
    metrics(tenantId) {
      const data = ensureRetention(store.read());
      return svc.retentionMetrics({
        policies: data.retentionPolicies.filter(x => !tenantId || x.tenantId === tenantId),
        classes: data.retentionRecordClasses.filter(x => !tenantId || x.tenantId === tenantId),
        schedules: data.retentionSchedules.filter(x => !tenantId || x.tenantId === tenantId),
        reviews: data.retentionDispositionReviews.filter(x => !tenantId || x.tenantId === tenantId),
        jobs: data.retentionDeletionJobs.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresDataRetentionRepository() {
  return {
    async listPolicies() { return []; },
    async createPolicy(input) { return { id: 'postgres-retention-policy-placeholder', ...svc.normalizePolicyInput(input) }; },
    async listRecordClasses() { return []; },
    async createRecordClass(input) { return { id: 'postgres-record-class-placeholder', ...svc.normalizeRecordClassInput(input) }; },
    async createSchedule(input) { return { id: 'postgres-schedule-placeholder', ...svc.normalizeScheduleInput(input) }; },
    async listSchedules() { return []; },
    async markEligible() { return null; },
    async blockForLegalHold() { return null; },
    async unblockLegalHold() { return null; },
    async createReview(input) { return { id: 'postgres-review-placeholder', ...svc.normalizeDispositionReviewInput(input) }; },
    async approveReview() { return null; },
    async rejectReview() { return null; },
    async markDisposed() { return null; },
    async createDeletionJob(input) { return { id: 'postgres-deletion-job-placeholder', ...svc.normalizeDeletionJobInput(input) }; },
    async startJob() { return null; },
    async completeJob() { return null; },
    async metrics() { return svc.retentionMetrics({}); }
  };
}

module.exports = { createDataRetentionRepository };
