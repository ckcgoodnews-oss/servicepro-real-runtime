const { makeId, now } = require('../services/id');
const svc = require('../services/privacyRightsService');

function createPrivacyRightsRepository(store) {
  if (store.type === 'json') return createJsonPrivacyRightsRepository(store);
  if (store.type === 'postgres') return createPostgresPrivacyRightsRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePrivacy(data) {
  data.privacyRequests ||= [];
  data.privacyIdentityVerifications ||= [];
  data.privacySearchTasks ||= [];
  data.privacyResponsePackages ||= [];
  data.privacyApprovals ||= [];
  data.privacyFulfillments ||= [];
  return data;
}

function createJsonPrivacyRightsRepository(store) {
  return {
    listRequests(filters = {}) {
      return ensurePrivacy(store.read()).privacyRequests
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.requestType || x.requestType === filters.requestType)
        .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
    },
    createRequest(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('privreq'), ...svc.normalizePrivacyRequestInput(input), createdAt: now(), updatedAt: now() };
      row.requestNumber = row.requestNumber || `DSAR-${String(data.privacyRequests.length + 1).padStart(6, '0')}`;
      data.privacyRequests.push(row);
      store.write(data);
      return row;
    },
    startVerification(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyRequests[idx] = svc.startVerification(data.privacyRequests[idx]);
      store.write(data);
      return data.privacyRequests[idx];
    },
    createVerification(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('privver'), ...svc.normalizeIdentityVerificationInput(input), createdAt: now(), updatedAt: now() };
      data.privacyIdentityVerifications.push(row);
      store.write(data);
      return row;
    },
    verifyIdentity(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyIdentityVerifications.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyIdentityVerifications[idx] = svc.verifyIdentity(data.privacyIdentityVerifications[idx]);
      const reqIdx = data.privacyRequests.findIndex(x => x.id === data.privacyIdentityVerifications[idx].requestId);
      if (reqIdx !== -1) data.privacyRequests[reqIdx] = { ...data.privacyRequests[reqIdx], status: 'in_progress', updatedAt: now() };
      store.write(data);
      return data.privacyIdentityVerifications[idx];
    },
    failIdentity(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyIdentityVerifications.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyIdentityVerifications[idx] = svc.failIdentity(data.privacyIdentityVerifications[idx]);
      store.write(data);
      return data.privacyIdentityVerifications[idx];
    },
    createSearchTask(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('privsearch'), ...svc.normalizeSearchTaskInput(input), createdAt: now(), updatedAt: now() };
      data.privacySearchTasks.push(row);
      store.write(data);
      return row;
    },
    listSearchTasks(requestId) {
      return ensurePrivacy(store.read()).privacySearchTasks.filter(x => x.requestId === requestId);
    },
    startSearchTask(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacySearchTasks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacySearchTasks[idx] = svc.startSearchTask(data.privacySearchTasks[idx]);
      store.write(data);
      return data.privacySearchTasks[idx];
    },
    completeSearchTask(id, recordsFound, outputRef) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacySearchTasks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacySearchTasks[idx] = svc.completeSearchTask(data.privacySearchTasks[idx], recordsFound, outputRef);
      store.write(data);
      return data.privacySearchTasks[idx];
    },
    createPackage(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('privpkg'), ...svc.normalizeResponsePackageInput(input), createdAt: now(), updatedAt: now() };
      data.privacyResponsePackages.push(row);
      store.write(data);
      return row;
    },
    markPackageReady(id, packageUrl, preparedBy) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyResponsePackages.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyResponsePackages[idx] = svc.markPackageReady(data.privacyResponsePackages[idx], packageUrl, preparedBy);
      store.write(data);
      return data.privacyResponsePackages[idx];
    },
    approvePackage(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyResponsePackages.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyResponsePackages[idx] = svc.approvePackage(data.privacyResponsePackages[idx]);
      store.write(data);
      return data.privacyResponsePackages[idx];
    },
    createApproval(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('privapp'), ...svc.normalizeApprovalInput(input), createdAt: now(), updatedAt: now() };
      data.privacyApprovals.push(row);
      store.write(data);
      return row;
    },
    approveReview(id, comments = '') {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyApprovals[idx] = svc.approveReview(data.privacyApprovals[idx], comments);
      const reqIdx = data.privacyRequests.findIndex(x => x.id === data.privacyApprovals[idx].requestId);
      if (reqIdx !== -1) data.privacyRequests[reqIdx] = svc.approveRequest(data.privacyRequests[reqIdx]);
      store.write(data);
      return data.privacyApprovals[idx];
    },
    rejectReview(id, comments = '') {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyApprovals[idx] = svc.rejectReview(data.privacyApprovals[idx], comments);
      store.write(data);
      return data.privacyApprovals[idx];
    },
    createFulfillment(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('privful'), ...svc.normalizeFulfillmentInput(input), createdAt: now(), updatedAt: now() };
      data.privacyFulfillments.push(row);
      store.write(data);
      return row;
    },
    sendFulfillment(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyFulfillments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyFulfillments[idx] = svc.sendFulfillment(data.privacyFulfillments[idx]);
      const reqIdx = data.privacyRequests.findIndex(x => x.id === data.privacyFulfillments[idx].requestId);
      if (reqIdx !== -1) data.privacyRequests[reqIdx] = svc.markFulfilled(data.privacyRequests[reqIdx]);
      store.write(data);
      return data.privacyFulfillments[idx];
    },
    failFulfillment(id, reason = '') {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyFulfillments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyFulfillments[idx] = svc.failFulfillment(data.privacyFulfillments[idx], reason);
      store.write(data);
      return data.privacyFulfillments[idx];
    },
    rejectRequest(id, reason = '') {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyRequests[idx] = svc.rejectRequest(data.privacyRequests[idx], reason);
      store.write(data);
      return data.privacyRequests[idx];
    },
    metrics(tenantId) {
      const data = ensurePrivacy(store.read());
      return svc.privacyMetrics({
        requests: data.privacyRequests.filter(x => !tenantId || x.tenantId === tenantId),
        verifications: data.privacyIdentityVerifications.filter(x => !tenantId || x.tenantId === tenantId),
        tasks: data.privacySearchTasks.filter(x => !tenantId || x.tenantId === tenantId),
        packages: data.privacyResponsePackages.filter(x => !tenantId || x.tenantId === tenantId),
        approvals: data.privacyApprovals.filter(x => !tenantId || x.tenantId === tenantId),
        fulfillments: data.privacyFulfillments.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresPrivacyRightsRepository() {
  return {
    async listRequests() { return []; },
    async createRequest(input) { return { id: 'postgres-privacy-request-placeholder', ...svc.normalizePrivacyRequestInput(input) }; },
    async startVerification() { return null; },
    async createVerification(input) { return { id: 'postgres-verification-placeholder', ...svc.normalizeIdentityVerificationInput(input) }; },
    async verifyIdentity() { return null; },
    async failIdentity() { return null; },
    async createSearchTask(input) { return { id: 'postgres-search-placeholder', ...svc.normalizeSearchTaskInput(input) }; },
    async listSearchTasks() { return []; },
    async startSearchTask() { return null; },
    async completeSearchTask() { return null; },
    async createPackage(input) { return { id: 'postgres-package-placeholder', ...svc.normalizeResponsePackageInput(input) }; },
    async markPackageReady() { return null; },
    async approvePackage() { return null; },
    async createApproval(input) { return { id: 'postgres-approval-placeholder', ...svc.normalizeApprovalInput(input) }; },
    async approveReview() { return null; },
    async rejectReview() { return null; },
    async createFulfillment(input) { return { id: 'postgres-fulfillment-placeholder', ...svc.normalizeFulfillmentInput(input) }; },
    async sendFulfillment() { return null; },
    async failFulfillment() { return null; },
    async rejectRequest() { return null; },
    async metrics() { return svc.privacyMetrics({}); }
  };
}

module.exports = { createPrivacyRightsRepository };
