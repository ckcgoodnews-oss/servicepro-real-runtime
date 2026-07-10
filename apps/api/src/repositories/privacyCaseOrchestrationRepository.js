const { makeId, now } = require('../services/id');
const svc = require('../services/privacyCaseOrchestrationService');

function ensure(data) { data.privacyCases ||= []; data.privacyCaseTasks ||= []; data.privacyCaseCommunications ||= []; return data; }
function update(rows, id, fn) { const index = rows.findIndex(x => x.id === id); if (index < 0) return null; rows[index] = fn(rows[index]); return rows[index]; }
function createPrivacyCaseOrchestrationRepository(store) {
  if (store.type === 'postgres') return createPostgresRepository();
  if (store.type !== 'json') throw new Error(`Unsupported store type: ${store.type}`);
  return {
    createCase(input) { const data = ensure(store.read()); const row = { id: makeId('privacycase'), ...svc.normalizeCaseInput(input), createdAt: now(), updatedAt: now() }; data.privacyCases.push(row); store.write(data); return row; },
    verify(id, evidence) { const data = ensure(store.read()); const row = update(data.privacyCases, id, x => svc.recordVerification(x, evidence)); store.write(data); return row; },
    extend(id, days, reason) { const data = ensure(store.read()); const row = update(data.privacyCases, id, x => svc.extendDeadline(x, days, reason)); store.write(data); return row; },
    close(id, outcome) { const data = ensure(store.read()); const row = update(data.privacyCases, id, x => svc.closeCase(x, outcome)); store.write(data); return row; },
    createTask(input) { const data = ensure(store.read()); const row = { id: makeId('privacytask'), ...svc.normalizeTaskInput(input), createdAt: now(), updatedAt: now() }; data.privacyCaseTasks.push(row); store.write(data); return row; },
    completeTask(id, evidence) { const data = ensure(store.read()); const row = update(data.privacyCaseTasks, id, x => svc.completeTask(x, evidence)); store.write(data); return row; },
    createCommunication(input) { const data = ensure(store.read()); const row = { id: makeId('privacycomm'), ...svc.normalizeCommunicationInput(input), createdAt: now() }; data.privacyCaseCommunications.push(row); store.write(data); return row; },
    metrics(tenantId) { const data = ensure(store.read()); return svc.orchestrationMetrics({ cases: data.privacyCases.filter(x => !tenantId || x.tenantId === tenantId), tasks: data.privacyCaseTasks.filter(x => !tenantId || x.tenantId === tenantId), communications: data.privacyCaseCommunications.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresRepository() { return { async createCase(input) { return { id: 'postgres-privacy-case-placeholder', ...svc.normalizeCaseInput(input) }; }, async verify() { return null; }, async extend() { return null; }, async close() { return null; }, async createTask(input) { return { id: 'postgres-privacy-task-placeholder', ...svc.normalizeTaskInput(input) }; }, async completeTask() { return null; }, async createCommunication(input) { return { id: 'postgres-privacy-communication-placeholder', ...svc.normalizeCommunicationInput(input) }; }, async metrics() { return svc.orchestrationMetrics({}); } }; }
module.exports = { createPrivacyCaseOrchestrationRepository };
