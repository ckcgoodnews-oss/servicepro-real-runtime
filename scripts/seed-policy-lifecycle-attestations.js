const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const policy = await repos.policyLifecycle.createPolicy({
    tenantId,
    title: 'Acceptable Use Policy',
    policyType: 'security',
    owner: 'security',
    businessUnit: 'all',
    reviewFrequencyDays: 365
  });

  const version = await repos.policyLifecycle.createVersion({
    policyId: policy.id,
    tenantId,
    version: '1.0',
    summary: 'Initial acceptable use policy.',
    body: 'Users must protect company systems and data.',
    author: 'security'
  });

  const submitted = await repos.policyLifecycle.submitVersion(version.id);
  const approval = await repos.policyLifecycle.createApproval({
    policyVersionId: version.id,
    policyId: policy.id,
    tenantId,
    approverId: 'security-lead',
    approverName: 'Security Lead'
  });
  const approvedGate = await repos.policyLifecycle.approveGate(approval.id, 'Approved.');
  const approvedVersion = await repos.policyLifecycle.approveVersion(version.id);
  const publishedVersion = await repos.policyLifecycle.publishVersion(version.id);

  const attestation = await repos.policyLifecycle.createAttestation({
    policyId: policy.id,
    policyVersionId: version.id,
    tenantId,
    subjectId: 'user_demo',
    subjectName: 'Demo User',
    subjectEmail: 'user@example.com'
  });
  const acknowledged = await repos.policyLifecycle.acknowledgeAttestation(attestation.id);

  const exception = await repos.policyLifecycle.createException({
    policyId: policy.id,
    policyVersionId: version.id,
    tenantId,
    requesterId: 'manager_demo',
    requesterName: 'Demo Manager',
    reason: 'Temporary exception for legacy system access.',
    compensatingControls: 'Extra monitoring and manager review.'
  });
  const approvedException = await repos.policyLifecycle.approveException(exception.id, 'security-lead');

  const review = await repos.policyLifecycle.createReview({
    policyId: policy.id,
    tenantId,
    reviewerId: 'security-lead',
    reviewerName: 'Security Lead'
  });
  const completedReview = await repos.policyLifecycle.completeReview(review.id, 'Reviewed after publication.');

  const metrics = await repos.policyLifecycle.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({
    ok: true,
    policy,
    version: publishedVersion,
    submitted,
    approvedVersion,
    approval: approvedGate,
    attestation: acknowledged,
    exception: approvedException,
    review: completedReview,
    metrics
  }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
