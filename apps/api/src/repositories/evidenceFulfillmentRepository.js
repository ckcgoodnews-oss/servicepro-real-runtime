const { makeId, now } = require('../services/id');
const svc = require('../services/evidenceFulfillmentService');

function createEvidenceFulfillmentRepository(store) {
  if (store.type === 'json') return createJsonEvidenceFulfillmentRepository(store);
  if (store.type === 'postgres') return createPostgresEvidenceFulfillmentRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureEf(data) {
  data.evidenceBundles ||= [];
  data.evidenceBundleItems ||= [];
  data.evidenceFulfillmentRequests ||= [];
  data.evidenceDeliveryApprovals ||= [];
  data.evidenceDeliveryLinks ||= [];
  data.evidenceAccessEvents ||= [];
  return data;
}

function addEvent(data, input) {
  const row = { id: makeId('efevent'), ...svc.normalizeAccessEventInput(input), createdAt: now(), updatedAt: now() };
  data.evidenceAccessEvents.push(row);
  return row;
}

function createJsonEvidenceFulfillmentRepository(store) {
  return {
    listBundles(filters = {}) {
      return ensureEf(store.read()).evidenceBundles
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createBundle(input) {
      const data = ensureEf(store.read());
      const row = { id: makeId('efbundle'), ...svc.normalizeBundleInput(input), createdAt: now(), updatedAt: now() };
      data.evidenceBundles.push(row);
      store.write(data);
      return row;
    },
    markBundleReady(id) {
      const data = ensureEf(store.read());
      const idx = data.evidenceBundles.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.evidenceBundles[idx] = svc.markBundleReady(data.evidenceBundles[idx]);
      store.write(data);
      return data.evidenceBundles[idx];
    },
    approveBundle(id) {
      const data = ensureEf(store.read());
      const idx = data.evidenceBundles.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.evidenceBundles[idx] = svc.approveBundle(data.evidenceBundles[idx]);
      store.write(data);
      return data.evidenceBundles[idx];
    },
    createBundleItem(input) {
      const data = ensureEf(store.read());
      const row = { id: makeId('efitem'), ...svc.normalizeBundleItemInput(input), createdAt: now(), updatedAt: now() };
      data.evidenceBundleItems.push(row);
      store.write(data);
      return row;
    },
    listBundleItems(bundleId) {
      return ensureEf(store.read()).evidenceBundleItems.filter(x => x.bundleId === bundleId && x.included !== false);
    },
    createRequest(input) {
      const data = ensureEf(store.read());
      const row = { id: makeId('efreq'), ...svc.normalizeFulfillmentRequestInput(input), createdAt: now(), updatedAt: now() };
      row.requestNumber = row.requestNumber || `EF-${String(data.evidenceFulfillmentRequests.length + 1).padStart(6, '0')}`;
      data.evidenceFulfillmentRequests.push(row);
      store.write(data);
      return row;
    },
    listRequests(filters = {}) {
      return ensureEf(store.read()).evidenceFulfillmentRequests
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.requestedAt).localeCompare(String(a.requestedAt)));
    },
    approveRequest(id) {
      const data = ensureEf(store.read());
      const idx = data.evidenceFulfillmentRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.evidenceFulfillmentRequests[idx] = svc.approveRequest(data.evidenceFulfillmentRequests[idx]);
      store.write(data);
      return data.evidenceFulfillmentRequests[idx];
    },
    rejectRequest(id, reason = '') {
      const data = ensureEf(store.read());
      const idx = data.evidenceFulfillmentRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.evidenceFulfillmentRequests[idx] = svc.rejectRequest(data.evidenceFulfillmentRequests[idx], reason);
      store.write(data);
      return data.evidenceFulfillmentRequests[idx];
    },
    createApproval(input) {
      const data = ensureEf(store.read());
      const row = { id: makeId('efapp'), ...svc.normalizeApprovalInput(input), createdAt: now(), updatedAt: now() };
      data.evidenceDeliveryApprovals.push(row);
      store.write(data);
      return row;
    },
    approveDelivery(id, comments = '') {
      const data = ensureEf(store.read());
      const idx = data.evidenceDeliveryApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.evidenceDeliveryApprovals[idx] = svc.approveDelivery(data.evidenceDeliveryApprovals[idx], comments);
      const rIdx = data.evidenceFulfillmentRequests.findIndex(x => x.id === data.evidenceDeliveryApprovals[idx].requestId);
      if (rIdx !== -1) data.evidenceFulfillmentRequests[rIdx] = svc.approveRequest(data.evidenceFulfillmentRequests[rIdx]);
      store.write(data);
      return data.evidenceDeliveryApprovals[idx];
    },
    rejectDelivery(id, comments = '') {
      const data = ensureEf(store.read());
      const idx = data.evidenceDeliveryApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.evidenceDeliveryApprovals[idx] = svc.rejectDelivery(data.evidenceDeliveryApprovals[idx], comments);
      store.write(data);
      return data.evidenceDeliveryApprovals[idx];
    },
    createDeliveryLink(input) {
      const data = ensureEf(store.read());
      const request = data.evidenceFulfillmentRequests.find(x => x.id === input.requestId);
      const token = input.token || svc.createDeliveryToken(input.requestId, request ? request.requesterEmail : input.recipientEmail || '');
      const row = { id: makeId('eflink'), ...svc.normalizeDeliveryLinkInput({ ...input, token, recipientEmail: input.recipientEmail || (request && request.requesterEmail) || '' }), createdAt: now(), updatedAt: now() };
      data.evidenceDeliveryLinks.push(row);
      addEvent(data, { requestId: row.requestId, linkId: row.id, bundleId: row.bundleId, tenantId: row.tenantId, eventType: 'link_created', actorEmail: row.createdBy });
      store.write(data);
      return row;
    },
    openDeliveryLink(id) {
      const data = ensureEf(store.read());
      const idx = data.evidenceDeliveryLinks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.evidenceDeliveryLinks[idx] = svc.openDeliveryLink(data.evidenceDeliveryLinks[idx]);
      addEvent(data, { requestId: data.evidenceDeliveryLinks[idx].requestId, linkId: id, bundleId: data.evidenceDeliveryLinks[idx].bundleId, tenantId: data.evidenceDeliveryLinks[idx].tenantId, eventType: 'link_opened', actorEmail: data.evidenceDeliveryLinks[idx].recipientEmail });
      store.write(data);
      return data.evidenceDeliveryLinks[idx];
    },
    deliverRequest(id) {
      const data = ensureEf(store.read());
      const idx = data.evidenceFulfillmentRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.evidenceFulfillmentRequests[idx] = svc.markDelivered(data.evidenceFulfillmentRequests[idx]);
      addEvent(data, { requestId: id, bundleId: data.evidenceFulfillmentRequests[idx].bundleId, tenantId: data.evidenceFulfillmentRequests[idx].tenantId, eventType: 'request_delivered', actorEmail: data.evidenceFulfillmentRequests[idx].requesterEmail });
      store.write(data);
      return data.evidenceFulfillmentRequests[idx];
    },
    revokeDeliveryLink(id, revokedBy) {
      const data = ensureEf(store.read());
      const idx = data.evidenceDeliveryLinks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.evidenceDeliveryLinks[idx] = svc.revokeDeliveryLink(data.evidenceDeliveryLinks[idx], revokedBy);
      addEvent(data, { requestId: data.evidenceDeliveryLinks[idx].requestId, linkId: id, bundleId: data.evidenceDeliveryLinks[idx].bundleId, tenantId: data.evidenceDeliveryLinks[idx].tenantId, eventType: 'link_revoked', actorEmail: revokedBy });
      store.write(data);
      return data.evidenceDeliveryLinks[idx];
    },
    listLinks(filters = {}) {
      return ensureEf(store.read()).evidenceDeliveryLinks
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.requestId || x.requestId === filters.requestId)
        .filter(x => !filters.status || x.status === filters.status);
    },
    accessEvents(filters = {}) {
      return ensureEf(store.read()).evidenceAccessEvents
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.requestId || x.requestId === filters.requestId)
        .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));
    },
    metrics(tenantId) {
      const data = ensureEf(store.read());
      return svc.fulfillmentMetrics({
        bundles: data.evidenceBundles.filter(x => !tenantId || x.tenantId === tenantId),
        requests: data.evidenceFulfillmentRequests.filter(x => !tenantId || x.tenantId === tenantId),
        approvals: data.evidenceDeliveryApprovals.filter(x => !tenantId || x.tenantId === tenantId),
        links: data.evidenceDeliveryLinks.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresEvidenceFulfillmentRepository() {
  return {
    async listBundles() { return []; },
    async createBundle(input) { return { id: 'postgres-bundle-placeholder', ...svc.normalizeBundleInput(input) }; },
    async markBundleReady() { return null; },
    async approveBundle() { return null; },
    async createBundleItem(input) { return { id: 'postgres-item-placeholder', ...svc.normalizeBundleItemInput(input) }; },
    async listBundleItems() { return []; },
    async createRequest(input) { return { id: 'postgres-request-placeholder', ...svc.normalizeFulfillmentRequestInput(input) }; },
    async listRequests() { return []; },
    async approveRequest() { return null; },
    async rejectRequest() { return null; },
    async createApproval(input) { return { id: 'postgres-approval-placeholder', ...svc.normalizeApprovalInput(input) }; },
    async approveDelivery() { return null; },
    async rejectDelivery() { return null; },
    async createDeliveryLink(input) { return { id: 'postgres-link-placeholder', ...svc.normalizeDeliveryLinkInput(input) }; },
    async openDeliveryLink() { return null; },
    async deliverRequest() { return null; },
    async revokeDeliveryLink() { return null; },
    async listLinks() { return []; },
    async accessEvents() { return []; },
    async metrics() { return svc.fulfillmentMetrics({}); }
  };
}

module.exports = { createEvidenceFulfillmentRepository };
