const { validationError } = require('../errors/domainError');

const MONITOR_TYPES = ['http', 'database', 'queue', 'worker', 'integration', 'custom'];
const MONITOR_STATUSES = ['active', 'muted', 'disabled'];
const ALERT_SEVERITIES = ['info', 'warning', 'critical'];
const ALERT_STATUSES = ['open', 'acknowledged', 'resolved', 'suppressed'];
const INCIDENT_STATUSES = ['open', 'investigating', 'mitigated', 'resolved', 'closed'];
const INCIDENT_SEVERITIES = ['sev1', 'sev2', 'sev3', 'sev4'];
const SLO_WINDOWS = ['7d', '30d', '90d'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeServiceMonitorInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  if (!input.serviceName) throw validationError('serviceName is required');

  const monitorType = input.monitorType || 'http';
  const status = input.status || 'active';

  if (!MONITOR_TYPES.includes(monitorType)) throw validationError(`Unsupported monitor type: ${monitorType}`);
  if (!MONITOR_STATUSES.includes(status)) throw validationError(`Unsupported monitor status: ${status}`);

  return {
    code: input.code || slugCode(`${input.serviceName}-${input.name}`),
    name: input.name,
    serviceName: input.serviceName,
    monitorType,
    status,
    target: input.target || '',
    checkIntervalSeconds: Number(input.checkIntervalSeconds || 60),
    timeoutSeconds: Number(input.timeoutSeconds || 10),
    ownerTeam: input.ownerTeam || 'platform',
    escalationPolicy: input.escalationPolicy || '',
    metadata: input.metadata || {}
  };
}

function normalizeSloInput(input = {}) {
  if (!input.serviceName) throw validationError('serviceName is required');
  if (!input.name) throw validationError('name is required');

  const window = input.window || '30d';
  if (!SLO_WINDOWS.includes(window)) throw validationError(`Unsupported SLO window: ${window}`);

  return {
    code: input.code || slugCode(`${input.serviceName}-${input.name}`),
    serviceName: input.serviceName,
    name: input.name,
    description: input.description || '',
    targetPercent: Number(input.targetPercent || 99.9),
    window,
    measurementType: input.measurementType || 'availability',
    active: input.active !== false,
    metadata: input.metadata || {}
  };
}

function normalizeAlertEventInput(input = {}) {
  if (!input.monitorId) throw validationError('monitorId is required');
  if (!input.title) throw validationError('title is required');

  const severity = input.severity || 'warning';
  const status = input.status || 'open';

  if (!ALERT_SEVERITIES.includes(severity)) throw validationError(`Unsupported alert severity: ${severity}`);
  if (!ALERT_STATUSES.includes(status)) throw validationError(`Unsupported alert status: ${status}`);

  return {
    monitorId: input.monitorId,
    incidentId: input.incidentId || '',
    title: input.title,
    description: input.description || '',
    severity,
    status,
    observedValue: input.observedValue === undefined ? null : input.observedValue,
    thresholdValue: input.thresholdValue === undefined ? null : input.thresholdValue,
    openedAt: input.openedAt || new Date().toISOString(),
    acknowledgedBy: input.acknowledgedBy || '',
    acknowledgedAt: input.acknowledgedAt || '',
    resolvedBy: input.resolvedBy || '',
    resolvedAt: input.resolvedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeIncidentInput(input = {}) {
  if (!input.title) throw validationError('title is required');

  const severity = input.severity || 'sev3';
  const status = input.status || 'open';

  if (!INCIDENT_SEVERITIES.includes(severity)) throw validationError(`Unsupported incident severity: ${severity}`);
  if (!INCIDENT_STATUSES.includes(status)) throw validationError(`Unsupported incident status: ${status}`);

  return {
    title: input.title,
    description: input.description || '',
    severity,
    status,
    impactedServices: Array.isArray(input.impactedServices) ? input.impactedServices : [],
    commander: input.commander || '',
    openedAt: input.openedAt || new Date().toISOString(),
    mitigatedAt: input.mitigatedAt || '',
    resolvedAt: input.resolvedAt || '',
    closedAt: input.closedAt || '',
    rootCause: input.rootCause || '',
    metadata: input.metadata || {}
  };
}

function normalizeIncidentTimelineInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.eventType) throw validationError('eventType is required');

  return {
    incidentId: input.incidentId,
    eventType: input.eventType,
    message: input.message || '',
    actor: input.actor || '',
    occurredAt: input.occurredAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function acknowledgeAlert(alert, actor, at = new Date().toISOString()) {
  if (!actor) throw validationError('actor is required');
  return { ...alert, status: 'acknowledged', acknowledgedBy: actor, acknowledgedAt: at, updatedAt: at };
}

function resolveAlert(alert, actor, at = new Date().toISOString()) {
  if (!actor) throw validationError('actor is required');
  return { ...alert, status: 'resolved', resolvedBy: actor, resolvedAt: at, updatedAt: at };
}

function transitionIncident(incident, status, actor = '', at = new Date().toISOString()) {
  if (!INCIDENT_STATUSES.includes(status)) throw validationError(`Unsupported incident status: ${status}`);
  const next = { ...incident, status, updatedAt: at };
  if (status === 'mitigated') next.mitigatedAt = at;
  if (status === 'resolved') next.resolvedAt = at;
  if (status === 'closed') next.closedAt = at;
  if (actor && !next.commander) next.commander = actor;
  return next;
}

function calculateAvailabilityPercent(successCount, totalCount) {
  const total = Number(totalCount || 0);
  if (total <= 0) return 100;
  return Math.round((Number(successCount || 0) / total) * 100000) / 1000;
}

function calculateErrorBudget({ targetPercent = 99.9, totalEvents = 0, badEvents = 0 }) {
  const total = Number(totalEvents || 0);
  const bad = Number(badEvents || 0);
  const allowedBad = total * ((100 - Number(targetPercent || 0)) / 100);
  const remaining = Math.max(0, allowedBad - bad);
  const consumed = allowedBad <= 0 ? (bad > 0 ? 100 : 0) : Math.round((bad / allowedBad) * 10000) / 100;

  return {
    targetPercent: Number(targetPercent || 0),
    totalEvents: total,
    badEvents: bad,
    allowedBadEvents: Math.round(allowedBad * 1000) / 1000,
    remainingBadEvents: Math.round(remaining * 1000) / 1000,
    consumedPercent: consumed,
    exhausted: bad > allowedBad
  };
}

function evaluateSlo(slo, measurements = []) {
  if (!slo) throw validationError('slo is required');
  const totalEvents = measurements.reduce((sum, x) => sum + Number(x.totalEvents || x.total || 0), 0);
  const badEvents = measurements.reduce((sum, x) => sum + Number(x.badEvents || x.failed || 0), 0);
  const successEvents = Math.max(0, totalEvents - badEvents);
  const availabilityPercent = calculateAvailabilityPercent(successEvents, totalEvents);
  const errorBudget = calculateErrorBudget({ targetPercent: slo.targetPercent, totalEvents, badEvents });

  return {
    sloCode: slo.code || '',
    serviceName: slo.serviceName,
    targetPercent: Number(slo.targetPercent || 0),
    availabilityPercent,
    met: availabilityPercent >= Number(slo.targetPercent || 0),
    errorBudget
  };
}

function summarizeIncidents(incidents = []) {
  return {
    total: incidents.length,
    open: incidents.filter(x => ['open', 'investigating'].includes(x.status)).length,
    mitigated: incidents.filter(x => x.status === 'mitigated').length,
    resolved: incidents.filter(x => ['resolved', 'closed'].includes(x.status)).length,
    sev1: incidents.filter(x => x.severity === 'sev1').length,
    sev2: incidents.filter(x => x.severity === 'sev2').length
  };
}

module.exports = {
  MONITOR_TYPES,
  MONITOR_STATUSES,
  ALERT_SEVERITIES,
  ALERT_STATUSES,
  INCIDENT_STATUSES,
  INCIDENT_SEVERITIES,
  SLO_WINDOWS,
  slugCode,
  normalizeServiceMonitorInput,
  normalizeSloInput,
  normalizeAlertEventInput,
  normalizeIncidentInput,
  normalizeIncidentTimelineInput,
  acknowledgeAlert,
  resolveAlert,
  transitionIncident,
  calculateAvailabilityPercent,
  calculateErrorBudget,
  evaluateSlo,
  summarizeIncidents
};
