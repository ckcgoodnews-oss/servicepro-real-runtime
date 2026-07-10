const { makeId, now } = require('../services/id');
const svc = require('../services/goLiveHypercareService');

function createGoLiveHypercareRepository(store) {
  if (store.type === 'json') return createJsonGoLiveHypercareRepository(store);
  if (store.type === 'postgres') return createPostgresGoLiveHypercareRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureGl(data) {
  data.goLiveChecklist ||= [];
  data.goLiveCutoverPlans ||= [];
  data.goLiveCutoverSteps ||= [];
  data.goLiveDnsCutovers ||= [];
  data.goLiveCommunications ||= [];
  data.goLiveRollbackDecisions ||= [];
  data.hypercareIssues ||= [];
  data.hypercareDailyReports ||= [];
  return data;
}
function updateById(rows, id, fn) {
  const idx = rows.findIndex(x => x.id === id);
  if (idx === -1) return null;
  rows[idx] = fn(rows[idx]);
  return rows[idx];
}
function createJsonGoLiveHypercareRepository(store) {
  return {
    createChecklistItem(input) { const data = ensureGl(store.read()); const row = { id: makeId('glcheck'), ...svc.normalizeChecklistInput(input), createdAt: now(), updatedAt: now() }; data.goLiveChecklist.push(row); store.write(data); return row; },
    completeChecklistItem(id, evidenceUrl = '') { const data = ensureGl(store.read()); const row = updateById(data.goLiveChecklist, id, x => svc.completeChecklist(x, evidenceUrl)); store.write(data); return row; },
    waiveChecklistItem(id, reason) { const data = ensureGl(store.read()); const row = updateById(data.goLiveChecklist, id, x => svc.waiveChecklist(x, reason)); store.write(data); return row; },
    createCutoverPlan(input) { const data = ensureGl(store.read()); const row = { id: makeId('cutover'), ...svc.normalizeCutoverPlanInput(input), createdAt: now(), updatedAt: now() }; data.goLiveCutoverPlans.push(row); store.write(data); return row; },
    approveCutover(id, approvedBy) { const data = ensureGl(store.read()); const row = updateById(data.goLiveCutoverPlans, id, x => svc.approveCutover(x, approvedBy)); store.write(data); return row; },
    startCutover(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveCutoverPlans, id, svc.startCutover); store.write(data); return row; },
    completeCutover(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveCutoverPlans, id, svc.completeCutover); store.write(data); return row; },
    rollbackCutover(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveCutoverPlans, id, svc.rollbackCutover); store.write(data); return row; },
    createStep(input) { const data = ensureGl(store.read()); const row = { id: makeId('cutstep'), ...svc.normalizeCutoverStepInput(input), createdAt: now(), updatedAt: now() }; data.goLiveCutoverSteps.push(row); store.write(data); return row; },
    startStep(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveCutoverSteps, id, svc.startStep); store.write(data); return row; },
    completeStep(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveCutoverSteps, id, svc.completeStep); store.write(data); return row; },
    createDns(input) { const data = ensureGl(store.read()); const row = { id: makeId('dns'), ...svc.normalizeDnsCutoverInput(input), createdAt: now(), updatedAt: now() }; data.goLiveDnsCutovers.push(row); store.write(data); return row; },
    validateDns(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveDnsCutovers, id, svc.validateDns); store.write(data); return row; },
    startDnsPropagation(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveDnsCutovers, id, svc.startDnsPropagation); store.write(data); return row; },
    completeDns(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveDnsCutovers, id, svc.completeDns); store.write(data); return row; },
    createCommunication(input) { const data = ensureGl(store.read()); const row = { id: makeId('glcomm'), ...svc.normalizeLaunchCommunicationInput(input), createdAt: now(), updatedAt: now() }; data.goLiveCommunications.push(row); store.write(data); return row; },
    approveCommunication(id, approvedBy) { const data = ensureGl(store.read()); const row = updateById(data.goLiveCommunications, id, x => svc.approveCommunication(x, approvedBy)); store.write(data); return row; },
    sendCommunication(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveCommunications, id, svc.sendCommunication); store.write(data); return row; },
    createRollbackDecision(input) { const data = ensureGl(store.read()); const row = { id: makeId('rollback'), ...svc.normalizeRollbackDecisionInput(input), createdAt: now(), updatedAt: now() }; data.goLiveRollbackDecisions.push(row); store.write(data); return row; },
    recommendRollback(id, reason, impactSummary = '') { const data = ensureGl(store.read()); const row = updateById(data.goLiveRollbackDecisions, id, x => svc.recommendRollback(x, reason, impactSummary)); store.write(data); return row; },
    approveRollback(id, decidedBy) { const data = ensureGl(store.read()); const row = updateById(data.goLiveRollbackDecisions, id, x => svc.approveRollback(x, decidedBy)); store.write(data); return row; },
    executeRollback(id) { const data = ensureGl(store.read()); const row = updateById(data.goLiveRollbackDecisions, id, svc.executeRollback); store.write(data); return row; },
    createIssue(input) { const data = ensureGl(store.read()); const row = { id: makeId('hcissue'), ...svc.normalizeHypercareIssueInput(input), createdAt: now(), updatedAt: now() }; data.hypercareIssues.push(row); store.write(data); return row; },
    resolveIssue(id, resolution) { const data = ensureGl(store.read()); const row = updateById(data.hypercareIssues, id, x => svc.resolveIssue(x, resolution)); store.write(data); return row; },
    closeIssue(id) { const data = ensureGl(store.read()); const row = updateById(data.hypercareIssues, id, svc.closeIssue); store.write(data); return row; },
    createDailyReport(input) { const data = ensureGl(store.read()); const row = { id: makeId('hcreport'), ...svc.normalizeDailyReportInput(input), createdAt: now(), updatedAt: now() }; data.hypercareDailyReports.push(row); store.write(data); return row; },
    publishDailyReport(id, publishedBy) { const data = ensureGl(store.read()); const row = updateById(data.hypercareDailyReports, id, x => svc.publishDailyReport(x, publishedBy)); store.write(data); return row; },
    goLiveReady(tenantId) { const data = ensureGl(store.read()); return svc.goLiveReady({ checklist: data.goLiveChecklist.filter(x => !tenantId || x.tenantId === tenantId), cutoverPlans: data.goLiveCutoverPlans.filter(x => !tenantId || x.tenantId === tenantId), dns: data.goLiveDnsCutovers.filter(x => !tenantId || x.tenantId === tenantId) }); },
    metrics(tenantId) { const data = ensureGl(store.read()); return svc.hypercareMetrics({ checklist: data.goLiveChecklist.filter(x => !tenantId || x.tenantId === tenantId), cutoverPlans: data.goLiveCutoverPlans.filter(x => !tenantId || x.tenantId === tenantId), steps: data.goLiveCutoverSteps.filter(x => !tenantId || x.tenantId === tenantId), dns: data.goLiveDnsCutovers.filter(x => !tenantId || x.tenantId === tenantId), communications: data.goLiveCommunications.filter(x => !tenantId || x.tenantId === tenantId), decisions: data.goLiveRollbackDecisions.filter(x => !tenantId || x.tenantId === tenantId), issues: data.hypercareIssues.filter(x => !tenantId || x.tenantId === tenantId), reports: data.hypercareDailyReports.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresGoLiveHypercareRepository() {
  return {
    async createChecklistItem(input) { return { id: 'postgres-check-placeholder', ...svc.normalizeChecklistInput(input) }; }, async completeChecklistItem() { return null; }, async waiveChecklistItem() { return null; },
    async createCutoverPlan(input) { return { id: 'postgres-cutover-placeholder', ...svc.normalizeCutoverPlanInput(input) }; }, async approveCutover() { return null; }, async startCutover() { return null; }, async completeCutover() { return null; }, async rollbackCutover() { return null; },
    async createStep(input) { return { id: 'postgres-step-placeholder', ...svc.normalizeCutoverStepInput(input) }; }, async startStep() { return null; }, async completeStep() { return null; },
    async createDns(input) { return { id: 'postgres-dns-placeholder', ...svc.normalizeDnsCutoverInput(input) }; }, async validateDns() { return null; }, async startDnsPropagation() { return null; }, async completeDns() { return null; },
    async createCommunication(input) { return { id: 'postgres-comm-placeholder', ...svc.normalizeLaunchCommunicationInput(input) }; }, async approveCommunication() { return null; }, async sendCommunication() { return null; },
    async createRollbackDecision(input) { return { id: 'postgres-rollback-placeholder', ...svc.normalizeRollbackDecisionInput(input) }; }, async recommendRollback() { return null; }, async approveRollback() { return null; }, async executeRollback() { return null; },
    async createIssue(input) { return { id: 'postgres-issue-placeholder', ...svc.normalizeHypercareIssueInput(input) }; }, async resolveIssue() { return null; }, async closeIssue() { return null; },
    async createDailyReport(input) { return { id: 'postgres-report-placeholder', ...svc.normalizeDailyReportInput(input) }; }, async publishDailyReport() { return null; },
    async goLiveReady() { return false; }, async metrics() { return svc.hypercareMetrics({}); }
  };
}
module.exports = { createGoLiveHypercareRepository };
