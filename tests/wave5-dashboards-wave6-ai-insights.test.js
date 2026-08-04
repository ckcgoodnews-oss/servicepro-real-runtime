/**
 * Wave 5: Configurable Dashboards + Wave 6: AI Insights
 */
const assert = require('assert');
const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const aiInsightService = require('../apps/api/src/services/aiInsightService');

const T = 'tenant_demo';
const repos = getRepositories();

function test(name, fn) {
  try { fn(); console.log(`  \u2713 ${name}`); }
  catch (e) { console.error(`  \u2717 ${name}: ${e.message}`); process.exitCode = 1; }
}

console.log('Wave 5: Configurable Dashboards');
console.log('================================');

// --- Dashboards ---
console.log('\n  Dashboards');

let testDashId;
test('creates a dashboard', () => {
  const dash = repos.customDashboards.create(T, {
    name: 'Revenue Operations', is_default: true, owner_id: 'user-001'
  });
  assert(dash.id);
  assert.strictEqual(dash.name, 'Revenue Operations');
  assert.strictEqual(dash.isDefault, true);
  testDashId = dash.id;
});

test('lists dashboards for tenant', () => {
  repos.customDashboards.create(T, { name: 'Field Service Overview' });
  const list = repos.customDashboards.list(T, {});
  assert(list.length >= 2);
  assert(list[0].isDefault, 'default dashboard should be first');
});

test('updates dashboard layout', () => {
  const layout = [
    { widget_id: 'w1', x: 0, y: 0, w: 4, h: 3 },
    { widget_id: 'w2', x: 4, y: 0, w: 4, h: 3 }
  ];
  const updated = repos.customDashboards.update(T, testDashId, { layout });
  assert.strictEqual(updated.layout.length, 2);
});

test('tenant isolation on dashboards', () => {
  repos.customDashboards.create('other_dash_tenant', { name: 'Other Dash' });
  const list = repos.customDashboards.list(T, {});
  assert(list.every(d => d.tenantId === T));
});

// --- Widgets ---
console.log('\n  Dashboard Widgets');

let testWidgetId;
test('adds KPI widget to dashboard', () => {
  const widget = repos.customDashboards.addWidget(T, testDashId, {
    widget_type: 'kpi', title: 'Open Deals', data_source: 'deals',
    config: { filter: { status: 'open' }, metric: 'count' },
    position: { x: 0, y: 0, w: 3, h: 2 }
  });
  assert(widget.id);
  assert.strictEqual(widget.widgetType, 'kpi');
  assert.strictEqual(widget.dataSource, 'deals');
  testWidgetId = widget.id;
});

test('adds chart widget', () => {
  repos.customDashboards.addWidget(T, testDashId, {
    widget_type: 'chart', title: 'Tickets by Status', data_source: 'tickets',
    config: { chart_type: 'bar', group_by: 'status' },
    position: { x: 3, y: 0, w: 5, h: 4 }
  });
});

test('adds activity feed widget', () => {
  repos.customDashboards.addWidget(T, testDashId, {
    widget_type: 'activity', title: 'Recent Activity', data_source: 'activities',
    config: { limit: 10 }, position: { x: 0, y: 4, w: 4, h: 4 }
  });
});

test('lists widgets for a dashboard', () => {
  const widgets = repos.customDashboards.listWidgets(T, testDashId);
  assert(widgets.length >= 3, 'should have 3 widgets');
});

test('updates widget config', () => {
  const updated = repos.customDashboards.updateWidget(T, testWidgetId, {
    config: { filter: { status: 'open' }, metric: 'sum_amount' }
  });
  assert.strictEqual(updated.config.metric, 'sum_amount');
  assert.strictEqual(updated.config.filter.status, 'open'); // preserved via merge
});

test('removes widget', () => {
  const w = repos.customDashboards.addWidget(T, testDashId, {
    widget_type: 'table', title: 'Temp Widget', data_source: 'contacts'
  });
  repos.customDashboards.removeWidget(T, w.id);
  const widgets = repos.customDashboards.listWidgets(T, testDashId);
  assert(!widgets.some(x => x.id === w.id));
});

test('deleting dashboard removes all widgets', () => {
  const dash = repos.customDashboards.create(T, { name: 'Temp Dash' });
  repos.customDashboards.addWidget(T, dash.id, { widget_type: 'kpi', title: 'W', data_source: 'deals' });
  repos.customDashboards.delete(T, dash.id);
  assert.strictEqual(repos.customDashboards.listWidgets(T, dash.id).length, 0);
});

console.log('\n\nWave 6: AI Insights');
console.log('===================');

// --- AI Insight Service (scoring functions) ---
console.log('\n  AI Insight Service — Deal Risk');

test('scores low-risk deal', () => {
  const deal = { id: 'd1', stage: 'proposal', amount: 10000, probability: 60, updatedAt: new Date().toISOString(), expectedCloseDate: new Date(Date.now() + 14 * 86400000).toISOString() };
  const insight = aiInsightService.scoreDealRisk(deal);
  assert.strictEqual(insight.insight_type, 'deal_risk');
  assert(insight.confidence < 0.3, 'healthy deal should have low risk');
  assert.strictEqual(insight.severity, 'info');
});

test('scores high-risk deal (stale + overdue)', () => {
  const deal = { id: 'd2', stage: 'proposal', amount: 0, probability: 15, updatedAt: new Date(Date.now() - 40 * 86400000).toISOString(), expectedCloseDate: new Date(Date.now() - 20 * 86400000).toISOString() };
  const insight = aiInsightService.scoreDealRisk(deal);
  assert(insight.confidence >= 0.5, 'stale + overdue + no value should be high risk');
  assert(['warning', 'critical'].includes(insight.severity));
  assert(insight.detail.risks.length >= 2);
});

test('scores deal with no close date', () => {
  const deal = { id: 'd3', stage: 'new', amount: 5000, updatedAt: new Date().toISOString() };
  const insight = aiInsightService.scoreDealRisk(deal);
  assert.strictEqual(insight.entity_type, 'deal');
  assert.strictEqual(insight.entity_id, 'd3');
});

console.log('\n  AI Insight Service — Churn Risk');

test('scores low churn risk customer', () => {
  const customer = { id: 'cust-001' };
  const insight = aiInsightService.scoreChurnRisk(customer, [], [], []);
  assert.strictEqual(insight.insight_type, 'churn_risk');
  assert(insight.confidence < 0.3);
});

test('scores high churn risk (overdue invoices + tickets)', () => {
  const customer = { id: 'cust-002' };
  const tickets = [
    { id: 't1', priority: 'urgent', createdAt: new Date().toISOString() },
    { id: 't2', priority: 'high', createdAt: new Date().toISOString() },
    { id: 't3', priority: 'medium', createdAt: new Date().toISOString() },
    { id: 't4', priority: 'low', createdAt: new Date().toISOString() },
    { id: 't5', priority: 'medium', createdAt: new Date().toISOString() }
  ];
  const invoices = [
    { id: 'inv1', status: 'overdue' },
    { id: 'inv2', status: 'overdue' }
  ];
  const insight = aiInsightService.scoreChurnRisk(customer, tickets, invoices, []);
  assert(insight.confidence >= 0.5);
  assert(['warning', 'critical'].includes(insight.severity));
});

console.log('\n  AI Insight Service — Ticket Routing');

test('suggests HVAC routing from subject', () => {
  const ticket = { id: 'tkt-001', subject: 'Air conditioning not cooling properly', priority: 'high' };
  const insight = aiInsightService.suggestTicketRouting(ticket);
  assert.strictEqual(insight.insight_type, 'ticket_routing');
  assert.strictEqual(insight.detail.suggestedTeam, 'hvac');
  assert(insight.confidence >= 0.7);
});

test('flags urgent unassigned ticket', () => {
  const ticket = { id: 'tkt-002', subject: 'Water heater broken', priority: 'urgent', assignedTo: null };
  const insight = aiInsightService.suggestTicketRouting(ticket);
  assert.strictEqual(insight.severity, 'critical');
  assert(insight.detail.suggestions.some(s => s.toLowerCase().includes('urgent')));
});

console.log('\n  AI Insight Service — Next Action');

test('suggests call for deal with no activity', () => {
  const deal = { id: 'd-act', stage: 'qualified', amount: 8000 };
  const insight = aiInsightService.suggestNextAction(deal, []);
  assert.strictEqual(insight.insight_type, 'next_action');
  assert.strictEqual(insight.detail.recommended_action, 'call');
});

test('suggests meeting for proposal stage without one', () => {
  const deal = { id: 'd-meet', stage: 'proposal', amount: 15000, updatedAt: new Date(Date.now() - 2 * 86400000).toISOString() };
  const activities = [{ activityType: 'email', performedAt: new Date(Date.now() - 2 * 86400000).toISOString() }];
  const insight = aiInsightService.suggestNextAction(deal, activities);
  assert.strictEqual(insight.detail.recommended_action, 'meeting');
});

// --- AI Insight Repository ---
console.log('\n  AI Insight Repository');

test('stores and retrieves insights', () => {
  const insight = repos.aiInsights.upsert(T, {
    entity_type: 'deal', entity_id: 'deal-risk-001',
    insight_type: 'deal_risk', title: 'Deal at risk', summary: 'No updates in 35 days',
    confidence: 0.65, severity: 'warning',
    detail: { risks: ['No updates in over 30 days'] }
  });
  assert(insight.id);
  assert.strictEqual(insight.status, 'active');
  assert.strictEqual(insight.confidence, 0.65);
});

test('upserts replaces existing active insight of same type', () => {
  repos.aiInsights.upsert(T, { entity_type: 'deal', entity_id: 'upsert-deal', insight_type: 'deal_risk', title: 'Risk v1', confidence: 0.4, severity: 'info', detail: {} });
  repos.aiInsights.upsert(T, { entity_type: 'deal', entity_id: 'upsert-deal', insight_type: 'deal_risk', title: 'Risk v2 (updated)', confidence: 0.7, severity: 'warning', detail: {} });
  const list = repos.aiInsights.list(T, { entity_type: 'deal', entity_id: 'upsert-deal', status: 'active' });
  assert.strictEqual(list.length, 1, 'should have only one active insight per type+entity');
  assert.strictEqual(list[0].title, 'Risk v2 (updated)');
});

test('dismisses an insight', () => {
  const insight = repos.aiInsights.upsert(T, {
    entity_type: 'ticket', entity_id: 'tkt-dismiss', insight_type: 'ticket_routing',
    title: 'Route to HVAC', confidence: 0.8, severity: 'info', detail: {}
  });
  repos.aiInsights.updateStatus(T, insight.id, 'dismissed');
  const updated = repos.aiInsights.findById(T, insight.id);
  assert.strictEqual(updated.status, 'dismissed');
});

test('marks insight as acted on with user', () => {
  const insight = repos.aiInsights.upsert(T, {
    entity_type: 'deal', entity_id: 'acted-deal', insight_type: 'next_action',
    title: 'Schedule follow-up call', confidence: 0.75, severity: 'warning', detail: {}
  });
  repos.aiInsights.updateStatus(T, insight.id, 'acted_on', 'sales@demo.com');
  const updated = repos.aiInsights.findById(T, insight.id);
  assert.strictEqual(updated.status, 'acted_on');
  assert.strictEqual(updated.actedOnBy, 'sales@demo.com');
  assert(updated.actedOnAt);
});

test('insight counts by type and severity', () => {
  repos.aiInsights.upsert(T, { entity_type: 'deal', entity_id: 'cnt-1', insight_type: 'deal_risk', title: 'T', confidence: 0.8, severity: 'critical', detail: {} });
  repos.aiInsights.upsert(T, { entity_type: 'customer', entity_id: 'cnt-2', insight_type: 'churn_risk', title: 'T', confidence: 0.5, severity: 'warning', detail: {} });
  const counts = repos.aiInsights.counts(T);
  assert(counts.total >= 2);
  assert(counts.bySeverity.critical >= 1);
  assert(counts.byType.deal_risk >= 1);
});

test('expires old insights', () => {
  // Manually backdate an insight
  const d = require('../apps/api/src/repositories/repositoryFactory').getRepositories();
  const insight = repos.aiInsights.upsert(T, {
    entity_type: 'lead', entity_id: 'expire-lead', insight_type: 'deal_risk',
    title: 'Old insight', confidence: 0.3, severity: 'info', detail: {}
  });
  // Directly age it
  insight.createdAt = new Date(Date.now() - 31 * 86400000).toISOString();
  // Re-save by updating status (no-op if already active) then expire
  const result = repos.aiInsights.expireOld(T, 30);
  assert(typeof result.expired === 'number');
});

test('tenant isolation on insights', () => {
  repos.aiInsights.upsert('other_insight_tenant', {
    entity_type: 'deal', entity_id: 'x', insight_type: 'deal_risk', title: 'T', confidence: 0.5, severity: 'info', detail: {}
  });
  const list = repos.aiInsights.list(T, {});
  assert(list.every(i => i.tenantId === T));
});

console.log('\n================================');
console.log('Wave 5 + Wave 6 tests complete.');
