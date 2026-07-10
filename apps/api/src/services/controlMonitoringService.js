const { validationError } = require('../errors/domainError');

const MONITOR_STATUSES = ['draft', 'active', 'paused', 'retired'];
const MONITOR_TYPES = ['threshold', 'presence', 'freshness', 'ratio', 'boolean', 'custom'];
const SIGNAL_STATUSES = ['received', 'processed', 'ignored', 'failed'];
const HEALTH_STATUSES = ['healthy', 'warning', 'failing', 'unknown'];
const ALERT_STATUSES = ['open', 'acknowledged', 'resolved', 'suppressed'];
const ALERT_SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];
const SUPPRESSION_STATUSES = ['active', 'expired', 'revoked'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function normalizeMonitorInput(input = {}) {
  if (!input.controlId) throw validationError('controlId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active';
  const monitorType = input.monitorType || 'threshold';
  assertAllowed(status, MONITOR_STATUSES, 'monitor status');
  assertAllowed(monitorType, MONITOR_TYPES, 'monitor type');
  return {
    controlId: input.controlId,
    code: input.code || slugCode(input.name),
    name: input.name,
    status,
    monitorType,
    sourceSystem: input.sourceSystem || '',
    signalName: input.signalName || '',
    threshold: input.threshold === undefined ? null : Number(input.threshold),
    operator: input.operator || 'gte',
    evaluationWindowMinutes: Number(input.evaluationWindowMinutes || 60),
    severity: input.severity || 'medium',
    owner: input.owner || '',
    metadata: input.metadata || {}
  };
}

function normalizeSignalInput(input = {}) {
  if (!input.monitorId) throw validationError('monitorId is required');
  if (!input.signalName) throw validationError('signalName is required');
  const status = input.status || 'received';
  assertAllowed(status, SIGNAL_STATUSES, 'signal status');
  return {
    monitorId: input.monitorId,
    signalName: input.signalName,
    value: input.value === undefined ? null : input.value,
    numericValue: input.numericValue === undefined || input.numericValue === null ? null : Number(input.numericValue),
    status,
    observedAt: input.observedAt || new Date().toISOString(),
    sourceSystem: input.sourceSystem || '',
    payload: input.payload || {},
    metadata: input.metadata || {}
  };
}

function normalizeEvaluationInput(input = {}) {
  if (!input.monitorId) throw validationError('monitorId is required');
  const healthStatus = input.healthStatus || 'unknown';
  assertAllowed(healthStatus, HEALTH_STATUSES, 'health status');
  return {
    monitorId: input.monitorId,
    controlId: input.controlId || '',
    healthStatus,
    evaluatedAt: input.evaluatedAt || new Date().toISOString(),
    score: Number(input.score || 0),
    reason: input.reason || '',
    signalCount: Number(input.signalCount || 0),
    failingSignalCount: Number(input.failingSignalCount || 0),
    metadata: input.metadata || {}
  };
}

function normalizeAlertInput(input = {}) {
  if (!input.monitorId) throw validationError('monitorId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  const severity = input.severity || 'medium';
  assertAllowed(status, ALERT_STATUSES, 'alert status');
  assertAllowed(severity, ALERT_SEVERITIES, 'alert severity');
  return {
    monitorId: input.monitorId,
    controlId: input.controlId || '',
    title: input.title,
    description: input.description || '',
    severity,
    status,
    openedAt: input.openedAt || new Date().toISOString(),
    acknowledgedBy: input.acknowledgedBy || '',
    acknowledgedAt: input.acknowledgedAt || '',
    resolvedBy: input.resolvedBy || '',
    resolvedAt: input.resolvedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeSuppressionInput(input = {}) {
  if (!input.monitorId) throw validationError('monitorId is required');
  if (!input.reason) throw validationError('reason is required');
  const status = input.status || 'active';
  assertAllowed(status, SUPPRESSION_STATUSES, 'suppression status');
  return {
    monitorId: input.monitorId,
    status,
    reason: input.reason,
    startsAt: input.startsAt || new Date().toISOString(),
    endsAt: input.endsAt || '',
    createdBy: input.createdBy || '',
    revokedBy: input.revokedBy || '',
    revokedAt: input.revokedAt || '',
    metadata: input.metadata || {}
  };
}

function compareValue(value, operator, threshold) {
  const n = Number(value);
  const t = Number(threshold);
  if (Number.isNaN(n) || Number.isNaN(t)) return false;
  if (operator === 'gt') return n > t;
  if (operator === 'gte') return n >= t;
  if (operator === 'lt') return n < t;
  if (operator === 'lte') return n <= t;
  if (operator === 'eq') return n === t;
  if (operator === 'neq') return n !== t;
  throw validationError(`Unsupported operator: ${operator}`);
}

function evaluateMonitor(monitor, signals = [], at = new Date().toISOString()) {
  const relevant = signals.filter(x => x.monitorId === monitor.id);
  let failing = 0;
  let reason = 'No signals received';
  if (monitor.monitorType === 'presence') {
    failing = relevant.length === 0 ? 1 : 0;
    reason = failing ? 'Expected signal was not present' : 'Signal is present';
  } else if (monitor.monitorType === 'boolean') {
    failing = relevant.some(x => x.value === false || x.value === 'false') ? 1 : 0;
    reason = failing ? 'Boolean signal reported false' : 'Boolean signal is healthy';
  } else if (monitor.monitorType === 'threshold' || monitor.monitorType === 'ratio') {
    failing = relevant.filter(x => compareValue(x.numericValue, monitor.operator, monitor.threshold)).length;
    reason = failing ? `Threshold ${monitor.operator} ${monitor.threshold} breached` : 'Threshold not breached';
  } else if (monitor.monitorType === 'freshness') {
    failing = relevant.length === 0 ? 1 : 0;
    reason = failing ? 'No fresh signal available' : 'Freshness signal received';
  } else {
    failing = relevant.filter(x => x.status === 'failed').length;
    reason = failing ? 'Custom monitor reported failed signals' : 'Custom monitor healthy';
  }

  const healthStatus = failing > 0 ? (monitor.severity === 'critical' || monitor.severity === 'high' ? 'failing' : 'warning') : 'healthy';
  return normalizeEvaluationInput({
    monitorId: monitor.id,
    controlId: monitor.controlId,
    healthStatus,
    evaluatedAt: at,
    score: healthStatus === 'healthy' ? 100 : healthStatus === 'warning' ? 60 : 0,
    reason,
    signalCount: relevant.length,
    failingSignalCount: failing
  });
}

function shouldOpenAlert(evaluation) {
  return ['warning', 'failing'].includes(evaluation.healthStatus);
}

function alertFromEvaluation(monitor, evaluation) {
  return normalizeAlertInput({
    monitorId: monitor.id,
    controlId: monitor.controlId,
    title: `${monitor.name} is ${evaluation.healthStatus}`,
    description: evaluation.reason,
    severity: monitor.severity || (evaluation.healthStatus === 'failing' ? 'high' : 'medium')
  });
}

function acknowledgeAlert(alert, acknowledgedBy, at = new Date().toISOString()) {
  if (!acknowledgedBy) throw validationError('acknowledgedBy is required');
  return { ...alert, status: 'acknowledged', acknowledgedBy, acknowledgedAt: at, updatedAt: at };
}

function resolveAlert(alert, resolvedBy, at = new Date().toISOString()) {
  if (!resolvedBy) throw validationError('resolvedBy is required');
  return { ...alert, status: 'resolved', resolvedBy, resolvedAt: at, updatedAt: at };
}

function isSuppressed(monitorId, suppressions = [], asOf = new Date().toISOString()) {
  const t = new Date(asOf).getTime();
  return suppressions.some(x => x.monitorId === monitorId && x.status === 'active' && new Date(x.startsAt).getTime() <= t && (!x.endsAt || t <= new Date(x.endsAt).getTime()));
}

function revokeSuppression(suppression, revokedBy, at = new Date().toISOString()) {
  if (!revokedBy) throw validationError('revokedBy is required');
  return { ...suppression, status: 'revoked', revokedBy, revokedAt: at, updatedAt: at };
}

function monitoringMetrics({ monitors = [], evaluations = [], alerts = [] }) {
  const latestByMonitor = new Map();
  for (const evaluation of evaluations) latestByMonitor.set(evaluation.monitorId, evaluation);
  const latest = Array.from(latestByMonitor.values());
  return {
    totalMonitors: monitors.length,
    activeMonitors: monitors.filter(x => x.status === 'active').length,
    healthyControls: latest.filter(x => x.healthStatus === 'healthy').length,
    warningControls: latest.filter(x => x.healthStatus === 'warning').length,
    failingControls: latest.filter(x => x.healthStatus === 'failing').length,
    openAlerts: alerts.filter(x => ['open', 'acknowledged'].includes(x.status)).length
  };
}

module.exports = {
  MONITOR_STATUSES,
  MONITOR_TYPES,
  SIGNAL_STATUSES,
  HEALTH_STATUSES,
  ALERT_STATUSES,
  ALERT_SEVERITIES,
  SUPPRESSION_STATUSES,
  slugCode,
  normalizeMonitorInput,
  normalizeSignalInput,
  normalizeEvaluationInput,
  normalizeAlertInput,
  normalizeSuppressionInput,
  compareValue,
  evaluateMonitor,
  shouldOpenAlert,
  alertFromEvaluation,
  acknowledgeAlert,
  resolveAlert,
  isSuppressed,
  revokeSuppression,
  monitoringMetrics
};
