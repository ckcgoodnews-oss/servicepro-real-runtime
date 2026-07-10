const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  let vendor = (await repos.vendors.list(tenantId)).find(v => v.name === 'Demo Supply House');
  if (!vendor) {
    vendor = await repos.vendors.create(tenantId, {
      name: 'Demo Supply House',
      contactName: 'Parts Desk',
      email: 'parts@example.com',
      phone: '555-0300',
      paymentTerms: 'Net 30'
    });
  }

  const po = await repos.purchaseOrders.create(tenantId, {
    vendorId: vendor.id,
    status: 'ordered',
    vendorReference: 'DEMO-REF',
    lines: [
      { sku: 'PVC-TRAP-15', description: '1.5 inch PVC P-Trap', quantity: 10, unitCost: 4.25 }
    ]
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, vendor, purchaseOrder: po }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
