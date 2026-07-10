const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const dashboard = await repos.biDashboards.createDashboard(tenantId, {
    code: 'EXECUTIVE-OVERVIEW',
    name: 'Executive Overview',
    category: 'executive',
    roleVisibility: ['owner', 'manager'],
    layout: { columns: 12 }
  });

  await repos.biDashboards.createWidget(tenantId, {
    dashboardId: dashboard.id,
    title: 'Monthly Revenue',
    widgetType: 'kpi',
    metricKey: 'monthly_revenue',
    sortOrder: 10,
    width: 3
  });

  await repos.biDashboards.createWidget(tenantId, {
    dashboardId: dashboard.id,
    title: 'First-Time Fix Rate',
    widgetType: 'kpi',
    metricKey: 'first_time_fix_rate',
    sortOrder: 20,
    width: 3
  });

  await repos.biDashboards.captureMetric(tenantId, {
    metricKey: 'monthly_revenue',
    label: 'Monthly Revenue',
    value: 125000,
    previousValue: 100000,
    targetValue: 150000,
    valueType: 'currency',
    source: 'seed'
  });

  await repos.biDashboards.captureMetric(tenantId, {
    metricKey: 'first_time_fix_rate',
    label: 'First-Time Fix Rate',
    value: 87.5,
    previousValue: 84,
    targetValue: 90,
    valueType: 'percent',
    source: 'seed'
  });

  const rendered = await repos.biDashboards.render(tenantId, dashboard.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, dashboard, rendered }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
