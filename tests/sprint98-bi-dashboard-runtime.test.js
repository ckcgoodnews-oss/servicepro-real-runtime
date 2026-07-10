const fs = require('fs');

const required = [
  'apps/api/src/services/biDashboardService.js',
  'apps/api/src/repositories/biDashboardRepository.js',
  'apps/api/src/routes/biDashboards.js',
  'scripts/seed-bi-dashboard.js',
  'packages/database/postgres/098_bi_dashboard_runtime.sql',
  'docs/sprint98-bi-dashboard-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 98 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeDashboardInput,
  normalizeDashboardWidgetInput,
  enrichMetricSnapshot,
  calculatePercentChange,
  calculateTargetProgress,
  summarizeMetrics,
  renderDashboard,
  calculateOperationalKpis
} = require('../apps/api/src/services/biDashboardService');

const dashboard = { id: 'dash1', ...normalizeDashboardInput({ name: 'Executive Overview', category: 'executive' }) };
if (dashboard.category !== 'executive' || dashboard.active !== true) {
  console.error('Dashboard normalization failed.');
  process.exit(1);
}

const widget = normalizeDashboardWidgetInput({ dashboardId: 'dash1', title: 'Revenue', metricKey: 'revenue' });
if (widget.widgetType !== 'kpi') {
  console.error('Widget normalization failed.');
  process.exit(1);
}

if (calculatePercentChange(120, 100) !== 20) {
  console.error('Percent change failed.');
  process.exit(1);
}

if (calculateTargetProgress(50, 100) !== 50) {
  console.error('Target progress failed.');
  process.exit(1);
}

const metric = enrichMetricSnapshot({ metricKey: 'revenue', value: 120, previousValue: 100, targetValue: 150 });
if (metric.percentChange !== 20 || metric.targetProgressPercent !== 80) {
  console.error('Metric enrichment failed.');
  process.exit(1);
}

const summary = summarizeMetrics([
  { metricKey: 'revenue', value: 100, capturedAt: '2026-07-01T00:00:00.000Z' },
  { metricKey: 'revenue', value: 120, targetValue: 100, capturedAt: '2026-07-02T00:00:00.000Z' }
]);
if (summary.metricCount !== 1 || summary.aboveTargetCount !== 1) {
  console.error('Metric summary failed.');
  process.exit(1);
}

const rendered = renderDashboard({ dashboard, widgets: [widget], snapshots: [metric] });
if (rendered.widgets[0].metric.metricKey !== 'revenue') {
  console.error('Dashboard render failed.');
  process.exit(1);
}

const kpis = calculateOperationalKpis({
  jobsCompleted: 80,
  jobsCreated: 100,
  firstTimeFixes: 70,
  totalRevenue: 100000,
  totalCost: 65000,
  callbacks: 4,
  surveyResponses: 10,
  promoterResponses: 7,
  detractorResponses: 1
});
if (kpis.completionRate !== 80 || kpis.grossMarginPercent !== 35 || kpis.nps !== 60) {
  console.error('Operational KPI calculation failed.');
  process.exit(1);
}

console.log('Sprint 98 BI dashboard runtime patch test passed.');
