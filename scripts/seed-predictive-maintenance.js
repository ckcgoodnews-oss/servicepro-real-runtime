const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const model = await repos.predictiveMaintenance.createModel(tenantId, {
    name: 'Default HVAC Risk Model',
    equipmentType: 'hvac',
    status: 'active',
    riskThresholds: { moderate: 30, high: 55, critical: 75 }
  });

  const prediction = await repos.predictiveMaintenance.generatePrediction(tenantId, {
    modelId: model.id,
    assetId: 'asset_demo_1',
    customerId: 'cust_demo_1',
    equipmentType: 'hvac',
    installDate: '2016-07-06',
    lastServiceDate: '2025-01-01',
    asOfDate: '2026-07-06',
    expectedLifeYears: 12,
    usageHours: 21000,
    expectedAnnualUsageHours: 1800,
    faultCount90Days: 3,
    faultCount365Days: 8,
    conditionScore: 58,
    criticality: 5
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, model, prediction }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
