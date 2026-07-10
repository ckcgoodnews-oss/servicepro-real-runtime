const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  let categories = await repos.priceBook.listCategories(tenantId);
  let drain = categories.find(c => c.code === 'DRAIN');
  if (!drain) {
    drain = await repos.priceBook.createCategory(tenantId, {
      code: 'DRAIN',
      name: 'Drain Services',
      description: 'Flat-rate drain cleaning and repair services',
      sortOrder: 10
    });
  }

  const items = await repos.priceBook.listItems(tenantId);
  if (!items.find(i => i.code === 'DRAIN-CLEAN-BASIC')) {
    await repos.priceBook.createItem(tenantId, {
      categoryId: drain.id,
      categoryCode: 'DRAIN',
      code: 'DRAIN-CLEAN-BASIC',
      name: 'Basic drain cleaning',
      description: 'Standard accessible drain cleaning',
      basePrice: 225,
      laborHours: 1.25,
      materialCost: 15,
      unitCost: 85,
      taxable: true,
      tags: ['drain', 'flat-rate']
    });
  }

  const publish = await repos.priceBook.publish(tenantId, 'Seed publish');
  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, publish }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
