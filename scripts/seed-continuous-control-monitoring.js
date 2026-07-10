const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();

  const monitor = await repos.controlMonitoring.createMonitor({
    controlId: 'CC6.1',
    name: 'Privileged Users Without MFA',
    monitorType: 'threshold',
    sourceSystem: 'iam',
    signalName: 'privileged_users_without_mfa',
    threshold: 0,
    operator: 'gt',
    severity: 'high',
    owner: 'security'
  });

  const signal = await repos.controlMonitoring.ingestSignal({
    monitorId: monitor.id,
    signalName: 'privileged_users_without_mfa',
    numericValue: 2,
    sourceSystem: 'iam'
  });

  const evaluation = await repos.controlMonitoring.evaluateMonitor(monitor.id);
  const alerts = await repos.controlMonitoring.listAlerts({ monitorId: monitor.id });
  const acknowledged = alerts[0] ? await repos.controlMonitoring.acknowledgeAlert(alerts[0].id, 'security') : null;

  const suppression = await repos.controlMonitoring.createSuppression({
    monitorId: monitor.id,
    reason: 'Maintenance window',
    createdBy: 'security',
    endsAt: '2026-08-01T00:00:00.000Z'
  });

  const metrics = await repos.controlMonitoring.metrics();

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, monitor, signal, evaluation, alert: acknowledged, suppression, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
