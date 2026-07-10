const { makeId, now } = require('../services/id');
const svc = require('../services/privacyService');

function createPrivacyRepository(store) {
  if (store.type === 'json') return createJsonPrivacyRepository(store);
  if (store.type === 'postgres') return createPostgresPrivacyRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePrivacy(data) {
  data.privacyRequests ||= [];
  data.consentRecords ||= [];
  data.privacyExportJobs ||= [];
  data.redactionTasks ||= [];
  data.erasureApprovals ||= [];
  data.privacyAuditEvents ||= [];
  return data;
}

function addAudit(data, input) {
  const row = { id: makeId('privaudit'), ...svc.normalizePrivacyAuditInput(input), createdAt: now(), updatedAt: now() };
  data.privacyAuditEvents.push(row);
  return row;
}

function createJsonPrivacyRepository(store) {
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
      row.requestNumber = row.requestNumber || `PRIV-${String(data.privacyRequests.length + 1).padStart(6, '0')}`;
      data.privacyRequests.push(row);
      addAudit(data, { requestId: row.id, tenantId: row.tenantId, eventType: 'submitted', message: `${row.requestType} request submitted.` });
      store.write(data);
      return row;
    },
    verifyIdentity(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyRequests[idx] = svc.verifyIdentity(data.privacyRequests[idx]);
      addAudit(data, { requestId: id, tenantId: data.privacyRequests[idx].tenantId, eventType: 'identity_verified', message: 'Identity verified.' });
      store.write(data);
      return data.privacyRequests[idx];
    },
    completeRequest(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyRequests[idx] = svc.completePrivacyRequest(data.privacyRequests[idx]);
      addAudit(data, { requestId: id, tenantId: data.privacyRequests[idx].tenantId, eventType: 'completed', message: 'Privacy request completed.' });
      store.write(data);
      return data.privacyRequests[idx];
    },
    rejectRequest(id, reason) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyRequests[idx] = svc.rejectPrivacyRequest(data.privacyRequests[idx], reason);
      addAudit(data, { requestId: id, tenantId: data.privacyRequests[idx].tenantId, eventType: 'rejected', message: reason || 'Request rejected.' });
      store.write(data);
      return data.privacyRequests[idx];
    },
    listConsents(filters = {}) {
      return ensurePrivacy(store.read()).consentRecords
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.subjectEmail || x.subjectEmail === filters.subjectEmail)
        .filter(x => !filters.status || x.status === filters.status);
    },
    createConsent(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('consent'), ...svc.normalizeConsentRecordInput(input), createdAt: now(), updatedAt: now() };
      data.consentRecords.push(row);
      store.write(data);
      return row;
    },
    withdrawConsent(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.consentRecords.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.consentRecords[idx] = svc.withdrawConsent(data.consentRecords[idx]);
      store.write(data);
      return data.consentRecords[idx];
    },
    createExportJob(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('privexp'), ...svc.normalizePrivacyExportJobInput(input), createdAt: now(), updatedAt: now() };
      data.privacyExportJobs.push(row);
      store.write(data);
      return row;
    },
    startExportJob(id) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyExportJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyExportJobs[idx] = svc.startPrivacyExport(data.privacyExportJobs[idx]);
      addAudit(data, { requestId: data.privacyExportJobs[idx].requestId, tenantId: data.privacyExportJobs[idx].tenantId, eventType: 'export_started', message: 'Privacy export started.' });
      store.write(data);
      return data.privacyExportJobs[idx];
    },
    completeExportJob(id, outputUrl) {
      const data = ensurePrivacy(store.read());
      const idx = data.privacyExportJobs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyExportJobs[idx] = svc.completePrivacyExport(data.privacyExportJobs[idx], outputUrl);
      addAudit(data, { requestId: data.privacyExportJobs[idx].requestId, tenantId: data.privacyExportJobs[idx].tenantId, eventType: 'export_completed', message: 'Privacy export completed.' });
      store.write(data);
      return data.privacyExportJobs[idx];
    },
    createRedactionTask(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('redact'), ...svc.normalizeRedactionTaskInput(input), createdAt: now(), updatedAt: now() };
      data.redactionTasks.push(row);
      store.write(data);
      return row;
    },
    completeRedactionTask(id, redactedBy) {
      const data = ensurePrivacy(store.read());
      const idx = data.redactionTasks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.redactionTasks[idx] = svc.completeRedactionTask(data.redactionTasks[idx], redactedBy);
      addAudit(data, { requestId: data.redactionTasks[idx].requestId, tenantId: data.redactionTasks[idx].tenantId, eventType: 'redaction_completed', message: 'Redaction completed.' });
      store.write(data);
      return data.redactionTasks[idx];
    },
    createErasureApproval(input) {
      const data = ensurePrivacy(store.read());
      const row = { id: makeId('eraseapp'), ...svc.normalizeErasureApprovalInput(input), createdAt: now(), updatedAt: now() };
      data.erasureApprovals.push(row);
      store.write(data);
      return row;
    },
    approveErasure(id, comments = '') {
      const data = ensurePrivacy(store.read());
      const idx = data.erasureApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.erasureApprovals[idx] = svc.approveErasure(data.erasureApprovals[idx], comments);
      addAudit(data, { requestId: data.erasureApprovals[idx].requestId, eventType: 'erasure_approved', message: comments || 'Erasure approved.' });
      store.write(data);
      return data.erasureApprovals[idx];
    },
    rejectErasure(id, comments = '') {
      const data = ensurePrivacy(store.read());
      const idx = data.erasureApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.erasureApprovals[idx] = svc.rejectErasure(data.erasureApprovals[idx], comments);
      addAudit(data, { requestId: data.erasureApprovals[idx].requestId, eventType: 'erasure_rejected', message: comments || 'Erasure rejected.' });
      store.write(data);
      return data.erasureApprovals[idx];
    },
    auditTrail(requestId) {
      return ensurePrivacy(store.read()).privacyAuditEvents.filter(x => x.requestId === requestId).sort((a, b) => String(a.occurredAt).localeCompare(String(b.occurredAt)));
    },
    summary(tenantId) {
      const data = ensurePrivacy(store.read());
      const requests = data.privacyRequests.filter(x => !tenantId || x.tenantId === tenantId);
      return {
        totalRequests: requests.length,
        openRequests: requests.filter(x => !['completed', 'rejected', 'cancelled'].includes(x.status)).length,
        overdueRequests: requests.filter(x => svc.isOverdue(x)).length,
        activeConsents: data.consentRecords.filter(x => (!tenantId || x.tenantId === tenantId) && x.status === 'granted').length,
        completedExports: data.privacyExportJobs.filter(x => (!tenantId || x.tenantId === tenantId) && x.status === 'completed').length
      };
    }
  };
}

function createPostgresPrivacyRepository() {
  return {
    async listRequests() { return []; },
    async createRequest(input) { return { id: 'postgres-privacy-request-placeholder', ...svc.normalizePrivacyRequestInput(input) }; },
    async verifyIdentity() { return null; },
    async completeRequest() { return null; },
    async rejectRequest() { return null; },
    async listConsents() { return []; },
    async createConsent(input) { return { id: 'postgres-consent-placeholder', ...svc.normalizeConsentRecordInput(input) }; },
    async withdrawConsent() { return null; },
    async createExportJob(input) { return { id: 'postgres-privacy-export-placeholder', ...svc.normalizePrivacyExportJobInput(input) }; },
    async startExportJob() { return null; },
    async completeExportJob() { return null; },
    async createRedactionTask(input) { return { id: 'postgres-redaction-placeholder', ...svc.normalizeRedactionTaskInput(input) }; },
    async completeRedactionTask() { return null; },
    async createErasureApproval(input) { return { id: 'postgres-erasure-placeholder', ...svc.normalizeErasureApprovalInput(input) }; },
    async approveErasure() { return null; },
    async rejectErasure() { return null; },
    async auditTrail() { return []; },
    async summary() { return { totalRequests: 0, openRequests: 0, overdueRequests: 0, activeConsents: 0, completedExports: 0 }; }
  };
}

module.exports = { createPrivacyRepository };
