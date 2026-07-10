const { validationError } = require('../errors/domainError');

const DASHBOARD_CATEGORIES = ['executive', 'operations', 'finance', 'technician', 'customer', 'custom'];
const WIDGET_TYPES = ['kpi', 'line_chart', 'bar_chart', 'pie_chart', 'table', 'scorecard'];
const METRIC_VALUE_TYPES = ['number', 'currency', 'percent', 'duration', 'count'];

function normalizeDashboardInput(input = {}) {
  if (!input.name) throw validationError('name is required');

  const category = input.category || 'custom';
  if (!DASHBOARD_CATEGORIES.includes(category)) throw validationError(`Unsupported dashboard category: ${category}`);

  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    category,
    active: input.active !== false,
    roleVisibility: Array.isArray(input.roleVisibility) ? input.roleVisibility : [],
    layout: input.layout || { columns: 12 },
    filters: input.filters || {},
    metadata: input.metadata || {}
  };
}

function normalizeDashboardWidgetInput(input = {}) {
  if (!input.dashboardId) throw validationError('dashboardId is required');
  if (!input.title) throw validationError('title is required');
  if (!input.metricKey) throw validationError('metricKey is required');

  const widgetType = input.widgetType || 'kpi';
  if (!WIDGET_TYPES.includes(widgetType)) throw validationError(`Unsupported widget type: ${widgetType}`);

  return {
    dashboardId: input.dashboardId,
    title: input.title,
    widgetType,
    metricKey: input.metricKey,
    sortOrder: Number(input.sortOrder || 0),
    width: Number(input.width || 4),
    height: Number(input.height || 2),
    config: input.config || {},
    metadata: input.metadata || {}
  };
}

function normalizeMetricSnapshotInput(input = {}) {
  if (!input.metricKey) throw validationError('metricKey is required');
  const valueType = input.valueType || 'number';
  if (!METRIC_VALUE_TYPES.includes(valueType)) throw validationError(`Unsupported metric value type: ${valueType}`);

  return {
    metricKey: input.metricKey,
    label: input.label || input.metricKey,
    value: Number(input.value || 0),
    valueType,
    previousValue: input.previousValue === undefined || input.previousValue === '' ? null : Number(input.previousValue),
    targetValue: input.targetValue === undefined || input.targetValue === '' ? null : Number(input.targetValue),
    periodStart: input.periodStart || '',
    periodEnd: input.periodEnd || '',
    dimensions: input.dimensions || {},
    source: input.source || 'manual',
    capturedAt: input.capturedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function calculatePercentChange(value, previousValue) {
  if (previousValue === null || previousValue === undefined || Number(previousValue) === 0) return null;
  return Math.round(((Number(value || 0) - Number(previousValue)) / Math.abs(Number(previousValue))) * 10000) / 100;
}

function calculateTargetProgress(value, targetValue) {
  if (targetValue === null || targetValue === undefined || Number(targetValue) === 0) return null;
  return Math.round((Number(value || 0) / Number(targetValue)) * 10000) / 100;
}

function enrichMetricSnapshot(snapshot = {}) {
  const normalized = normalizeMetricSnapshotInput(snapshot);
  return {
    ...normalized,
    percentChange: calculatePercentChange(normalized.value, normalized.previousValue),
    targetProgressPercent: calculateTargetProgress(normalized.value, normalized.targetValue)
  };
}

function summarizeMetrics(snapshots = []) {
  const latestByKey = {};
  for (const row of snapshots) {
    const key = row.metricKey;
    if (!latestByKey[key] || String(row.capturedAt || '') > String(latestByKey[key].capturedAt || '')) {
      latestByKey[key] = enrichMetricSnapshot(row);
    }
  }

  const latest = Object.values(latestByKey);
  return {
    metricCount: latest.length,
    metrics: latest,
    aboveTargetCount: latest.filter(x => x.targetProgressPercent !== null && x.targetProgressPercent >= 100).length,
    belowTargetCount: latest.filter(x => x.targetProgressPercent !== null && x.targetProgressPercent < 100).length
  };
}

function renderDashboard({ dashboard, widgets = [], snapshots = [] }) {
  if (!dashboard) throw validationError('dashboard is required');
  const latest = summarizeMetrics(snapshots).metrics;
  const metricMap = new Map(latest.map(metric => [metric.metricKey, metric]));

  return {
    dashboard,
    generatedAt: new Date().toISOString(),
    widgets: widgets
      .slice()
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .map(widget => ({
        ...widget,
        metric: metricMap.get(widget.metricKey) || null
      }))
  };
}

function calculateOperationalKpis(input = {}) {
  const jobsCompleted = Number(input.jobsCompleted || 0);
  const jobsCreated = Number(input.jobsCreated || 0);
  const firstTimeFixes = Number(input.firstTimeFixes || 0);
  const totalRevenue = Number(input.totalRevenue || 0);
  const totalCost = Number(input.totalCost || 0);
  const callbacks = Number(input.callbacks || 0);
  const surveyResponses = Number(input.surveyResponses || 0);
  const promoterResponses = Number(input.promoterResponses || 0);
  const detractorResponses = Number(input.detractorResponses || 0);

  return {
    completionRate: jobsCreated ? Math.round((jobsCompleted / jobsCreated) * 10000) / 100 : 0,
    firstTimeFixRate: jobsCompleted ? Math.round((firstTimeFixes / jobsCompleted) * 10000) / 100 : 0,
    grossMarginPercent: totalRevenue ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 10000) / 100 : 0,
    callbackRate: jobsCompleted ? Math.round((callbacks / jobsCompleted) * 10000) / 100 : 0,
    nps: surveyResponses ? Math.round(((promoterResponses - detractorResponses) / surveyResponses) * 100) : null
  };
}

module.exports = {
  DASHBOARD_CATEGORIES,
  WIDGET_TYPES,
  METRIC_VALUE_TYPES,
  normalizeDashboardInput,
  normalizeDashboardWidgetInput,
  normalizeMetricSnapshotInput,
  calculatePercentChange,
  calculateTargetProgress,
  enrichMetricSnapshot,
  summarizeMetrics,
  renderDashboard,
  calculateOperationalKpis
};
