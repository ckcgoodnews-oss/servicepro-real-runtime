const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const kpi = await repos.governanceReporting.createKpi({ tenantId, name: 'Critical Open Security Items', domain: 'security', direction: 'lower_is_better', warningValue: 5, criticalValue: 10, owner: 'security' });
  const activeKpi = await repos.governanceReporting.activateKpi(kpi.id);
  const dashboard = await repos.governanceReporting.createDashboard({ tenantId, name: 'Executive Security Dashboard', audience: 'executive', owner: 'security' });
  const publishedDashboard = await repos.governanceReporting.publishDashboard(dashboard.id);
  const widget = await repos.governanceReporting.createWidget({ tenantId, dashboardId: dashboard.id, kpiId: kpi.id, title: 'Critical Open Security Items', widgetType: 'number' });
  const template = await repos.governanceReporting.createReportTemplate({ tenantId, name: 'Monthly Executive Security Report', audience: 'executive', owner: 'security', sections: ['summary', 'risk', 'incidents', 'vulnerabilities'] });
  const activeTemplate = await repos.governanceReporting.activateReportTemplate(template.id);
  const snapshot = await repos.governanceReporting.createSnapshot({ tenantId, templateId: template.id, periodStart: '2026-07-01', periodEnd: '2026-07-31' });
  const generated = await repos.governanceReporting.generateSnapshot(snapshot.id, { criticalOpenSecurityItems: 4 }, 'Security posture remains within target.', 'security');
  const delivery = await repos.governanceReporting.createDelivery({ tenantId, templateId: template.id, snapshotId: snapshot.id, recipients: ['executive@example.com'] });
  const sent = await repos.governanceReporting.sendDelivery(delivery.id);
  const exportJob = await repos.governanceReporting.createExport({ tenantId, dashboardId: dashboard.id, format: 'csv', requestedBy: 'security' });
  const runningExport = await repos.governanceReporting.startExport(exportJob.id);
  const completedExport = await repos.governanceReporting.completeExport(exportJob.id, 's3://reports/executive-dashboard.csv');
  const metrics = await repos.governanceReporting.metrics(tenantId);
  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, kpi: activeKpi, dashboard: publishedDashboard, widget, template: activeTemplate, snapshot: generated, delivery: sent, export: completedExport, runningExport, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
