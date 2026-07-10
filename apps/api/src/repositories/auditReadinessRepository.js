const { makeId, now } = require('../services/id');
const svc = require('../services/auditReadinessService');

function createAuditReadinessRepository(store) {
  if (store.type === 'json') return createJsonAuditReadinessRepository(store);
  if (store.type === 'postgres') return createPostgresAuditReadinessRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureAudit(data) {
  data.auditEngagements ||= [];
  data.auditorRequests ||= [];
  data.auditEvidencePackages ||= [];
  data.auditWalkthroughs ||= [];
  data.auditSampleRequests ||= [];
  data.auditIssues ||= [];
  return data;
}

function createJsonAuditReadinessRepository(store) {
  return {
    listEngagements(filters = {}) {
      return ensureAudit(store.read()).auditEngagements
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.startAt).localeCompare(String(a.startAt)));
    },
    createEngagement(input) {
      const data = ensureAudit(store.read());
      const row = { id: makeId('auditeng'), ...svc.normalizeEngagementInput(input), createdAt: now(), updatedAt: now() };
      data.auditEngagements.push(row);
      store.write(data);
      return row;
    },
    transitionEngagement(id, status) {
      const data = ensureAudit(store.read());
      const idx = data.auditEngagements.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditEngagements[idx] = svc.transitionEngagement(data.auditEngagements[idx], status);
      store.write(data);
      return data.auditEngagements[idx];
    },
    createRequest(input) {
      const data = ensureAudit(store.read());
      const row = { id: makeId('auditreq'), ...svc.normalizeAuditorRequestInput(input), createdAt: now(), updatedAt: now() };
      data.auditorRequests.push(row);
      store.write(data);
      return row;
    },
    listRequests(filters = {}) {
      return ensureAudit(store.read()).auditorRequests
        .filter(x => !filters.engagementId || x.engagementId === filters.engagementId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
    },
    submitRequest(id) {
      const data = ensureAudit(store.read());
      const idx = data.auditorRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditorRequests[idx] = svc.submitRequest(data.auditorRequests[idx]);
      store.write(data);
      return data.auditorRequests[idx];
    },
    acceptRequest(id) {
      const data = ensureAudit(store.read());
      const idx = data.auditorRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditorRequests[idx] = svc.acceptRequest(data.auditorRequests[idx]);
      store.write(data);
      return data.auditorRequests[idx];
    },
    rejectRequest(id, reason) {
      const data = ensureAudit(store.read());
      const idx = data.auditorRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditorRequests[idx] = svc.rejectRequest(data.auditorRequests[idx], reason);
      store.write(data);
      return data.auditorRequests[idx];
    },
    createEvidencePackage(input) {
      const data = ensureAudit(store.read());
      const row = { id: makeId('auditpkg'), ...svc.normalizeEvidencePackageInput(input), createdAt: now(), updatedAt: now() };
      data.auditEvidencePackages.push(row);
      store.write(data);
      return row;
    },
    listEvidencePackages(requestId) {
      return ensureAudit(store.read()).auditEvidencePackages.filter(x => x.requestId === requestId);
    },
    markPackageReady(id, preparedBy) {
      const data = ensureAudit(store.read());
      const idx = data.auditEvidencePackages.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditEvidencePackages[idx] = svc.markPackageReady(data.auditEvidencePackages[idx], preparedBy);
      store.write(data);
      return data.auditEvidencePackages[idx];
    },
    submitPackage(id) {
      const data = ensureAudit(store.read());
      const idx = data.auditEvidencePackages.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditEvidencePackages[idx] = svc.submitPackage(data.auditEvidencePackages[idx]);
      store.write(data);
      return data.auditEvidencePackages[idx];
    },
    createWalkthrough(input) {
      const data = ensureAudit(store.read());
      const row = { id: makeId('walk'), ...svc.normalizeWalkthroughInput(input), createdAt: now(), updatedAt: now() };
      data.auditWalkthroughs.push(row);
      store.write(data);
      return row;
    },
    listWalkthroughs(engagementId) {
      return ensureAudit(store.read()).auditWalkthroughs.filter(x => x.engagementId === engagementId);
    },
    completeWalkthrough(id, notes = '') {
      const data = ensureAudit(store.read());
      const idx = data.auditWalkthroughs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditWalkthroughs[idx] = svc.completeWalkthrough(data.auditWalkthroughs[idx], notes);
      store.write(data);
      return data.auditWalkthroughs[idx];
    },
    createSampleRequest(input) {
      const data = ensureAudit(store.read());
      const row = { id: makeId('sample'), ...svc.normalizeSampleRequestInput(input), createdAt: now(), updatedAt: now() };
      data.auditSampleRequests.push(row);
      store.write(data);
      return row;
    },
    listSampleRequests(engagementId) {
      return ensureAudit(store.read()).auditSampleRequests.filter(x => x.engagementId === engagementId);
    },
    collectSample(id, sampleItems = []) {
      const data = ensureAudit(store.read());
      const idx = data.auditSampleRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditSampleRequests[idx] = svc.collectSample(data.auditSampleRequests[idx], sampleItems);
      store.write(data);
      return data.auditSampleRequests[idx];
    },
    submitSample(id) {
      const data = ensureAudit(store.read());
      const idx = data.auditSampleRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditSampleRequests[idx] = svc.submitSample(data.auditSampleRequests[idx]);
      store.write(data);
      return data.auditSampleRequests[idx];
    },
    createIssue(input) {
      const data = ensureAudit(store.read());
      const row = { id: makeId('auditissue'), ...svc.normalizeAuditIssueInput(input), createdAt: now(), updatedAt: now() };
      data.auditIssues.push(row);
      store.write(data);
      return row;
    },
    listIssues(filters = {}) {
      return ensureAudit(store.read()).auditIssues
        .filter(x => !filters.engagementId || x.engagementId === filters.engagementId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity)
        .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
    },
    addManagementResponse(id, response) {
      const data = ensureAudit(store.read());
      const idx = data.auditIssues.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditIssues[idx] = svc.addManagementResponse(data.auditIssues[idx], response);
      store.write(data);
      return data.auditIssues[idx];
    },
    closeIssue(id) {
      const data = ensureAudit(store.read());
      const idx = data.auditIssues.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.auditIssues[idx] = svc.closeIssue(data.auditIssues[idx]);
      store.write(data);
      return data.auditIssues[idx];
    },
    metrics(engagementId) {
      const data = ensureAudit(store.read());
      return svc.auditReadinessMetrics({
        engagements: data.auditEngagements.filter(x => !engagementId || x.id === engagementId),
        requests: data.auditorRequests.filter(x => !engagementId || x.engagementId === engagementId),
        issues: data.auditIssues.filter(x => !engagementId || x.engagementId === engagementId)
      });
    }
  };
}

function createPostgresAuditReadinessRepository() {
  return {
    async listEngagements() { return []; },
    async createEngagement(input) { return { id: 'postgres-audit-engagement-placeholder', ...svc.normalizeEngagementInput(input) }; },
    async transitionEngagement() { return null; },
    async createRequest(input) { return { id: 'postgres-audit-request-placeholder', ...svc.normalizeAuditorRequestInput(input) }; },
    async listRequests() { return []; },
    async submitRequest() { return null; },
    async acceptRequest() { return null; },
    async rejectRequest() { return null; },
    async createEvidencePackage(input) { return { id: 'postgres-audit-package-placeholder', ...svc.normalizeEvidencePackageInput(input) }; },
    async listEvidencePackages() { return []; },
    async markPackageReady() { return null; },
    async submitPackage() { return null; },
    async createWalkthrough(input) { return { id: 'postgres-walkthrough-placeholder', ...svc.normalizeWalkthroughInput(input) }; },
    async listWalkthroughs() { return []; },
    async completeWalkthrough() { return null; },
    async createSampleRequest(input) { return { id: 'postgres-sample-placeholder', ...svc.normalizeSampleRequestInput(input) }; },
    async listSampleRequests() { return []; },
    async collectSample() { return null; },
    async submitSample() { return null; },
    async createIssue(input) { return { id: 'postgres-audit-issue-placeholder', ...svc.normalizeAuditIssueInput(input) }; },
    async listIssues() { return []; },
    async addManagementResponse() { return null; },
    async closeIssue() { return null; },
    async metrics() { return svc.auditReadinessMetrics({}); }
  };
}

module.exports = { createAuditReadinessRepository };
