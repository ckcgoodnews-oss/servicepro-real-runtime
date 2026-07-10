const { makeId, now } = require('../services/id');
const svc = require('../services/securityIncidentResponseService');

function createSecurityIncidentResponseRepository(store) {
  if (store.type === 'json') return createJsonSecurityIncidentResponseRepository(store);
  if (store.type === 'postgres') return createPostgresSecurityIncidentResponseRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureSir(data) {
  data.securityIncidents ||= []; data.securityIncidentTasks ||= []; data.securityIncidentEvidence ||= [];
  data.securityIncidentCommunications ||= []; data.securityIncidentReviews ||= []; data.securityIncidentActions ||= [];
  return data;
}
function updateById(rows, id, fn) { const idx = rows.findIndex(x => x.id === id); if (idx === -1) return null; rows[idx] = fn(rows[idx]); return rows[idx]; }
function createJsonSecurityIncidentResponseRepository(store) {
  return {
    listIncidents(filters = {}) {
      return ensureSir(store.read()).securityIncidents.filter(x => !filters.tenantId || x.tenantId === filters.tenantId).filter(x => !filters.status || x.status === filters.status).filter(x => !filters.severity || x.severity === filters.severity).filter(x => !filters.incidentType || x.incidentType === filters.incidentType).sort((a, b) => String(b.reportedAt).localeCompare(String(a.reportedAt)));
    },
    createIncident(input) {
      const data = ensureSir(store.read());
      const row = { id: makeId('secinc'), ...svc.normalizeIncidentInput({ ...input, severity: input.severity || svc.deriveSeverity(input) }), createdAt: now(), updatedAt: now() };
      row.incidentNumber = row.incidentNumber || `SEC-${String(data.securityIncidents.length + 1).padStart(6, '0')}`;
      data.securityIncidents.push(row); store.write(data); return row;
    },
    transitionIncident(id, status) { const data = ensureSir(store.read()); const row = updateById(data.securityIncidents, id, x => svc.transitionIncident(x, status)); store.write(data); return row; },
    startInvestigation(id, owner = '') { const data = ensureSir(store.read()); const row = updateById(data.securityIncidents, id, x => svc.startInvestigation(x, owner)); store.write(data); return row; },
    createTask(input) { const data = ensureSir(store.read()); const row = { id: makeId('sectask'), ...svc.normalizeTaskInput(input), createdAt: now(), updatedAt: now() }; data.securityIncidentTasks.push(row); store.write(data); return row; },
    listTasks(filters = {}) { return ensureSir(store.read()).securityIncidentTasks.filter(x => !filters.incidentId || x.incidentId === filters.incidentId).filter(x => !filters.status || x.status === filters.status); },
    completeTask(id) { const data = ensureSir(store.read()); const row = updateById(data.securityIncidentTasks, id, svc.completeTask); store.write(data); return row; },
    createEvidence(input) { const data = ensureSir(store.read()); const row = { id: makeId('secevid'), ...svc.normalizeEvidenceInput(input), createdAt: now(), updatedAt: now() }; data.securityIncidentEvidence.push(row); store.write(data); return row; },
    listEvidence(incidentId) { return ensureSir(store.read()).securityIncidentEvidence.filter(x => x.incidentId === incidentId); },
    createCommunication(input) { const data = ensureSir(store.read()); const row = { id: makeId('seccomm'), ...svc.normalizeCommunicationInput(input), createdAt: now(), updatedAt: now() }; data.securityIncidentCommunications.push(row); store.write(data); return row; },
    approveCommunication(id, approvedBy) { const data = ensureSir(store.read()); const row = updateById(data.securityIncidentCommunications, id, x => svc.approveCommunication(x, approvedBy)); store.write(data); return row; },
    sendCommunication(id) { const data = ensureSir(store.read()); const row = updateById(data.securityIncidentCommunications, id, svc.sendCommunication); store.write(data); return row; },
    createReview(input) { const data = ensureSir(store.read()); const row = { id: makeId('secrev'), ...svc.normalizeReviewInput(input), createdAt: now(), updatedAt: now() }; data.securityIncidentReviews.push(row); store.write(data); return row; },
    completeReview(id, rootCause = '', lessonsLearned = '') { const data = ensureSir(store.read()); const row = updateById(data.securityIncidentReviews, id, x => svc.completeReview(x, rootCause, lessonsLearned)); store.write(data); return row; },
    createAction(input) { const data = ensureSir(store.read()); const row = { id: makeId('secact'), ...svc.normalizeActionInput(input), createdAt: now(), updatedAt: now() }; data.securityIncidentActions.push(row); store.write(data); return row; },
    completeAction(id) { const data = ensureSir(store.read()); const row = updateById(data.securityIncidentActions, id, svc.completeAction); store.write(data); return row; },
    acceptActionRisk(id, reason) { const data = ensureSir(store.read()); const row = updateById(data.securityIncidentActions, id, x => svc.acceptActionRisk(x, reason)); store.write(data); return row; },
    metrics(tenantId) { const data = ensureSir(store.read()); return svc.incidentMetrics({ incidents: data.securityIncidents.filter(x => !tenantId || x.tenantId === tenantId), tasks: data.securityIncidentTasks.filter(x => !tenantId || x.tenantId === tenantId), evidence: data.securityIncidentEvidence.filter(x => !tenantId || x.tenantId === tenantId), communications: data.securityIncidentCommunications.filter(x => !tenantId || x.tenantId === tenantId), reviews: data.securityIncidentReviews.filter(x => !tenantId || x.tenantId === tenantId), actions: data.securityIncidentActions.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresSecurityIncidentResponseRepository() {
  return {
    async listIncidents() { return []; }, async createIncident(input) { return { id: 'postgres-security-incident-placeholder', ...svc.normalizeIncidentInput(input) }; },
    async transitionIncident() { return null; }, async startInvestigation() { return null; },
    async createTask(input) { return { id: 'postgres-task-placeholder', ...svc.normalizeTaskInput(input) }; }, async listTasks() { return []; }, async completeTask() { return null; },
    async createEvidence(input) { return { id: 'postgres-evidence-placeholder', ...svc.normalizeEvidenceInput(input) }; }, async listEvidence() { return []; },
    async createCommunication(input) { return { id: 'postgres-communication-placeholder', ...svc.normalizeCommunicationInput(input) }; }, async approveCommunication() { return null; }, async sendCommunication() { return null; },
    async createReview(input) { return { id: 'postgres-review-placeholder', ...svc.normalizeReviewInput(input) }; }, async completeReview() { return null; },
    async createAction(input) { return { id: 'postgres-action-placeholder', ...svc.normalizeActionInput(input) }; }, async completeAction() { return null; }, async acceptActionRisk() { return null; },
    async metrics() { return svc.incidentMetrics({}); }
  };
}
module.exports = { createSecurityIncidentResponseRepository };
