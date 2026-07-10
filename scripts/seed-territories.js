const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  let territory = (await repos.territories.listTerritories(tenantId)).find(t => t.code === 'INDY-NORTH');
  if (!territory) {
    territory = await repos.territories.createTerritory(tenantId, {
      code: 'INDY-NORTH',
      name: 'Indianapolis North',
      priority: 10
    });
  }

  await repos.territories.createCoverageRule(tenantId, {
    territoryId: territory.id,
    ruleType: 'postal_prefix',
    postalPrefix: '462',
    state: 'IN',
    priority: 10
  });

  await repos.territories.createTechnicianTerritory(tenantId, {
    technicianId: 'tech_demo_1',
    territoryId: territory.id,
    preferenceRank: 1
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, territory }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
