const { validationError } = require('../errors/domainError');

const SOURCE_STATUSES = ['planned', 'active', 'degraded', 'disabled', 'retired'];
const SOURCE_TYPES = ['siem', 'edr', 'firewall', 'identity', 'cloud', 'application', 'database', 'email_gateway', 'proxy', 'other'];
const RULE_STATUSES = ['draft', 'testing', 'active', 'disabled', 'retired'];
const RULE_TYPES = ['sigma', 'kql', 'spl', 'sql', 'yara', 'custom'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const ALERT_STATUSES = ['new', 'triaged', 'investigating', 'escalated', 'closed', 'false_positive', 'suppressed'];
const TEST_STATUSES = ['pending', 'passed', 'failed'];
const SUPPRESSION_STATUSES = ['active', 'expired', 'revoked'];
const TUNING_STATUSES = ['proposed', 'approved', 'applied', 'rejected'];

function assertAllowed(value, allowed, label) { if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`); }
function slugCode(value = '') { return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function addDays(dateText, days) { const base = new Date(dateText || new Date().toISOString()); base.setUTCDate(base.getUTCDate() + Number(days || 0)); return base.toISOString(); }

function normalizeLogSourceInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required'); if (!input.name) throw validationError('name is required');
  const status = input.status || 'planned', sourceType = input.sourceType || 'other';
  assertAllowed(status, SOURCE_STATUSES, 'log source status'); assertAllowed(sourceType, SOURCE_TYPES, 'log source type');
  return { tenantId: input.tenantId, code: input.code || slugCode(input.name), name: input.name, description: input.description || '', sourceType, status, owner: input.owner || '', ingestMethod: input.ingestMethod || '', parserName: input.parserName || '', lastEventAt: input.lastEventAt || '', expectedEventsPerHour: Number(input.expectedEventsPerHour || 0), metadata: input.metadata || {} };
}
function normalizeRuleInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required'); if (!input.name) throw validationError('name is required'); if (!input.query) throw validationError('query is required');
  const status = input.status || 'draft', ruleType = input.ruleType || 'custom', severity = input.severity || 'medium';
  assertAllowed(status, RULE_STATUSES, 'rule status'); assertAllowed(ruleType, RULE_TYPES, 'rule type'); assertAllowed(severity, SEVERITIES, 'rule severity');
  return { tenantId: input.tenantId, code: input.code || slugCode(input.name), name: input.name, description: input.description || '', ruleType, status, severity, query: input.query, sourceIds: Array.isArray(input.sourceIds) ? input.sourceIds : [], tactic: input.tactic || '', technique: input.technique || '', enabledAt: input.enabledAt || '', owner: input.owner || '', runFrequencyMinutes: Number(input.runFrequencyMinutes || 15), metadata: input.metadata || {} };
}
function normalizeRuleTestInput(input = {}) {
  if (!input.ruleId) throw validationError('ruleId is required');
  const status = input.status || 'pending'; assertAllowed(status, TEST_STATUSES, 'rule test status');
  return { tenantId: input.tenantId || '', ruleId: input.ruleId, testName: input.testName || 'Detection test', sampleEvent: input.sampleEvent || {}, expectedMatch: input.expectedMatch !== false, actualMatch: input.actualMatch === undefined ? null : input.actualMatch === true, status, testedAt: input.testedAt || '', failureReason: input.failureReason || '', metadata: input.metadata || {} };
}
function normalizeAlertInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required'); if (!input.ruleId) throw validationError('ruleId is required'); if (!input.title) throw validationError('title is required');
  const status = input.status || 'new', severity = input.severity || 'medium';
  assertAllowed(status, ALERT_STATUSES, 'alert status'); assertAllowed(severity, SEVERITIES, 'alert severity');
  return { tenantId: input.tenantId, ruleId: input.ruleId, sourceId: input.sourceId || '', title: input.title, description: input.description || '', status, severity, observedAt: input.observedAt || new Date().toISOString(), entityType: input.entityType || '', entityValue: input.entityValue || '', eventCount: Number(input.eventCount || 1), rawEventIds: Array.isArray(input.rawEventIds) ? input.rawEventIds : [], assignedTo: input.assignedTo || '', closedAt: input.closedAt || '', closeReason: input.closeReason || '', incidentId: input.incidentId || '', metadata: input.metadata || {} };
}
function normalizeSuppressionInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required'); if (!input.ruleId) throw validationError('ruleId is required'); if (!input.reason) throw validationError('reason is required');
  const status = input.status || 'active'; assertAllowed(status, SUPPRESSION_STATUSES, 'suppression status');
  return { tenantId: input.tenantId, ruleId: input.ruleId, entityType: input.entityType || '', entityValue: input.entityValue || '', reason: input.reason, status, createdBy: input.createdBy || '', startsAt: input.startsAt || new Date().toISOString(), expiresAt: input.expiresAt || addDays(new Date().toISOString(), 30), revokedAt: input.revokedAt || '', metadata: input.metadata || {} };
}
function normalizeTuningInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required'); if (!input.ruleId) throw validationError('ruleId is required'); if (!input.summary) throw validationError('summary is required');
  const status = input.status || 'proposed'; assertAllowed(status, TUNING_STATUSES, 'tuning status');
  return { tenantId: input.tenantId, ruleId: input.ruleId, summary: input.summary, beforeQuery: input.beforeQuery || '', afterQuery: input.afterQuery || '', status, proposedBy: input.proposedBy || '', approvedBy: input.approvedBy || '', approvedAt: input.approvedAt || '', appliedAt: input.appliedAt || '', metadata: input.metadata || {} };
}
function severityRank(severity) { return { low: 1, medium: 2, high: 3, critical: 4 }[severity] || 0; }
function activateSource(source, at = new Date().toISOString()) { return { ...source, status: 'active', updatedAt: at }; }
function markSourceDegraded(source, at = new Date().toISOString()) { return { ...source, status: 'degraded', updatedAt: at }; }
function activateRule(rule, at = new Date().toISOString()) { return { ...rule, status: 'active', enabledAt: rule.enabledAt || at, updatedAt: at }; }
function disableRule(rule, at = new Date().toISOString()) { return { ...rule, status: 'disabled', updatedAt: at }; }
function runRuleTest(test, actualMatch, at = new Date().toISOString()) { const passed = Boolean(actualMatch) === Boolean(test.expectedMatch); return { ...test, actualMatch: Boolean(actualMatch), status: passed ? 'passed' : 'failed', failureReason: passed ? '' : 'Expected match result did not equal actual result', testedAt: at, updatedAt: at }; }
function triageAlert(alert, assignee = '', at = new Date().toISOString()) { return { ...alert, status: 'triaged', assignedTo: assignee || alert.assignedTo, updatedAt: at }; }
function investigateAlert(alert, assignee = '', at = new Date().toISOString()) { return { ...alert, status: 'investigating', assignedTo: assignee || alert.assignedTo, updatedAt: at }; }
function escalateAlert(alert, incidentId = '', at = new Date().toISOString()) { return { ...alert, status: 'escalated', incidentId: incidentId || alert.incidentId, updatedAt: at }; }
function closeAlert(alert, reason, at = new Date().toISOString()) { if (!reason) throw validationError('reason is required'); return { ...alert, status: 'closed', closeReason: reason, closedAt: at, updatedAt: at }; }
function markFalsePositive(alert, reason, at = new Date().toISOString()) { if (!reason) throw validationError('reason is required'); return { ...alert, status: 'false_positive', closeReason: reason, closedAt: at, updatedAt: at }; }
function suppressionMatches(suppression, alert, asOf = new Date().toISOString()) { if (suppression.status !== 'active') return false; if (suppression.ruleId !== alert.ruleId) return false; if (new Date(asOf).getTime() > new Date(suppression.expiresAt).getTime()) return false; if (suppression.entityType && suppression.entityType !== alert.entityType) return false; if (suppression.entityValue && suppression.entityValue !== alert.entityValue) return false; return true; }
function applySuppressionToAlert(alert, suppression, at = new Date().toISOString()) { return suppressionMatches(suppression, alert, at) ? { ...alert, status: 'suppressed', closeReason: suppression.reason, closedAt: at, updatedAt: at } : alert; }
function approveTuning(tuning, approvedBy, at = new Date().toISOString()) { if (!approvedBy) throw validationError('approvedBy is required'); return { ...tuning, status: 'approved', approvedBy, approvedAt: at, updatedAt: at }; }
function applyTuning(tuning, at = new Date().toISOString()) { return { ...tuning, status: 'applied', appliedAt: at, updatedAt: at }; }
function detectionMetrics({ sources = [], rules = [], tests = [], alerts = [], suppressions = [], tunings = [] }) { return { activeSources: sources.filter(x => x.status === 'active').length, activeRules: rules.filter(x => x.status === 'active').length, failedTests: tests.filter(x => x.status === 'failed').length, openAlerts: alerts.filter(x => ['new', 'triaged', 'investigating', 'escalated'].includes(x.status)).length, criticalAlerts: alerts.filter(x => x.severity === 'critical' && ['new', 'triaged', 'investigating', 'escalated'].includes(x.status)).length, activeSuppressions: suppressions.filter(x => x.status === 'active').length, appliedTunings: tunings.filter(x => x.status === 'applied').length }; }

module.exports = { SOURCE_STATUSES, SOURCE_TYPES, RULE_STATUSES, RULE_TYPES, SEVERITIES, ALERT_STATUSES, TEST_STATUSES, SUPPRESSION_STATUSES, TUNING_STATUSES, assertAllowed, slugCode, addDays, normalizeLogSourceInput, normalizeRuleInput, normalizeRuleTestInput, normalizeAlertInput, normalizeSuppressionInput, normalizeTuningInput, severityRank, activateSource, markSourceDegraded, activateRule, disableRule, runRuleTest, triageAlert, investigateAlert, escalateAlert, closeAlert, markFalsePositive, suppressionMatches, applySuppressionToAlert, approveTuning, applyTuning, detectionMetrics };
