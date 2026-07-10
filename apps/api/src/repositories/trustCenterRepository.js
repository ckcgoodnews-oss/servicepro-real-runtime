const { makeId, now } = require('../services/id');
const svc = require('../services/trustCenterService');

function createTrustCenterRepository(store) {
  if (store.type === 'json') return createJsonTrustCenterRepository(store);
  if (store.type === 'postgres') return createPostgresTrustCenterRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTrust(data) {
  data.trustProfiles ||= [];
  data.trustDocuments ||= [];
  data.trustAccessRequests ||= [];
  data.trustDocumentShares ||= [];
  data.trustAuditEvents ||= [];
  return data;
}

function addAudit(data, input) {
  const row = { id: makeId('traudit'), ...svc.normalizeAuditEventInput(input), createdAt: now(), updatedAt: now() };
  data.trustAuditEvents.push(row);
  return row;
}

function createJsonTrustCenterRepository(store) {
  return {
    listProfiles(filters = {}) {
      return ensureTrust(store.read()).trustProfiles
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status);
    },
    createProfile(input) {
      const data = ensureTrust(store.read());
      const row = { id: makeId('trprof'), ...svc.normalizeProfileInput(input), createdAt: now(), updatedAt: now() };
      data.trustProfiles.push(row);
      store.write(data);
      return row;
    },
    publishProfile(id) {
      const data = ensureTrust(store.read());
      const idx = data.trustProfiles.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trustProfiles[idx] = svc.publishProfile(data.trustProfiles[idx]);
      addAudit(data, { tenantId: data.trustProfiles[idx].tenantId, eventType: 'profile_published', message: 'Trust profile published.' });
      store.write(data);
      return data.trustProfiles[idx];
    },
    listDocuments(filters = {}) {
      return ensureTrust(store.read()).trustDocuments
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.documentType || x.documentType === filters.documentType)
        .filter(x => !filters.visibility || x.visibility === filters.visibility)
        .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    },
    createDocument(input) {
      const data = ensureTrust(store.read());
      const row = { id: makeId('trdoc'), ...svc.normalizeDocumentInput(input), createdAt: now(), updatedAt: now() };
      data.trustDocuments.push(row);
      store.write(data);
      return row;
    },
    publishDocument(id) {
      const data = ensureTrust(store.read());
      const idx = data.trustDocuments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trustDocuments[idx] = svc.publishDocument(data.trustDocuments[idx]);
      addAudit(data, { tenantId: data.trustDocuments[idx].tenantId, documentId: id, eventType: 'document_published', message: 'Trust document published.' });
      store.write(data);
      return data.trustDocuments[idx];
    },
    createAccessRequest(input) {
      const data = ensureTrust(store.read());
      const document = data.trustDocuments.find(x => x.id === input.documentId);
      const normalized = svc.normalizeAccessRequestInput({
        ...input,
        ndaStatus: document && svc.documentRequiresNda(document) ? 'pending' : (input.ndaStatus || 'not_required')
      });
      const row = { id: makeId('trreq'), ...normalized, createdAt: now(), updatedAt: now() };
      data.trustAccessRequests.push(row);
      addAudit(data, { tenantId: row.tenantId, documentId: row.documentId, accessRequestId: row.id, eventType: 'access_requested', actorEmail: row.requesterEmail, message: 'Trust document access requested.' });
      store.write(data);
      return row;
    },
    listAccessRequests(filters = {}) {
      return ensureTrust(store.read()).trustAccessRequests
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.documentId || x.documentId === filters.documentId)
        .sort((a, b) => String(b.requestedAt).localeCompare(String(a.requestedAt)));
    },
    signNda(id) {
      const data = ensureTrust(store.read());
      const idx = data.trustAccessRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trustAccessRequests[idx] = svc.markNdaSigned(data.trustAccessRequests[idx]);
      addAudit(data, { tenantId: data.trustAccessRequests[idx].tenantId, documentId: data.trustAccessRequests[idx].documentId, accessRequestId: id, eventType: 'nda_signed', actorEmail: data.trustAccessRequests[idx].requesterEmail, message: 'NDA signed.' });
      store.write(data);
      return data.trustAccessRequests[idx];
    },
    approveAccessRequest(id, decidedBy) {
      const data = ensureTrust(store.read());
      const idx = data.trustAccessRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trustAccessRequests[idx] = svc.approveAccessRequest(data.trustAccessRequests[idx], decidedBy);
      addAudit(data, { tenantId: data.trustAccessRequests[idx].tenantId, documentId: data.trustAccessRequests[idx].documentId, accessRequestId: id, eventType: 'access_approved', actorEmail: decidedBy, message: 'Access request approved.' });
      store.write(data);
      return data.trustAccessRequests[idx];
    },
    rejectAccessRequest(id, decidedBy, reason = '') {
      const data = ensureTrust(store.read());
      const idx = data.trustAccessRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trustAccessRequests[idx] = svc.rejectAccessRequest(data.trustAccessRequests[idx], decidedBy, reason);
      addAudit(data, { tenantId: data.trustAccessRequests[idx].tenantId, documentId: data.trustAccessRequests[idx].documentId, accessRequestId: id, eventType: 'access_rejected', actorEmail: decidedBy, message: reason || 'Access request rejected.' });
      store.write(data);
      return data.trustAccessRequests[idx];
    },
    createShare(input) {
      const data = ensureTrust(store.read());
      const request = data.trustAccessRequests.find(x => x.id === input.accessRequestId);
      const token = input.token || svc.createShareToken(input.documentId, request ? request.requesterEmail : input.recipientEmail || '');
      const row = { id: makeId('trshare'), ...svc.normalizeShareInput({ ...input, token, recipientEmail: input.recipientEmail || (request && request.requesterEmail) || '' }), createdAt: now(), updatedAt: now() };
      data.trustDocumentShares.push(row);
      addAudit(data, { tenantId: row.tenantId, documentId: row.documentId, accessRequestId: row.accessRequestId, shareId: row.id, eventType: 'share_created', actorEmail: row.createdBy, message: 'Secure document share created.' });
      store.write(data);
      return row;
    },
    listShares(filters = {}) {
      return ensureTrust(store.read()).trustDocumentShares
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.documentId || x.documentId === filters.documentId)
        .filter(x => !filters.status || x.status === filters.status);
    },
    viewShare(id) {
      const data = ensureTrust(store.read());
      const idx = data.trustDocumentShares.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trustDocumentShares[idx] = svc.viewShare(data.trustDocumentShares[idx]);
      addAudit(data, { tenantId: data.trustDocumentShares[idx].tenantId, documentId: data.trustDocumentShares[idx].documentId, accessRequestId: data.trustDocumentShares[idx].accessRequestId, shareId: id, eventType: 'share_viewed', actorEmail: data.trustDocumentShares[idx].recipientEmail, message: 'Secure document share viewed.' });
      store.write(data);
      return data.trustDocumentShares[idx];
    },
    revokeShare(id, revokedBy) {
      const data = ensureTrust(store.read());
      const idx = data.trustDocumentShares.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trustDocumentShares[idx] = svc.revokeShare(data.trustDocumentShares[idx], revokedBy);
      addAudit(data, { tenantId: data.trustDocumentShares[idx].tenantId, documentId: data.trustDocumentShares[idx].documentId, accessRequestId: data.trustDocumentShares[idx].accessRequestId, shareId: id, eventType: 'share_revoked', actorEmail: revokedBy, message: 'Secure document share revoked.' });
      store.write(data);
      return data.trustDocumentShares[idx];
    },
    auditTrail(filters = {}) {
      return ensureTrust(store.read()).trustAuditEvents
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.documentId || x.documentId === filters.documentId)
        .filter(x => !filters.accessRequestId || x.accessRequestId === filters.accessRequestId)
        .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));
    },
    metrics(tenantId) {
      const data = ensureTrust(store.read());
      return svc.trustCenterMetrics({
        profiles: data.trustProfiles.filter(x => !tenantId || x.tenantId === tenantId),
        documents: data.trustDocuments.filter(x => !tenantId || x.tenantId === tenantId),
        requests: data.trustAccessRequests.filter(x => !tenantId || x.tenantId === tenantId),
        shares: data.trustDocumentShares.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresTrustCenterRepository() {
  return {
    async listProfiles() { return []; },
    async createProfile(input) { return { id: 'postgres-profile-placeholder', ...svc.normalizeProfileInput(input) }; },
    async publishProfile() { return null; },
    async listDocuments() { return []; },
    async createDocument(input) { return { id: 'postgres-document-placeholder', ...svc.normalizeDocumentInput(input) }; },
    async publishDocument() { return null; },
    async createAccessRequest(input) { return { id: 'postgres-access-placeholder', ...svc.normalizeAccessRequestInput(input) }; },
    async listAccessRequests() { return []; },
    async signNda() { return null; },
    async approveAccessRequest() { return null; },
    async rejectAccessRequest() { return null; },
    async createShare(input) { return { id: 'postgres-share-placeholder', ...svc.normalizeShareInput(input) }; },
    async listShares() { return []; },
    async viewShare() { return null; },
    async revokeShare() { return null; },
    async auditTrail() { return []; },
    async metrics() { return svc.trustCenterMetrics({}); }
  };
}

module.exports = { createTrustCenterRepository };
