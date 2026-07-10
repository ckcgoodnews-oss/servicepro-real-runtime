const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();

  const services = [
    { code: 'DRAIN-CLEAN', name: 'Drain cleaning', description: 'Standard drain cleaning service', category: 'drain', basePrice: 225, unitCost: 85, taxable: true },
    { code: 'WH-DIAG', name: 'Water heater diagnostic', description: 'Diagnostic inspection for water heater issues', category: 'water_heater', basePrice: 149, unitCost: 45, taxable: true },
    { code: 'LEAK-SEARCH', name: 'Leak detection visit', description: 'Standard leak investigation and diagnosis', category: 'leak', basePrice: 189, unitCost: 65, taxable: true }
  ];

  for (const service of services) {
    const existing = await repos.services.findByCode('tenant_demo', service.code);
    if (!existing) {
      await repos.services.create('tenant_demo', service);
      console.log(`Created service ${service.code}`);
    } else {
      console.log(`Service already exists ${service.code}`);
    }
  }

  if (repos.store.close) await repos.store.close();
  console.log('Service catalog seed complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
