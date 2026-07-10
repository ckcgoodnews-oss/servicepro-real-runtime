const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const program = await repos.enterpriseAuditCompliance.createProgram({ tenantId, name: 'SOC 2 Type II 2026', framework: 'SOC2', owner: 'compliance', auditor: 'External Auditor LLP', periodStart: '2026-01-01', periodEnd: '2026-12-31' });
  const activeProgram = await repos.enterpriseAuditCompliance.activateProgram(program.id);

  const control = await repos.enterpriseAuditCompliance.createControl({ tenantId, programId: program.id, controlCode: 'CC6.1', title: 'Logical access controls', domain: 'access', owner: 'security', frequency: 'quarterly' });
  const activeControl = await repos.enterpriseAuditCompliance.activateControl(control.id);

  const request = await repos.enterpriseAuditCompliance.createEvidenceRequest({ tenantId, programId: program.id, controlId: control.id, title: 'Access review evidence', requestedBy: 'auditor', owner: 'security' });
  const submittedRequest = await repos.enterpriseAuditCompliance.submitEvidenceRequest(request.id);

  const artifact = await repos.enterpriseAuditCompliance.createArtifact({ tenantId, requestId: request.id, controlId: control.id, title: 'Q3 access review export', fileUrl: 's3://audit/evidence/q3-access-review.csv', uploadedBy: 'security' });
  const acceptedArtifact = await repos.enterpriseAuditCompliance.acceptArtifact(artifact.id, 'auditor');
  const acceptedRequest = await repos.enterpriseAuditCompliance.acceptEvidenceRequest(request.id);

  const test = await repos.enterpriseAuditCompliance.createControlTest({ tenantId, programId: program.id, controlId: control.id, testProcedure: 'Inspect quarterly access review evidence.', sampleSize: 25 });
  const startedTest = await repos.enterpriseAuditCompliance.startControlTest(test.id, 'auditor');
  const passedTest = await repos.enterpriseAuditCompliance.completeControlTest(test.id, 0, 'No exceptions found.');

  const finding = await repos.enterpriseAuditCompliance.createFinding({ tenantId, programId: program.id, controlId: control.id, testId: test.id, title: 'Demo low-risk observation', severity: 'low', owner: 'security' });
  const remediation = await repos.enterpriseAuditCompliance.createRemediation({ tenantId, findingId: finding.id, summary: 'Document access review retention procedure.', owner: 'security' });
  const startedRemediation = await repos.enterpriseAuditCompliance.startRemediation(remediation.id);
  const completedRemediation = await repos.enterpriseAuditCompliance.completeRemediation(remediation.id);
  const remediatedFinding = await repos.enterpriseAuditCompliance.remediateFinding(finding.id);
  const closedFinding = await repos.enterpriseAuditCompliance.closeFinding(finding.id);

  const attestation = await repos.enterpriseAuditCompliance.createAttestation({ tenantId, programId: program.id, attestor: 'CEO', statement: 'Management accepts responsibility for the control environment.' });
  const submittedAttestation = await repos.enterpriseAuditCompliance.submitAttestation(attestation.id);
  const acceptedAttestation = await repos.enterpriseAuditCompliance.acceptAttestation(attestation.id);

  const auditReady = await repos.enterpriseAuditCompliance.auditReady(tenantId);
  const metrics = await repos.enterpriseAuditCompliance.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, program: activeProgram, control: activeControl, request: acceptedRequest, submittedRequest, artifact: acceptedArtifact, test: passedTest, startedTest, finding: closedFinding, remediatedFinding, remediation: completedRemediation, startedRemediation, attestation: acceptedAttestation, submittedAttestation, auditReady, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
