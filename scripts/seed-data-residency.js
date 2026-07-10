const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const policy = await repos.dataResidency.createPolicy({
    tenantId,
    name: 'US Customer Data Residency',
    allowedRegions: ['us-east-2', 'us-west-2'],
    restrictedRegions: ['eu-central-1'],
    dataCategories: ['customer_profile', 'service_records'],
    owner: 'privacy'
  });

  const assignment = await repos.dataResidency.createAssignment({
    tenantId,
    customerId: 'customer_demo',
    customerName: 'Customer Co',
    policyId: policy.id,
    regionCode: 'us-east-2',
    regionName: 'US East Ohio',
    assignedBy: 'privacy'
  });

  const transfer = await repos.dataResidency.createTransferReview({
    tenantId,
    customerId: 'customer_demo',
    sourceRegion: 'us-east-2',
    targetRegion: 'us-west-2',
    dataCategories: ['service_records'],
    businessReason: 'Disaster recovery replication',
    requestedBy: 'platform'
  });

  const evaluation = await repos.dataResidency.evaluateTransfer(transfer.id);
  const approval = await repos.dataResidency.createApproval({
    transferReviewId: transfer.id,
    tenantId,
    approverId: 'privacy-lead',
    approverName: 'Privacy Lead'
  });
  const approvedApproval = await repos.dataResidency.approveReviewApproval(approval.id, 'Approved for US-only DR replication.');
  const approvedTransfer = await repos.dataResidency.approveTransfer(transfer.id, 'privacy-lead');
  const completedTransfer = await repos.dataResidency.completeTransfer(transfer.id);

  const requirement = await repos.dataResidency.createRequirement({
    tenantId,
    regionCode: 'us-east-2',
    title: 'Maintain customer records in approved US regions',
    owner: 'platform'
  });
  const satisfiedRequirement = await repos.dataResidency.satisfyRequirement(requirement.id);

  const violation = await repos.dataResidency.createViolation({
    tenantId,
    customerId: 'customer_demo',
    policyId: policy.id,
    title: 'Unexpected object copy detected',
    detectedRegion: 'eu-central-1',
    expectedRegions: ['us-east-2', 'us-west-2'],
    owner: 'privacy'
  });
  const remediatedViolation = await repos.dataResidency.remediateViolation(violation.id);
  const metrics = await repos.dataResidency.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, policy, assignment, transfer: completedTransfer, evaluation, approval: approvedApproval, approvedTransfer, requirement: satisfiedRequirement, violation: remediatedViolation, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
