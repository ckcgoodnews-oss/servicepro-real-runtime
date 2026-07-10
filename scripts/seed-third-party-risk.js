const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const vendor = await repos.thirdPartyRisk.createVendor({
    tenantId,
    name: 'Demo Cloud Vendor',
    criticality: 'critical',
    owner: 'security',
    contactEmail: 'security@vendor.example',
    servicesProvided: ['cloud hosting'],
    dataAccess: ['customer metadata']
  });

  const assessment = await repos.thirdPartyRisk.createAssessment({
    vendorId: vendor.id,
    tenantId,
    assessmentType: 'annual_security',
    requestedBy: 'security'
  });

  const response = await repos.thirdPartyRisk.createResponse({
    assessmentId: assessment.id,
    questionKey: 'mfa',
    questionText: 'Is MFA enforced?',
    answer: 'Partially',
    answeredBy: 'vendor',
    riskPoints: 20
  });

  const finding = await repos.thirdPartyRisk.createFinding({
    vendorId: vendor.id,
    assessmentId: assessment.id,
    tenantId,
    title: 'MFA not enforced for all admin users',
    severity: 'high',
    dueAt: '2026-08-31T00:00:00.000Z'
  });

  const completedAssessment = await repos.thirdPartyRisk.completeAssessment(assessment.id);

  const task = await repos.thirdPartyRisk.createRemediationTask({
    findingId: finding.id,
    tenantId,
    title: 'Require MFA for all vendor administrators',
    owner: 'vendor-security'
  });
  const completedTask = await repos.thirdPartyRisk.completeRemediationTask(task.id);

  const exceptionRecord = await repos.thirdPartyRisk.createException({
    findingId: finding.id,
    tenantId,
    reason: 'Temporary exception until vendor migration completes',
    requestedBy: 'security',
    expiresAt: '2026-09-30T00:00:00.000Z'
  });
  const approvedException = await repos.thirdPartyRisk.approveException(exceptionRecord.id, 'security-lead');
  const risk = await repos.thirdPartyRisk.vendorRisk(vendor.id);
  const metrics = await repos.thirdPartyRisk.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, vendor, assessment: completedAssessment, response, finding, task: completedTask, exception: approvedException, risk, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
