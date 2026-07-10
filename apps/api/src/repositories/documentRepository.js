const { makeId, now } = require('../services/id');
const svc = require('../services/documentService');

function createDocumentRepository(store) {
  if (store.type === 'json') return createJsonDocumentRepository(store);
  if (store.type === 'postgres') return createPostgresDocumentRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureDocuments(data) {
  data.documentTemplates ||= [];
  data.documentPackets ||= [];
  data.documentApprovals ||= [];
  data.signatureRequests ||= [];
  data.signatureRecipients ||= [];
  data.documentAuditEvents ||= [];
  return data;
}

function addAudit(data, input) {
  const row = { id: makeId('docaudit'), ...svc.normalizeAuditEventInput(input), createdAt: now(), updatedAt: now() };
  data.documentAuditEvents.push(row);
  return row;
}

function createJsonDocumentRepository(store) {
  return {
    listTemplates(filters = {}) {
      return ensureDocuments(store.read()).documentTemplates
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.documentType || x.documentType === filters.documentType)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createTemplate(input) {
      const data = ensureDocuments(store.read());
      const row = { id: makeId('doctpl'), ...svc.normalizeTemplateInput(input), createdAt: now(), updatedAt: now() };
      data.documentTemplates.push(row);
      store.write(data);
      return row;
    },
    listPackets(filters = {}) {
      return ensureDocuments(store.read()).documentPackets
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    createPacket(input) {
      const data = ensureDocuments(store.read());
      const row = { id: makeId('docpkt'), ...svc.normalizePacketInput(input), createdAt: now(), updatedAt: now() };
      data.documentPackets.push(row);
      addAudit(data, { packetId: row.id, eventType: 'created', message: `Packet created: ${row.title}` });
      store.write(data);
      return row;
    },
    generatePacket(id) {
      const data = ensureDocuments(store.read());
      const idx = data.documentPackets.findIndex(x => x.id === id);
      if (idx === -1) return null;
      const template = data.documentTemplates.find(x => x.id === data.documentPackets[idx].templateId);
      if (!template) return null;
      data.documentPackets[idx] = svc.generatePacket(data.documentPackets[idx], template);
      addAudit(data, { packetId: id, eventType: 'generated', message: 'Document packet generated.' });
      store.write(data);
      return data.documentPackets[idx];
    },
    listApprovals(packetId) {
      return ensureDocuments(store.read()).documentApprovals.filter(x => x.packetId === packetId);
    },
    createApproval(input) {
      const data = ensureDocuments(store.read());
      const row = { id: makeId('docapp'), ...svc.normalizeApprovalInput(input), createdAt: now(), updatedAt: now() };
      data.documentApprovals.push(row);
      store.write(data);
      return row;
    },
    approve(id, comments = '') {
      const data = ensureDocuments(store.read());
      const idx = data.documentApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.documentApprovals[idx] = svc.approveApprovalRequest(data.documentApprovals[idx], comments);
      addAudit(data, { packetId: data.documentApprovals[idx].packetId, eventType: 'approved', actorName: data.documentApprovals[idx].approverName, message: comments || 'Approved.' });
      store.write(data);
      return data.documentApprovals[idx];
    },
    reject(id, comments = '') {
      const data = ensureDocuments(store.read());
      const idx = data.documentApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.documentApprovals[idx] = svc.rejectApprovalRequest(data.documentApprovals[idx], comments);
      addAudit(data, { packetId: data.documentApprovals[idx].packetId, eventType: 'rejected', actorName: data.documentApprovals[idx].approverName, message: comments || 'Rejected.' });
      store.write(data);
      return data.documentApprovals[idx];
    },
    createSignatureRequest(input) {
      const data = ensureDocuments(store.read());
      const row = { id: makeId('sigreq'), ...svc.normalizeSignatureRequestInput(input), createdAt: now(), updatedAt: now() };
      data.signatureRequests.push(row);
      store.write(data);
      return row;
    },
    sendSignatureRequest(id) {
      const data = ensureDocuments(store.read());
      const idx = data.signatureRequests.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.signatureRequests[idx] = svc.sendSignatureRequest(data.signatureRequests[idx]);
      addAudit(data, { packetId: data.signatureRequests[idx].packetId, signatureRequestId: id, eventType: 'sent', message: 'Signature request sent.' });
      store.write(data);
      return data.signatureRequests[idx];
    },
    listRecipients(signatureRequestId) {
      return ensureDocuments(store.read()).signatureRecipients
        .filter(x => x.signatureRequestId === signatureRequestId)
        .sort((a, b) => Number(a.routingOrder || 0) - Number(b.routingOrder || 0));
    },
    createRecipient(input) {
      const data = ensureDocuments(store.read());
      const row = { id: makeId('sigrec'), ...svc.normalizeRecipientInput(input), createdAt: now(), updatedAt: now() };
      data.signatureRecipients.push(row);
      store.write(data);
      return row;
    },
    signRecipient(id) {
      const data = ensureDocuments(store.read());
      const idx = data.signatureRecipients.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.signatureRecipients[idx] = svc.signRecipient(data.signatureRecipients[idx]);
      const requestId = data.signatureRecipients[idx].signatureRequestId;
      const requestIdx = data.signatureRequests.findIndex(x => x.id === requestId);
      if (requestIdx !== -1) {
        const recipients = data.signatureRecipients.filter(x => x.signatureRequestId === requestId);
        data.signatureRequests[requestIdx] = svc.evaluateSignatureStatus(data.signatureRequests[requestIdx], recipients);
        addAudit(data, { packetId: data.signatureRequests[requestIdx].packetId, signatureRequestId: requestId, eventType: 'signed', actorName: data.signatureRecipients[idx].name, message: `${data.signatureRecipients[idx].name} signed.` });
        if (data.signatureRequests[requestIdx].status === 'completed') {
          const packetIdx = data.documentPackets.findIndex(x => x.id === data.signatureRequests[requestIdx].packetId);
          if (packetIdx !== -1) data.documentPackets[packetIdx] = svc.completePacket(data.documentPackets[packetIdx]);
          addAudit(data, { packetId: data.signatureRequests[requestIdx].packetId, signatureRequestId: requestId, eventType: 'completed', message: 'Signature request completed.' });
        }
      }
      store.write(data);
      return data.signatureRecipients[idx];
    },
    declineRecipient(id) {
      const data = ensureDocuments(store.read());
      const idx = data.signatureRecipients.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.signatureRecipients[idx] = svc.declineRecipient(data.signatureRecipients[idx]);
      store.write(data);
      return data.signatureRecipients[idx];
    },
    auditTrail(packetId) {
      return ensureDocuments(store.read()).documentAuditEvents
        .filter(x => x.packetId === packetId)
        .sort((a, b) => String(a.occurredAt).localeCompare(String(b.occurredAt)));
    }
  };
}

function createPostgresDocumentRepository() {
  return {
    async listTemplates() { return []; },
    async createTemplate(input) { return { id: 'postgres-template-placeholder', ...svc.normalizeTemplateInput(input) }; },
    async listPackets() { return []; },
    async createPacket(input) { return { id: 'postgres-packet-placeholder', ...svc.normalizePacketInput(input) }; },
    async generatePacket() { return null; },
    async listApprovals() { return []; },
    async createApproval(input) { return { id: 'postgres-approval-placeholder', ...svc.normalizeApprovalInput(input) }; },
    async approve() { return null; },
    async reject() { return null; },
    async createSignatureRequest(input) { return { id: 'postgres-signature-placeholder', ...svc.normalizeSignatureRequestInput(input) }; },
    async sendSignatureRequest() { return null; },
    async listRecipients() { return []; },
    async createRecipient(input) { return { id: 'postgres-recipient-placeholder', ...svc.normalizeRecipientInput(input) }; },
    async signRecipient() { return null; },
    async declineRecipient() { return null; },
    async auditTrail() { return []; }
  };
}

module.exports = { createDocumentRepository };
