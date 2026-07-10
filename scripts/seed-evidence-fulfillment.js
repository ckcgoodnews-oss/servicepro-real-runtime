const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const bundle = await repos.evidenceFulfillment.createBundle({
    tenantId,
    name: 'Standard Customer Due Diligence Bundle',
    owner: 'security',
    customerName: 'Customer Co'
  });

  const item = await repos.evidenceFulfillment.createBundleItem({
    bundleId: bundle.id,
    tenantId,
    title: 'SOC 2 Report',
    itemType: 'report',
    fileUrl: 's3://evidence/soc2.pdf',
    version: '2026'
  });

  await repos.evidenceFulfillment.markBundleReady(bundle.id);
  const approvedBundle = await repos.evidenceFulfillment.approveBundle(bundle.id);

  const request = await repos.evidenceFulfillment.createRequest({
    tenantId,
    bundleId: bundle.id,
    customerName: 'Customer Co',
    requesterEmail: 'security@customer.example',
    businessReason: 'Vendor due diligence'
  });

  const approval = await repos.evidenceFulfillment.createApproval({
    requestId: request.id,
    tenantId,
    approverId: 'security-lead',
    approverName: 'Security Lead'
  });
  const approved = await repos.evidenceFulfillment.approveDelivery(approval.id, 'Approved.');

  const link = await repos.evidenceFulfillment.createDeliveryLink({
    requestId: request.id,
    bundleId: bundle.id,
    tenantId,
    createdBy: 'security-lead'
  });
  const opened = await repos.evidenceFulfillment.openDeliveryLink(link.id);
  const delivered = await repos.evidenceFulfillment.deliverRequest(request.id);
  const events = await repos.evidenceFulfillment.accessEvents({ tenantId });
  const metrics = await repos.evidenceFulfillment.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, bundle: approvedBundle, item, request: delivered, approval: approved, link: opened, events, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
