const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  let warehouse = (await repos.warehouses.list(tenantId)).find(w => w.code === 'MAIN');
  if (!warehouse) {
    warehouse = await repos.warehouses.create(tenantId, {
      code: 'MAIN',
      name: 'Main Warehouse',
      warehouseType: 'main',
      notes: 'Default warehouse'
    });
  }

  const bins = await repos.warehouses.listBins(tenantId, warehouse.id);
  if (!bins.find(b => b.code === 'A-01')) {
    await repos.warehouses.createBin(tenantId, {
      warehouseId: warehouse.id,
      code: 'A-01',
      name: 'Aisle A Bin 01',
      sortOrder: 10
    });
  }

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, warehouse }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
