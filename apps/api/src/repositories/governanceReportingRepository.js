const { makeId, now } = require('../services/id');
const svc = require('../services/governanceReportingService');

function createGovernanceReportingRepository(store) {
  if (store.type === 'json') return createJsonGovernanceReportingRepository(store);
  if (store.type === 'postgres') return createPostgresGovernanceReportingRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureReporting(data) {
  data.reportingKpis ||= []; data.reportingDashboards ||= []; data.reportingWidgets ||= [];
  data.reportingTemplates ||= []; data.reportingSnapshots ||= []; data.reportingDeliveries ||= [];
  data.reportingExports ||= [];
  return data;
}
function updateById(rows, id, fn) {
  const idx = rows.findIndex(x => x.id === id);
  if (idx === -1) return null;
  rows[idx] = fn(rows[idx]);
  return rows[idx];
}
function createJsonGovernanceReportingRepository(store) {
  return {
    createKpi(input) { const data = ensureReporting(store.read()); const row = { id: makeId('kpi'), ...svc.normalizeKpiInput(input), createdAt: now(), updatedAt: now() }; data.reportingKpis.push(row); store.write(data); return row; },
    listKpis(filters = {}) { return ensureReporting(store.read()).reportingKpis.filter(x => !filters.tenantId || x.tenantId === filters.tenantId).filter(x => !filters.status || x.status === filters.status).filter(x => !filters.domain || x.domain === filters.domain); },
    activateKpi(id) { const data = ensureReporting(store.read()); const row = updateById(data.reportingKpis, id, svc.activateKpi); store.write(data); return row; },
    createDashboard(input) { const data = ensureReporting(store.read()); const row = { id: makeId('dash'), ...svc.normalizeDashboardInput(input), createdAt: now(), updatedAt: now() }; data.reportingDashboards.push(row); store.write(data); return row; },
    publishDashboard(id) { const data = ensureReporting(store.read()); const row = updateById(data.reportingDashboards, id, svc.publishDashboard); store.write(data); return row; },
    createWidget(input) { const data = ensureReporting(store.read()); const row = { id: makeId('widget'), ...svc.normalizeWidgetInput(input), createdAt: now(), updatedAt: now() }; data.reportingWidgets.push(row); store.write(data); return row; },
    listWidgets(dashboardId) { return ensureReporting(store.read()).reportingWidgets.filter(x => x.dashboardId === dashboardId); },
    createReportTemplate(input) { const data = ensureReporting(store.read()); const row = { id: makeId('reporttpl'), ...svc.normalizeReportTemplateInput(input), createdAt: now(), updatedAt: now() }; data.reportingTemplates.push(row); store.write(data); return row; },
    activateReportTemplate(id) { const data = ensureReporting(store.read()); const row = updateById(data.reportingTemplates, id, svc.activateReportTemplate); store.write(data); return row; },
    createSnapshot(input) { const data = ensureReporting(store.read()); const row = { id: makeId('snapshot'), ...svc.normalizeSnapshotInput(input), createdAt: now(), updatedAt: now() }; data.reportingSnapshots.push(row); store.write(data); return row; },
    generateSnapshot(id, dataPayload = {}, summary = '', generatedBy = '') { const data = ensureReporting(store.read()); const row = updateById(data.reportingSnapshots, id, x => svc.generateSnapshot(x, dataPayload, summary, generatedBy)); store.write(data); return row; },
    failSnapshot(id, reason) { const data = ensureReporting(store.read()); const row = updateById(data.reportingSnapshots, id, x => svc.failSnapshot(x, reason)); store.write(data); return row; },
    createDelivery(input) { const data = ensureReporting(store.read()); const row = { id: makeId('delivery'), ...svc.normalizeDeliveryInput(input), createdAt: now(), updatedAt: now() }; data.reportingDeliveries.push(row); store.write(data); return row; },
    sendDelivery(id) { const data = ensureReporting(store.read()); const row = updateById(data.reportingDeliveries, id, svc.sendDelivery); store.write(data); return row; },
    failDelivery(id, reason) { const data = ensureReporting(store.read()); const row = updateById(data.reportingDeliveries, id, x => svc.failDelivery(x, reason)); store.write(data); return row; },
    createExport(input) { const data = ensureReporting(store.read()); const row = { id: makeId('export'), ...svc.normalizeExportInput(input), createdAt: now(), updatedAt: now() }; data.reportingExports.push(row); store.write(data); return row; },
    startExport(id) { const data = ensureReporting(store.read()); const row = updateById(data.reportingExports, id, svc.startExport); store.write(data); return row; },
    completeExport(id, fileUrl) { const data = ensureReporting(store.read()); const row = updateById(data.reportingExports, id, x => svc.completeExport(x, fileUrl)); store.write(data); return row; },
    metrics(tenantId) { const data = ensureReporting(store.read()); return svc.reportingMetrics({ kpis: data.reportingKpis.filter(x => !tenantId || x.tenantId === tenantId), dashboards: data.reportingDashboards.filter(x => !tenantId || x.tenantId === tenantId), widgets: data.reportingWidgets.filter(x => !tenantId || x.tenantId === tenantId), templates: data.reportingTemplates.filter(x => !tenantId || x.tenantId === tenantId), snapshots: data.reportingSnapshots.filter(x => !tenantId || x.tenantId === tenantId), deliveries: data.reportingDeliveries.filter(x => !tenantId || x.tenantId === tenantId), exports: data.reportingExports.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresGovernanceReportingRepository() {
  return {
    async createKpi(input) { return { id: 'postgres-kpi-placeholder', ...svc.normalizeKpiInput(input) }; }, async listKpis() { return []; }, async activateKpi() { return null; },
    async createDashboard(input) { return { id: 'postgres-dashboard-placeholder', ...svc.normalizeDashboardInput(input) }; }, async publishDashboard() { return null; },
    async createWidget(input) { return { id: 'postgres-widget-placeholder', ...svc.normalizeWidgetInput(input) }; }, async listWidgets() { return []; },
    async createReportTemplate(input) { return { id: 'postgres-template-placeholder', ...svc.normalizeReportTemplateInput(input) }; }, async activateReportTemplate() { return null; },
    async createSnapshot(input) { return { id: 'postgres-snapshot-placeholder', ...svc.normalizeSnapshotInput(input) }; }, async generateSnapshot() { return null; }, async failSnapshot() { return null; },
    async createDelivery(input) { return { id: 'postgres-delivery-placeholder', ...svc.normalizeDeliveryInput(input) }; }, async sendDelivery() { return null; }, async failDelivery() { return null; },
    async createExport(input) { return { id: 'postgres-export-placeholder', ...svc.normalizeExportInput(input) }; }, async startExport() { return null; }, async completeExport() { return null; },
    async metrics() { return svc.reportingMetrics({}); }
  };
}
module.exports = { createGovernanceReportingRepository };
