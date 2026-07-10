const { makeId, now } = require('../services/id');
const svc = require('../services/productionRc1Service');

function createProductionRc1Repository(store) {
  if (store.type === 'json') return createJsonProductionRc1Repository(store);
  if (store.type === 'postgres') return createPostgresProductionRc1Repository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureProd(data) {
  data.productionHealthChecks ||= [];
  data.productionReadinessChecks ||= [];
  data.productionReleaseGates ||= [];
  data.productionDeployments ||= [];
  data.productionBackups ||= [];
  data.productionRunbooks ||= [];
  data.productionEvidence ||= [];
  return data;
}
function updateById(rows, id, fn) {
  const idx = rows.findIndex(x => x.id === id);
  if (idx === -1) return null;
  rows[idx] = fn(rows[idx]);
  return rows[idx];
}
function createJsonProductionRc1Repository(store) {
  return {
    createHealthCheck(input) { const data = ensureProd(store.read()); const row = { id: makeId('health'), ...svc.normalizeHealthCheckInput(input), createdAt: now(), updatedAt: now() }; data.productionHealthChecks.push(row); store.write(data); return row; },
    recordHealthResult(id, status, message = '', latencyMs = null) { const data = ensureProd(store.read()); const row = updateById(data.productionHealthChecks, id, x => svc.recordHealthResult(x, status, message, latencyMs)); store.write(data); return row; },
    createReadinessCheck(input) { const data = ensureProd(store.read()); const row = { id: makeId('ready'), ...svc.normalizeReadinessCheckInput(input), createdAt: now(), updatedAt: now() }; data.productionReadinessChecks.push(row); store.write(data); return row; },
    markReady(id, evidenceUrl = '') { const data = ensureProd(store.read()); const row = updateById(data.productionReadinessChecks, id, x => svc.markReady(x, evidenceUrl)); store.write(data); return row; },
    blockReadiness(id, reason = '') { const data = ensureProd(store.read()); const row = updateById(data.productionReadinessChecks, id, x => svc.blockReadiness(x, reason)); store.write(data); return row; },
    createReleaseGate(input) { const data = ensureProd(store.read()); const row = { id: makeId('gate'), ...svc.normalizeReleaseGateInput(input), createdAt: now(), updatedAt: now() }; data.productionReleaseGates.push(row); store.write(data); return row; },
    passGate(id, evaluatedBy = '', summary = '') { const data = ensureProd(store.read()); const row = updateById(data.productionReleaseGates, id, x => svc.passGate(x, evaluatedBy, summary)); store.write(data); return row; },
    failGate(id, evaluatedBy = '', summary = '') { const data = ensureProd(store.read()); const row = updateById(data.productionReleaseGates, id, x => svc.failGate(x, evaluatedBy, summary)); store.write(data); return row; },
    waiveGate(id, reason, evaluatedBy = '') { const data = ensureProd(store.read()); const row = updateById(data.productionReleaseGates, id, x => svc.waiveGate(x, reason, evaluatedBy)); store.write(data); return row; },
    createDeployment(input) { const data = ensureProd(store.read()); const row = { id: makeId('deployaudit'), ...svc.normalizeDeploymentAuditInput(input), createdAt: now(), updatedAt: now() }; data.productionDeployments.push(row); store.write(data); return row; },
    startDeployment(id) { const data = ensureProd(store.read()); const row = updateById(data.productionDeployments, id, svc.startDeployment); store.write(data); return row; },
    completeDeployment(id, notes = '') { const data = ensureProd(store.read()); const row = updateById(data.productionDeployments, id, x => svc.completeDeployment(x, notes)); store.write(data); return row; },
    rollbackDeployment(id, rollbackVersion, notes = '') { const data = ensureProd(store.read()); const row = updateById(data.productionDeployments, id, x => svc.rollbackDeployment(x, rollbackVersion, notes)); store.write(data); return row; },
    createBackup(input) { const data = ensureProd(store.read()); const row = { id: makeId('backup'), ...svc.normalizeBackupVerificationInput(input), createdAt: now(), updatedAt: now() }; data.productionBackups.push(row); store.write(data); return row; },
    verifyBackup(id, verifiedBy, restoreTested = false) { const data = ensureProd(store.read()); const row = updateById(data.productionBackups, id, x => svc.verifyBackup(x, verifiedBy, restoreTested)); store.write(data); return row; },
    failBackup(id, reason) { const data = ensureProd(store.read()); const row = updateById(data.productionBackups, id, x => svc.failBackup(x, reason)); store.write(data); return row; },
    createRunbook(input) { const data = ensureProd(store.read()); const row = { id: makeId('runbook'), ...svc.normalizeRunbookInput(input), createdAt: now(), updatedAt: now() }; data.productionRunbooks.push(row); store.write(data); return row; },
    activateRunbook(id) { const data = ensureProd(store.read()); const row = updateById(data.productionRunbooks, id, svc.activateRunbook); store.write(data); return row; },
    createEvidence(input) { const data = ensureProd(store.read()); const row = { id: makeId('evidence'), ...svc.normalizeEvidenceInput(input), createdAt: now(), updatedAt: now() }; data.productionEvidence.push(row); store.write(data); return row; },
    verifyEvidence(id, verifiedBy) { const data = ensureProd(store.read()); const row = updateById(data.productionEvidence, id, x => svc.verifyEvidence(x, verifiedBy)); store.write(data); return row; },
    releaseReady(tenantId) { const data = ensureProd(store.read()); return svc.releaseReady({ readiness: data.productionReadinessChecks.filter(x => !tenantId || x.tenantId === tenantId), gates: data.productionReleaseGates.filter(x => !tenantId || x.tenantId === tenantId), health: data.productionHealthChecks.filter(x => !tenantId || x.tenantId === tenantId), backups: data.productionBackups.filter(x => !tenantId || x.tenantId === tenantId) }); },
    metrics(tenantId) { const data = ensureProd(store.read()); return svc.productionMetrics({ health: data.productionHealthChecks.filter(x => !tenantId || x.tenantId === tenantId), readiness: data.productionReadinessChecks.filter(x => !tenantId || x.tenantId === tenantId), gates: data.productionReleaseGates.filter(x => !tenantId || x.tenantId === tenantId), deployments: data.productionDeployments.filter(x => !tenantId || x.tenantId === tenantId), backups: data.productionBackups.filter(x => !tenantId || x.tenantId === tenantId), runbooks: data.productionRunbooks.filter(x => !tenantId || x.tenantId === tenantId), evidence: data.productionEvidence.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresProductionRc1Repository() {
  return {
    async createHealthCheck(input) { return { id: 'postgres-health-placeholder', ...svc.normalizeHealthCheckInput(input) }; }, async recordHealthResult() { return null; },
    async createReadinessCheck(input) { return { id: 'postgres-readiness-placeholder', ...svc.normalizeReadinessCheckInput(input) }; }, async markReady() { return null; }, async blockReadiness() { return null; },
    async createReleaseGate(input) { return { id: 'postgres-gate-placeholder', ...svc.normalizeReleaseGateInput(input) }; }, async passGate() { return null; }, async failGate() { return null; }, async waiveGate() { return null; },
    async createDeployment(input) { return { id: 'postgres-deployment-placeholder', ...svc.normalizeDeploymentAuditInput(input) }; }, async startDeployment() { return null; }, async completeDeployment() { return null; }, async rollbackDeployment() { return null; },
    async createBackup(input) { return { id: 'postgres-backup-placeholder', ...svc.normalizeBackupVerificationInput(input) }; }, async verifyBackup() { return null; }, async failBackup() { return null; },
    async createRunbook(input) { return { id: 'postgres-runbook-placeholder', ...svc.normalizeRunbookInput(input) }; }, async activateRunbook() { return null; },
    async createEvidence(input) { return { id: 'postgres-evidence-placeholder', ...svc.normalizeEvidenceInput(input) }; }, async verifyEvidence() { return null; },
    async releaseReady() { return false; }, async metrics() { return svc.productionMetrics({}); }
  };
}
module.exports = { createProductionRc1Repository };
