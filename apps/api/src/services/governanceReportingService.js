const { validationError } = require('../errors/domainError');

const KPI_STATUSES = ['draft', 'active', 'retired'];
const KPI_DIRECTIONS = ['higher_is_better', 'lower_is_better', 'target_band'];
const DASHBOARD_STATUSES = ['draft', 'published', 'retired'];
const WIDGET_TYPES = ['number', 'trend', 'bar', 'line', 'table', 'heatmap', 'status'];
const REPORT_STATUSES = ['draft', 'active', 'retired'];
const SNAPSHOT_STATUSES = ['queued', 'generated', 'failed'];
const DELIVERY_STATUSES = ['scheduled', 'sent', 'failed', 'cancelled'];
const EXPORT_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const EXPORT_FORMATS = ['csv', 'json', 'xlsx', 'pdf'];

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}
function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}
function normalizeKpiInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  const direction = input.direction || 'lower_is_better';
  assertAllowed(status, KPI_STATUSES, 'KPI status');
  assertAllowed(direction, KPI_DIRECTIONS, 'KPI direction');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    domain: input.domain || 'governance',
    direction,
    targetValue: input.targetValue === undefined || input.targetValue === null ? null : Number(input.targetValue),
    warningValue: input.warningValue === undefined || input.warningValue === null ? null : Number(input.warningValue),
    criticalValue: input.criticalValue === undefined || input.criticalValue === null ? null : Number(input.criticalValue),
    unit: input.unit || 'count',
    queryKey: input.queryKey || '',
    owner: input.owner || '',
    metadata: input.metadata || {}
  };
}
function normalizeDashboardInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  assertAllowed(status, DASHBOARD_STATUSES, 'dashboard status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    audience: input.audience || 'executive',
    owner: input.owner || '',
    publishedAt: input.publishedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeWidgetInput(input = {}) {
  if (!input.dashboardId) throw validationError('dashboardId is required');
  if (!input.title) throw validationError('title is required');
  const widgetType = input.widgetType || 'number';
  assertAllowed(widgetType, WIDGET_TYPES, 'widget type');
  return {
    tenantId: input.tenantId || '',
    dashboardId: input.dashboardId,
    kpiId: input.kpiId || '',
    title: input.title,
    widgetType,
    position: input.position || { x: 0, y: 0, w: 4, h: 3 },
    config: input.config || {},
    metadata: input.metadata || {}
  };
}
function normalizeReportTemplateInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  assertAllowed(status, REPORT_STATUSES, 'report status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    audience: input.audience || 'executive',
    sections: Array.isArray(input.sections) ? input.sections : [],
    owner: input.owner || '',
    metadata: input.metadata || {}
  };
}
function normalizeSnapshotInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.templateId) throw validationError('templateId is required');
  const status = input.status || 'queued';
  assertAllowed(status, SNAPSHOT_STATUSES, 'snapshot status');
  return {
    tenantId: input.tenantId,
    templateId: input.templateId,
    status,
    periodStart: input.periodStart || '',
    periodEnd: input.periodEnd || '',
    generatedAt: input.generatedAt || '',
    generatedBy: input.generatedBy || '',
    data: input.data || {},
    summary: input.summary || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeDeliveryInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.templateId) throw validationError('templateId is required');
  const status = input.status || 'scheduled';
  assertAllowed(status, DELIVERY_STATUSES, 'delivery status');
  return {
    tenantId: input.tenantId,
    templateId: input.templateId,
    snapshotId: input.snapshotId || '',
    status,
    recipients: Array.isArray(input.recipients) ? input.recipients : [],
    channel: input.channel || 'email',
    scheduledAt: input.scheduledAt || addDays(new Date().toISOString(), 1),
    sentAt: input.sentAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeExportInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  const status = input.status || 'queued';
  const format = input.format || 'csv';
  assertAllowed(status, EXPORT_STATUSES, 'export status');
  assertAllowed(format, EXPORT_FORMATS, 'export format');
  return {
    tenantId: input.tenantId,
    dashboardId: input.dashboardId || '',
    templateId: input.templateId || '',
    snapshotId: input.snapshotId || '',
    status,
    format,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    fileUrl: input.fileUrl || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}
function publishDashboard(dashboard, at = new Date().toISOString()) {
  return { ...dashboard, status: 'published', publishedAt: at, updatedAt: at };
}
function activateKpi(kpi, at = new Date().toISOString()) {
  return { ...kpi, status: 'active', updatedAt: at };
}
function activateReportTemplate(template, at = new Date().toISOString()) {
  return { ...template, status: 'active', updatedAt: at };
}
function evaluateKpi(kpi, value) {
  const n = Number(value || 0);
  if (kpi.direction === 'higher_is_better') {
    if (kpi.criticalValue !== null && n <= kpi.criticalValue) return 'critical';
    if (kpi.warningValue !== null && n <= kpi.warningValue) return 'warning';
    return 'healthy';
  }
  if (kpi.direction === 'lower_is_better') {
    if (kpi.criticalValue !== null && n >= kpi.criticalValue) return 'critical';
    if (kpi.warningValue !== null && n >= kpi.warningValue) return 'warning';
    return 'healthy';
  }
  if (kpi.targetValue === null) return 'unknown';
  const variance = Math.abs(n - Number(kpi.targetValue));
  if (kpi.criticalValue !== null && variance >= Number(kpi.criticalValue)) return 'critical';
  if (kpi.warningValue !== null && variance >= Number(kpi.warningValue)) return 'warning';
  return 'healthy';
}
function generateSnapshot(snapshot, data = {}, summary = '', generatedBy = '', at = new Date().toISOString()) {
  return { ...snapshot, status: 'generated', data, summary, generatedBy: generatedBy || snapshot.generatedBy, generatedAt: at, updatedAt: at };
}
function failSnapshot(snapshot, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...snapshot, status: 'failed', failureReason: reason, updatedAt: at };
}
function sendDelivery(delivery, at = new Date().toISOString()) {
  return { ...delivery, status: 'sent', sentAt: at, updatedAt: at };
}
function failDelivery(delivery, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...delivery, status: 'failed', failureReason: reason, updatedAt: at };
}
function startExport(exportJob, at = new Date().toISOString()) {
  return { ...exportJob, status: 'running', startedAt: at, updatedAt: at };
}
function completeExport(exportJob, fileUrl, at = new Date().toISOString()) {
  if (!fileUrl) throw validationError('fileUrl is required');
  return { ...exportJob, status: 'completed', fileUrl, completedAt: at, updatedAt: at };
}
function failExport(exportJob, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...exportJob, status: 'failed', failureReason: reason, completedAt: at, updatedAt: at };
}
function reportingMetrics({ kpis = [], dashboards = [], widgets = [], templates = [], snapshots = [], deliveries = [], exports = [] }) {
  return {
    activeKpis: kpis.filter(x => x.status === 'active').length,
    publishedDashboards: dashboards.filter(x => x.status === 'published').length,
    widgetCount: widgets.length,
    activeTemplates: templates.filter(x => x.status === 'active').length,
    generatedSnapshots: snapshots.filter(x => x.status === 'generated').length,
    failedSnapshots: snapshots.filter(x => x.status === 'failed').length,
    sentDeliveries: deliveries.filter(x => x.status === 'sent').length,
    completedExports: exports.filter(x => x.status === 'completed').length
  };
}
module.exports = {
  KPI_STATUSES, KPI_DIRECTIONS, DASHBOARD_STATUSES, WIDGET_TYPES, REPORT_STATUSES,
  SNAPSHOT_STATUSES, DELIVERY_STATUSES, EXPORT_STATUSES, EXPORT_FORMATS, assertAllowed,
  slugCode, addDays, normalizeKpiInput, normalizeDashboardInput, normalizeWidgetInput,
  normalizeReportTemplateInput, normalizeSnapshotInput, normalizeDeliveryInput,
  normalizeExportInput, publishDashboard, activateKpi, activateReportTemplate, evaluateKpi,
  generateSnapshot, failSnapshot, sendDelivery, failDelivery, startExport, completeExport,
  failExport, reportingMetrics
};
