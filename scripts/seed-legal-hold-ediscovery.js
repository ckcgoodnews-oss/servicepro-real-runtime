const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const matter = await repos.legalHold.createMatter({
    tenantId,
    name: 'Customer Contract Dispute',
    matterType: 'commercial',
    owner: 'legal'
  });

  const hold = await repos.legalHold.createHold({
    matterId: matter.id,
    tenantId,
    title: 'Preserve Customer Contract Records',
    instructions: 'Preserve all contract, email, and ticket records related to Customer Co.'
  });
  const issuedHold = await repos.legalHold.issueHold(hold.id, 'legal');

  const custodian = await repos.legalHold.createCustodian({
    holdId: hold.id,
    tenantId,
    name: 'Account Owner',
    email: 'owner@example.com'
  });
  const acknowledged = await repos.legalHold.acknowledgeCustodian(custodian.id);

  const scope = await repos.legalHold.createScope({
    holdId: hold.id,
    tenantId,
    scopeType: 'document',
    sourceSystem: 'contracts',
    query: 'customer_name:"Customer Co"'
  });
  const preservedScope = await repos.legalHold.markScopePreserved(scope.id);

  const collection = await repos.legalHold.createCollection({
    holdId: hold.id,
    tenantId,
    requestedBy: 'legal'
  });
  await repos.legalHold.startCollection(collection.id);
  const completedCollection = await repos.legalHold.completeCollection(collection.id, 42, 's3://legal/collections/customer-co');

  const exportJob = await repos.legalHold.createExport({
    matterId: matter.id,
    holdId: hold.id,
    tenantId,
    requestedBy: 'legal',
    format: 'zip'
  });
  await repos.legalHold.startExport(exportJob.id);
  const completedExport = await repos.legalHold.completeExport(exportJob.id, 's3://legal/exports/customer-co.zip', 42);

  const metrics = await repos.legalHold.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, matter, hold: issuedHold, custodian: acknowledged, scope: preservedScope, collection: completedCollection, exportJob: completedExport, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
