const { makeId, now } = require('../services/id');
const svc = require('../services/enterpriseAuditComplianceService');

function createEnterpriseAuditComplianceRepository(store) {
  if (store.type === 'json') return createJsonEnterpriseAuditComplianceRepository(store);
  if (store.type === 'postgres') return createPostgresEnterpriseAuditComplianceRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureAudit(data) {
  data.auditPrograms ||= [];
  data.auditControls ||= [];
  data.auditEvidenceRequests ||= [];
  data.auditArtifacts ||= [];
  data.auditControlTests ||= [];
  data.auditFindings ||= [];
  data.auditRemediations ||= [];
  data.auditAttestations ||= [];
  return data;
}
function updateById(rows, id, fn) {
  const idx = rows.findIndex(x => x.id === id);
  if (idx === -1) return null;
  rows[idx] = fn(rows[idx]);
  return rows[idx];
}
function createJsonEnterpriseAuditComplianceRepository(store) {
  return {
    createProgram(input) { const data = ensureAudit(store.read()); const row = { id: makeId('auditprog'), ...svc.normalizeProgramInput(input), createdAt: now(), updatedAt: now() }; data.auditPrograms.push(row); store.write(data); return row; },
    activateProgram(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditPrograms, id, svc.activateProgram); store.write(data); return row; },
    closeProgram(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditPrograms, id, svc.closeProgram); store.write(data); return row; },
    createControl(input) { const data = ensureAudit(store.read()); const row = { id: makeId('control'), ...svc.normalizeControlInput(input), createdAt: now(), updatedAt: now() }; data.auditControls.push(row); store.write(data); return row; },
    activateControl(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditControls, id, svc.activateControl); store.write(data); return row; },
    retireControl(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditControls, id, svc.retireControl); store.write(data); return row; },
    createEvidenceRequest(input) { const data = ensureAudit(store.read()); const row = { id: makeId('evreq'), ...svc.normalizeEvidenceRequestInput(input), createdAt: now(), updatedAt: now() }; data.auditEvidenceRequests.push(row); store.write(data); return row; },
    submitEvidenceRequest(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditEvidenceRequests, id, svc.submitEvidenceRequest); store.write(data); return row; },
    acceptEvidenceRequest(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditEvidenceRequests, id, svc.acceptEvidenceRequest); store.write(data); return row; },
    rejectEvidenceRequest(id, reason) { const data = ensureAudit(store.read()); const row = updateById(data.auditEvidenceRequests, id, x => svc.rejectEvidenceRequest(x, reason)); store.write(data); return row; },
    createArtifact(input) { const data = ensureAudit(store.read()); const row = { id: makeId('artifact'), ...svc.normalizeArtifactInput(input), createdAt: now(), updatedAt: now() }; data.auditArtifacts.push(row); store.write(data); return row; },
    acceptArtifact(id, reviewedBy) { const data = ensureAudit(store.read()); const row = updateById(data.auditArtifacts, id, x => svc.acceptArtifact(x, reviewedBy)); store.write(data); return row; },
    rejectArtifact(id, reviewedBy, reason) { const data = ensureAudit(store.read()); const row = updateById(data.auditArtifacts, id, x => svc.rejectArtifact(x, reviewedBy, reason)); store.write(data); return row; },
    createControlTest(input) { const data = ensureAudit(store.read()); const row = { id: makeId('ctrltest'), ...svc.normalizeControlTestInput(input), createdAt: now(), updatedAt: now() }; data.auditControlTests.push(row); store.write(data); return row; },
    startControlTest(id, tester = '') { const data = ensureAudit(store.read()); const row = updateById(data.auditControlTests, id, x => svc.startControlTest(x, tester)); store.write(data); return row; },
    completeControlTest(id, exceptionsFound = 0, summary = '') { const data = ensureAudit(store.read()); const row = updateById(data.auditControlTests, id, x => svc.completeControlTest(x, exceptionsFound, summary)); store.write(data); return row; },
    createFinding(input) { const data = ensureAudit(store.read()); const row = { id: makeId('finding'), ...svc.normalizeFindingInput(input), createdAt: now(), updatedAt: now() }; data.auditFindings.push(row); store.write(data); return row; },
    remediateFinding(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditFindings, id, svc.remediateFinding); store.write(data); return row; },
    closeFinding(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditFindings, id, svc.closeFinding); store.write(data); return row; },
    acceptFindingRisk(id, reason) { const data = ensureAudit(store.read()); const row = updateById(data.auditFindings, id, x => svc.acceptFindingRisk(x, reason)); store.write(data); return row; },
    createRemediation(input) { const data = ensureAudit(store.read()); const row = { id: makeId('remed'), ...svc.normalizeRemediationInput(input), createdAt: now(), updatedAt: now() }; data.auditRemediations.push(row); store.write(data); return row; },
    startRemediation(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditRemediations, id, svc.startRemediation); store.write(data); return row; },
    completeRemediation(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditRemediations, id, svc.completeRemediation); store.write(data); return row; },
    createAttestation(input) { const data = ensureAudit(store.read()); const row = { id: makeId('attest'), ...svc.normalizeAttestationInput(input), createdAt: now(), updatedAt: now() }; data.auditAttestations.push(row); store.write(data); return row; },
    submitAttestation(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditAttestations, id, svc.submitAttestation); store.write(data); return row; },
    acceptAttestation(id) { const data = ensureAudit(store.read()); const row = updateById(data.auditAttestations, id, svc.acceptAttestation); store.write(data); return row; },
    auditReady(tenantId) { const data = ensureAudit(store.read()); return svc.auditReady({ controls: data.auditControls.filter(x => !tenantId || x.tenantId === tenantId), requests: data.auditEvidenceRequests.filter(x => !tenantId || x.tenantId === tenantId), tests: data.auditControlTests.filter(x => !tenantId || x.tenantId === tenantId), findings: data.auditFindings.filter(x => !tenantId || x.tenantId === tenantId), attestations: data.auditAttestations.filter(x => !tenantId || x.tenantId === tenantId) }); },
    metrics(tenantId) { const data = ensureAudit(store.read()); return svc.complianceMetrics({ programs: data.auditPrograms.filter(x => !tenantId || x.tenantId === tenantId), controls: data.auditControls.filter(x => !tenantId || x.tenantId === tenantId), requests: data.auditEvidenceRequests.filter(x => !tenantId || x.tenantId === tenantId), artifacts: data.auditArtifacts.filter(x => !tenantId || x.tenantId === tenantId), tests: data.auditControlTests.filter(x => !tenantId || x.tenantId === tenantId), findings: data.auditFindings.filter(x => !tenantId || x.tenantId === tenantId), remediations: data.auditRemediations.filter(x => !tenantId || x.tenantId === tenantId), attestations: data.auditAttestations.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresEnterpriseAuditComplianceRepository() {
  return {
    async createProgram(input) { return { id: 'postgres-program-placeholder', ...svc.normalizeProgramInput(input) }; }, async activateProgram() { return null; }, async closeProgram() { return null; },
    async createControl(input) { return { id: 'postgres-control-placeholder', ...svc.normalizeControlInput(input) }; }, async activateControl() { return null; }, async retireControl() { return null; },
    async createEvidenceRequest(input) { return { id: 'postgres-request-placeholder', ...svc.normalizeEvidenceRequestInput(input) }; }, async submitEvidenceRequest() { return null; }, async acceptEvidenceRequest() { return null; }, async rejectEvidenceRequest() { return null; },
    async createArtifact(input) { return { id: 'postgres-artifact-placeholder', ...svc.normalizeArtifactInput(input) }; }, async acceptArtifact() { return null; }, async rejectArtifact() { return null; },
    async createControlTest(input) { return { id: 'postgres-test-placeholder', ...svc.normalizeControlTestInput(input) }; }, async startControlTest() { return null; }, async completeControlTest() { return null; },
    async createFinding(input) { return { id: 'postgres-finding-placeholder', ...svc.normalizeFindingInput(input) }; }, async remediateFinding() { return null; }, async closeFinding() { return null; }, async acceptFindingRisk() { return null; },
    async createRemediation(input) { return { id: 'postgres-remed-placeholder', ...svc.normalizeRemediationInput(input) }; }, async startRemediation() { return null; }, async completeRemediation() { return null; },
    async createAttestation(input) { return { id: 'postgres-attest-placeholder', ...svc.normalizeAttestationInput(input) }; }, async submitAttestation() { return null; }, async acceptAttestation() { return null; },
    async auditReady() { return false; }, async metrics() { return svc.complianceMetrics({}); }
  };
}
module.exports = { createEnterpriseAuditComplianceRepository };
