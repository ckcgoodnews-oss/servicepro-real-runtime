const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const request = await repos.privacyRights.createRequest({
    tenantId,
    requestType: 'access',
    subjectName: 'Demo Subject',
    subjectEmail: 'subject@example.com',
    jurisdiction: 'US-IN'
  });

  const verifying = await repos.privacyRights.startVerification(request.id);
  const verification = await repos.privacyRights.createVerification({
    requestId: request.id,
    tenantId,
    method: 'email_challenge'
  });
  const verified = await repos.privacyRights.verifyIdentity(verification.id);

  const task = await repos.privacyRights.createSearchTask({
    requestId: request.id,
    tenantId,
    sourceSystem: 'servicepro',
    query: 'email:subject@example.com'
  });
  await repos.privacyRights.startSearchTask(task.id);
  const completedTask = await repos.privacyRights.completeSearchTask(task.id, 4, 's3://privacy/searches/dsar-000001.json');

  const pkg = await repos.privacyRights.createPackage({
    requestId: request.id,
    tenantId,
    notes: 'Redacted internal notes.'
  });
  const readyPackage = await repos.privacyRights.markPackageReady(pkg.id, 's3://privacy/packages/dsar-000001.zip', 'privacy');
  const approvedPackage = await repos.privacyRights.approvePackage(pkg.id);

  const approval = await repos.privacyRights.createApproval({
    requestId: request.id,
    tenantId,
    approverId: 'privacy-lead',
    approverName: 'Privacy Lead'
  });
  const approvedReview = await repos.privacyRights.approveReview(approval.id, 'Approved for fulfillment.');

  const fulfillment = await repos.privacyRights.createFulfillment({
    requestId: request.id,
    tenantId,
    recipientEmail: 'subject@example.com'
  });
  const sent = await repos.privacyRights.sendFulfillment(fulfillment.id);
  const metrics = await repos.privacyRights.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, request, verifying, verification: verified, task: completedTask, package: approvedPackage, readyPackage, approval: approvedReview, fulfillment: sent, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
