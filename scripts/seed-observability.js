const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const monitor = await repos.observability.createMonitor(tenantId, {
    name: 'API Health',
    serviceName: 'api',
    monitorType: 'http',
    target: 'https://app.example.com/health',
    checkIntervalSeconds: 60,
    timeoutSeconds: 10,
    ownerTeam: 'platform'
  });

  const slo = await repos.observability.createSlo(tenantId, {
    serviceName: 'api',
    name: 'API Availability',
    targetPercent: 99.9,
    window: '30d',
    measurementType: 'availability'
  });

  const alert = await repos.observability.createAlert(tenantId, {
    monitorId: monitor.id,
    title: 'API health check warning',
    severity: 'warning',
    observedValue: '550ms',
    thresholdValue: '500ms'
  });

  const incident = await repos.observability.createIncident(tenantId, {
    title: 'API latency elevated',
    severity: 'sev3',
    impactedServices: ['api'],
    commander: 'platform'
  });

  const evaluation = await repos.observability.evaluateSlo(tenantId, {
    sloId: slo.id,
    measurements: [{ totalEvents: 100000, badEvents: 50 }]
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, monitor, slo, alert, incident, evaluation }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
