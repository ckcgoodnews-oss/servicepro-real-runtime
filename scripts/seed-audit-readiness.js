const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();

  const engagement = await repos.auditReadiness.createEngagement({
    name: 'SOC 2 Type II 2026',
    auditFirm: 'Demo Audit LLP',
    auditorLead: 'Lead Auditor',
    internalOwner: 'compliance',
    frameworkId: 'soc2'
  });

  const active = await repos.auditReadiness.transitionEngagement(engagement.id, 'active');

  const request = await repos.auditReadiness.createRequest({
    engagementId: engagement.id,
    title: 'Provide access review evidence',
    controlId: 'CC6.1',
    owner: 'iam-owner',
    requestedBy: 'Lead Auditor',
    dueAt: '2026-08-15T00:00:00.000Z'
  });

  const pkg = await repos.auditReadiness.createEvidencePackage({
    requestId: request.id,
    title: 'Access review package',
    artifacts: [{ title: 'Q2 access review', uri: 's3://audit/access-review.pdf' }]
  });

  const readyPackage = await repos.auditReadiness.markPackageReady(pkg.id, 'compliance');
  const submittedPackage = await repos.auditReadiness.submitPackage(pkg.id);
  const submittedRequest = await repos.auditReadiness.submitRequest(request.id);

  const walkthrough = await repos.auditReadiness.createWalkthrough({
    engagementId: engagement.id,
    controlId: 'CC6.1',
    title: 'Access control walkthrough',
    attendees: ['auditor', 'iam-owner']
  });
  const completedWalkthrough = await repos.auditReadiness.completeWalkthrough(walkthrough.id, 'Walkthrough completed.');

  const sample = await repos.auditReadiness.createSampleRequest({
    engagementId: engagement.id,
    controlId: 'CC6.1',
    populationName: 'User access changes',
    sampleSize: 5
  });
  const collectedSample = await repos.auditReadiness.collectSample(sample.id, [{ id: 'sample-1' }, { id: 'sample-2' }]);

  const issue = await repos.auditReadiness.createIssue({
    engagementId: engagement.id,
    controlId: 'CC6.1',
    title: 'One sample missing approval',
    severity: 'medium',
    owner: 'iam-owner'
  });
  const response = await repos.auditReadiness.addManagementResponse(issue.id, 'Approval workflow has been corrected.');
  const metrics = await repos.auditReadiness.metrics(engagement.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, engagement: active, request: submittedRequest, package: submittedPackage, readyPackage, walkthrough: completedWalkthrough, sample: collectedSample, issue: response, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
