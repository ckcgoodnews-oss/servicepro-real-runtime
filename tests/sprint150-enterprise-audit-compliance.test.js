const fs = require('fs');
const required = ['apps/api/src/services/enterpriseAuditComplianceService.js','apps/api/src/repositories/enterpriseAuditComplianceRepository.js','apps/api/src/routes/enterpriseAuditCompliance.js','scripts/seed-enterprise-audit-compliance.js','packages/database/postgres/150_enterprise_audit_compliance.sql','docs/sprint150-enterprise-audit-compliance.md'];
for (const file of required) { if (!fs.existsSync(file)) { console.error(`Missing required Sprint 150 patch file: ${file}`); process.exit(1); } }
const svc = require('../apps/api/src/services/enterpriseAuditComplianceService');

let program = svc.normalizeProgramInput({ tenantId: 'tenant_demo', name: 'SOC 2 Type II' });
program = svc.activateProgram(program);
if (program.status !== 'active' || program.code !== 'SOC-2-TYPE-II') process.exit(1);

let control = svc.activateControl(svc.normalizeControlInput({ tenantId: 'tenant_demo', controlCode: 'CC6.1', title: 'Logical Access' }));
if (control.status !== 'active') process.exit(1);

let request = svc.acceptEvidenceRequest(svc.submitEvidenceRequest(svc.normalizeEvidenceRequestInput({ tenantId: 'tenant_demo', controlId: 'ctrl1', title: 'Access Review' })));
if (request.status !== 'accepted') process.exit(1);

let artifact = svc.acceptArtifact(svc.normalizeArtifactInput({ tenantId: 'tenant_demo', requestId: 'req1', title: 'Export' }), 'auditor');
if (artifact.status !== 'accepted') process.exit(1);

let test = svc.completeControlTest(svc.startControlTest(svc.normalizeControlTestInput({ tenantId: 'tenant_demo', controlId: 'ctrl1' }), 'auditor'), 0, 'passed');
if (test.status !== 'passed') process.exit(1);

let finding = svc.closeFinding(svc.remediateFinding(svc.normalizeFindingInput({ tenantId: 'tenant_demo', title: 'Observation', severity: 'low' })));
if (finding.status !== 'closed') process.exit(1);

let remediation = svc.completeRemediation(svc.startRemediation(svc.normalizeRemediationInput({ tenantId: 'tenant_demo', findingId: 'finding1', summary: 'Fix' })));
if (remediation.status !== 'completed') process.exit(1);

let attestation = svc.acceptAttestation(svc.submitAttestation(svc.normalizeAttestationInput({ tenantId: 'tenant_demo', programId: 'prog1', attestor: 'CEO' })));
if (attestation.status !== 'accepted') process.exit(1);

if (!svc.auditReady({ controls: [control], requests: [request], tests: [test], findings: [finding], attestations: [attestation] })) process.exit(1);
if (svc.rejectArtifact(svc.normalizeArtifactInput({ tenantId: 'tenant_demo', requestId: 'req1', title: 'Bad' }), 'auditor', 'bad').status !== 'rejected') process.exit(1);
if (svc.acceptFindingRisk(svc.normalizeFindingInput({ tenantId: 'tenant_demo', title: 'Risk' }), 'accepted').status !== 'accepted_risk') process.exit(1);

const metrics = svc.complianceMetrics({ programs: [program], controls: [control], requests: [{...request, status: 'open'}], artifacts: [artifact], tests: [test, {...test, status: 'failed'}], findings: [{...finding, status: 'open', severity: 'critical'}], remediations: [remediation], attestations: [attestation] });
if (metrics.activePrograms !== 1 || metrics.activeControls !== 1 || metrics.openEvidenceRequests !== 1 || metrics.acceptedArtifacts !== 1 || metrics.passedTests !== 1 || metrics.failedTests !== 1 || metrics.criticalFindings !== 1 || metrics.completedRemediations !== 1 || metrics.acceptedAttestations !== 1) process.exit(1);
console.log('Sprint 150 enterprise audit compliance patch test passed.');
