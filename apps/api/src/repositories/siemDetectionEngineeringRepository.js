const { makeId, now } = require('../services/id');
const svc = require('../services/siemDetectionEngineeringService');

function createSiemDetectionEngineeringRepository(store) {
  if (store.type === 'json') return createJsonSiemDetectionEngineeringRepository(store);
  if (store.type === 'postgres') return createPostgresSiemDetectionEngineeringRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureSiem(data) { data.siemLogSources ||= []; data.siemDetectionRules ||= []; data.siemRuleTests ||= []; data.siemAlerts ||= []; data.siemSuppressions ||= []; data.siemTunings ||= []; return data; }
function updateById(rows, id, fn) { const idx = rows.findIndex(x => x.id === id); if (idx === -1) return null; rows[idx] = fn(rows[idx]); return rows[idx]; }
function createJsonSiemDetectionEngineeringRepository(store) {
  return {
    createSource(input) { const data = ensureSiem(store.read()); const row = { id: makeId('siemsrc'), ...svc.normalizeLogSourceInput(input), createdAt: now(), updatedAt: now() }; data.siemLogSources.push(row); store.write(data); return row; },
    listSources(filters = {}) { return ensureSiem(store.read()).siemLogSources.filter(x => !filters.tenantId || x.tenantId === filters.tenantId).filter(x => !filters.status || x.status === filters.status).filter(x => !filters.sourceType || x.sourceType === filters.sourceType); },
    activateSource(id) { const data = ensureSiem(store.read()); const row = updateById(data.siemLogSources, id, svc.activateSource); store.write(data); return row; },
    markSourceDegraded(id) { const data = ensureSiem(store.read()); const row = updateById(data.siemLogSources, id, svc.markSourceDegraded); store.write(data); return row; },
    createRule(input) { const data = ensureSiem(store.read()); const row = { id: makeId('siemrule'), ...svc.normalizeRuleInput(input), createdAt: now(), updatedAt: now() }; data.siemDetectionRules.push(row); store.write(data); return row; },
    listRules(filters = {}) { return ensureSiem(store.read()).siemDetectionRules.filter(x => !filters.tenantId || x.tenantId === filters.tenantId).filter(x => !filters.status || x.status === filters.status).filter(x => !filters.severity || x.severity === filters.severity).sort((a,b)=>svc.severityRank(b.severity)-svc.severityRank(a.severity)); },
    activateRule(id) { const data = ensureSiem(store.read()); const row = updateById(data.siemDetectionRules, id, svc.activateRule); store.write(data); return row; },
    disableRule(id) { const data = ensureSiem(store.read()); const row = updateById(data.siemDetectionRules, id, svc.disableRule); store.write(data); return row; },
    createRuleTest(input) { const data = ensureSiem(store.read()); const row = { id: makeId('siemtest'), ...svc.normalizeRuleTestInput(input), createdAt: now(), updatedAt: now() }; data.siemRuleTests.push(row); store.write(data); return row; },
    runRuleTest(id, actualMatch) { const data = ensureSiem(store.read()); const row = updateById(data.siemRuleTests, id, x => svc.runRuleTest(x, actualMatch)); store.write(data); return row; },
    createAlert(input) { const data = ensureSiem(store.read()); let row = { id: makeId('siemalert'), ...svc.normalizeAlertInput(input), createdAt: now(), updatedAt: now() }; for (const s of data.siemSuppressions) row = svc.applySuppressionToAlert(row, s); data.siemAlerts.push(row); store.write(data); return row; },
    listAlerts(filters = {}) { return ensureSiem(store.read()).siemAlerts.filter(x => !filters.tenantId || x.tenantId === filters.tenantId).filter(x => !filters.status || x.status === filters.status).filter(x => !filters.severity || x.severity === filters.severity).sort((a,b)=>String(b.observedAt).localeCompare(String(a.observedAt))); },
    triageAlert(id, assignee = '') { const data = ensureSiem(store.read()); const row = updateById(data.siemAlerts, id, x => svc.triageAlert(x, assignee)); store.write(data); return row; },
    investigateAlert(id, assignee = '') { const data = ensureSiem(store.read()); const row = updateById(data.siemAlerts, id, x => svc.investigateAlert(x, assignee)); store.write(data); return row; },
    escalateAlert(id, incidentId = '') { const data = ensureSiem(store.read()); const row = updateById(data.siemAlerts, id, x => svc.escalateAlert(x, incidentId)); store.write(data); return row; },
    closeAlert(id, reason) { const data = ensureSiem(store.read()); const row = updateById(data.siemAlerts, id, x => svc.closeAlert(x, reason)); store.write(data); return row; },
    markFalsePositive(id, reason) { const data = ensureSiem(store.read()); const row = updateById(data.siemAlerts, id, x => svc.markFalsePositive(x, reason)); store.write(data); return row; },
    createSuppression(input) { const data = ensureSiem(store.read()); const row = { id: makeId('siemsupp'), ...svc.normalizeSuppressionInput(input), createdAt: now(), updatedAt: now() }; data.siemSuppressions.push(row); store.write(data); return row; },
    createTuning(input) { const data = ensureSiem(store.read()); const row = { id: makeId('siemtune'), ...svc.normalizeTuningInput(input), createdAt: now(), updatedAt: now() }; data.siemTunings.push(row); store.write(data); return row; },
    approveTuning(id, approvedBy) { const data = ensureSiem(store.read()); const row = updateById(data.siemTunings, id, x => svc.approveTuning(x, approvedBy)); store.write(data); return row; },
    applyTuning(id) { const data = ensureSiem(store.read()); const tuning = updateById(data.siemTunings, id, svc.applyTuning); if (tuning && tuning.afterQuery) updateById(data.siemDetectionRules, tuning.ruleId, r => ({ ...r, query: tuning.afterQuery, updatedAt: now() })); store.write(data); return tuning; },
    metrics(tenantId) { const data = ensureSiem(store.read()); return svc.detectionMetrics({ sources: data.siemLogSources.filter(x => !tenantId || x.tenantId === tenantId), rules: data.siemDetectionRules.filter(x => !tenantId || x.tenantId === tenantId), tests: data.siemRuleTests.filter(x => !tenantId || x.tenantId === tenantId), alerts: data.siemAlerts.filter(x => !tenantId || x.tenantId === tenantId), suppressions: data.siemSuppressions.filter(x => !tenantId || x.tenantId === tenantId), tunings: data.siemTunings.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresSiemDetectionEngineeringRepository() {
  return {
    async createSource(input) { return { id: 'postgres-source-placeholder', ...svc.normalizeLogSourceInput(input) }; }, async listSources() { return []; }, async activateSource() { return null; }, async markSourceDegraded() { return null; },
    async createRule(input) { return { id: 'postgres-rule-placeholder', ...svc.normalizeRuleInput(input) }; }, async listRules() { return []; }, async activateRule() { return null; }, async disableRule() { return null; },
    async createRuleTest(input) { return { id: 'postgres-test-placeholder', ...svc.normalizeRuleTestInput(input) }; }, async runRuleTest() { return null; },
    async createAlert(input) { return { id: 'postgres-alert-placeholder', ...svc.normalizeAlertInput(input) }; }, async listAlerts() { return []; }, async triageAlert() { return null; }, async investigateAlert() { return null; }, async escalateAlert() { return null; }, async closeAlert() { return null; }, async markFalsePositive() { return null; },
    async createSuppression(input) { return { id: 'postgres-suppression-placeholder', ...svc.normalizeSuppressionInput(input) }; }, async createTuning(input) { return { id: 'postgres-tuning-placeholder', ...svc.normalizeTuningInput(input) }; }, async approveTuning() { return null; }, async applyTuning() { return null; }, async metrics() { return svc.detectionMetrics({}); }
  };
}
module.exports = { createSiemDetectionEngineeringRepository };
