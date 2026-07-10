const { makeId, now } = require('../services/id');
const svc = require('../services/securityIncidentService');

function createSecurityIncidentRepository(store) {
  if (store.type === 'json') return createJsonSecurityIncidentRepository(store);
  if (store.type === 'postgres') return createPostgresSecurityIncidentRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureSecurity(data) {
  data.securityIncidents ||= [];
  data.securityContainmentTasks ||= [];
  data.securityEvidenceRecords ||= [];
  data.securityIncidentNotifications ||= [];
  data.securityPostmortems ||= [];
  return data;
}

function createJsonSecurityIncidentRepository(store) {
  return {
    listIncidents(filters = {}) {
      return ensureSecurity(store.read()).securityIncidents
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity)
        .filter(x => !filters.incidentType || x.incidentType === filters.incidentType)
        .sort((a, b) => String(b.detectedAt).localeCompare(String(a.detectedAt)));
    },
    createIncident(input) {
      const data = ensureSecurity(store.read());
      const row = { id: makeId('secinc'), ...svc.normalizeIncidentInput(input), createdAt: now(), updatedAt: now() };
      row.incidentNumber = row.incidentNumber || `SEC-${String(data.securityIncidents.length + 1).padStart(6, '0')}`;
      data.securityIncidents.push(row);
      store.write(data);
      return row;
    },
    transitionIncident(id, status) {
      const data = ensureSecurity(store.read());
      const idx = data.securityIncidents.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityIncidents[idx] = svc.transitionIncident(data.securityIncidents[idx], status);
      store.write(data);
      return data.securityIncidents[idx];
    },
    listTasks(incidentId) {
      return ensureSecurity(store.read()).securityContainmentTasks
        .filter(x => x.incidentId === incidentId)
        .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
    },
    createTask(input) {
      const data = ensureSecurity(store.read());
      const row = { id: makeId('sectask'), ...svc.normalizeContainmentTaskInput(input), createdAt: now(), updatedAt: now() };
      data.securityContainmentTasks.push(row);
      store.write(data);
      return row;
    },
    completeTask(id) {
      const data = ensureSecurity(store.read());
      const idx = data.securityContainmentTasks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityContainmentTasks[idx] = svc.completeTask(data.securityContainmentTasks[idx]);
      store.write(data);
      return data.securityContainmentTasks[idx];
    },
    listEvidence(incidentId) {
      return ensureSecurity(store.read()).securityEvidenceRecords
        .filter(x => x.incidentId === incidentId)
        .sort((a, b) => String(b.collectedAt).localeCompare(String(a.collectedAt)));
    },
    createEvidence(input) {
      const data = ensureSecurity(store.read());
      const row = { id: makeId('secev'), ...svc.normalizeEvidenceInput(input), createdAt: now(), updatedAt: now() };
      data.securityEvidenceRecords.push(row);
      store.write(data);
      return row;
    },
    addCustodyEntry(id, actor, action) {
      const data = ensureSecurity(store.read());
      const idx = data.securityEvidenceRecords.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityEvidenceRecords[idx] = svc.addCustodyEntry(data.securityEvidenceRecords[idx], actor, action);
      store.write(data);
      return data.securityEvidenceRecords[idx];
    },
    listNotifications(incidentId) {
      return ensureSecurity(store.read()).securityIncidentNotifications
        .filter(x => x.incidentId === incidentId)
        .sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)));
    },
    createNotification(input) {
      const data = ensureSecurity(store.read());
      const row = { id: makeId('secnot'), ...svc.normalizeNotificationInput(input), createdAt: now(), updatedAt: now() };
      data.securityIncidentNotifications.push(row);
      store.write(data);
      return row;
    },
    sendNotification(id) {
      const data = ensureSecurity(store.read());
      const idx = data.securityIncidentNotifications.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityIncidentNotifications[idx] = svc.sendNotification(data.securityIncidentNotifications[idx]);
      store.write(data);
      return data.securityIncidentNotifications[idx];
    },
    failNotification(id, reason) {
      const data = ensureSecurity(store.read());
      const idx = data.securityIncidentNotifications.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityIncidentNotifications[idx] = svc.failNotification(data.securityIncidentNotifications[idx], reason);
      store.write(data);
      return data.securityIncidentNotifications[idx];
    },
    createPostmortem(input) {
      const data = ensureSecurity(store.read());
      const row = { id: makeId('secpost'), ...svc.normalizePostmortemInput(input), createdAt: now(), updatedAt: now() };
      data.securityPostmortems.push(row);
      store.write(data);
      return row;
    },
    listPostmortems(incidentId) {
      return ensureSecurity(store.read()).securityPostmortems.filter(x => x.incidentId === incidentId);
    },
    approvePostmortem(id, approvedBy) {
      const data = ensureSecurity(store.read());
      const idx = data.securityPostmortems.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityPostmortems[idx] = svc.approvePostmortem(data.securityPostmortems[idx], approvedBy);
      store.write(data);
      return data.securityPostmortems[idx];
    },
    publishPostmortem(id) {
      const data = ensureSecurity(store.read());
      const idx = data.securityPostmortems.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityPostmortems[idx] = svc.publishPostmortem(data.securityPostmortems[idx]);
      store.write(data);
      return data.securityPostmortems[idx];
    },
    metrics(tenantId) {
      const incidents = ensureSecurity(store.read()).securityIncidents.filter(x => !tenantId || x.tenantId === tenantId);
      return svc.incidentMetrics(incidents);
    }
  };
}

function createPostgresSecurityIncidentRepository() {
  return {
    async listIncidents() { return []; },
    async createIncident(input) { return { id: 'postgres-incident-placeholder', ...svc.normalizeIncidentInput(input) }; },
    async transitionIncident() { return null; },
    async listTasks() { return []; },
    async createTask(input) { return { id: 'postgres-task-placeholder', ...svc.normalizeContainmentTaskInput(input) }; },
    async completeTask() { return null; },
    async listEvidence() { return []; },
    async createEvidence(input) { return { id: 'postgres-evidence-placeholder', ...svc.normalizeEvidenceInput(input) }; },
    async addCustodyEntry() { return null; },
    async listNotifications() { return []; },
    async createNotification(input) { return { id: 'postgres-notification-placeholder', ...svc.normalizeNotificationInput(input) }; },
    async sendNotification() { return null; },
    async failNotification() { return null; },
    async createPostmortem(input) { return { id: 'postgres-postmortem-placeholder', ...svc.normalizePostmortemInput(input) }; },
    async listPostmortems() { return []; },
    async approvePostmortem() { return null; },
    async publishPostmortem() { return null; },
    async metrics() { return svc.incidentMetrics([]); }
  };
}

module.exports = { createSecurityIncidentRepository };
