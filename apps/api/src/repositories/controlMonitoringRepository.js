const { makeId, now } = require('../services/id');
const svc = require('../services/controlMonitoringService');

function createControlMonitoringRepository(store) {
  if (store.type === 'json') return createJsonControlMonitoringRepository(store);
  if (store.type === 'postgres') return createPostgresControlMonitoringRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureMonitoring(data) {
  data.controlMonitors ||= [];
  data.controlMonitorSignals ||= [];
  data.controlHealthEvaluations ||= [];
  data.controlMonitorAlerts ||= [];
  data.controlMonitorSuppressions ||= [];
  return data;
}

function createJsonControlMonitoringRepository(store) {
  return {
    listMonitors(filters = {}) {
      return ensureMonitoring(store.read()).controlMonitors
        .filter(x => !filters.controlId || x.controlId === filters.controlId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createMonitor(input) {
      const data = ensureMonitoring(store.read());
      const row = { id: makeId('monitor'), ...svc.normalizeMonitorInput(input), createdAt: now(), updatedAt: now() };
      data.controlMonitors.push(row);
      store.write(data);
      return row;
    },
    ingestSignal(input) {
      const data = ensureMonitoring(store.read());
      const row = { id: makeId('signal'), ...svc.normalizeSignalInput(input), createdAt: now(), updatedAt: now() };
      data.controlMonitorSignals.push(row);
      store.write(data);
      return row;
    },
    listSignals(monitorId) {
      return ensureMonitoring(store.read()).controlMonitorSignals
        .filter(x => x.monitorId === monitorId)
        .sort((a, b) => String(b.observedAt).localeCompare(String(a.observedAt)));
    },
    evaluateMonitor(id) {
      const data = ensureMonitoring(store.read());
      const monitor = data.controlMonitors.find(x => x.id === id);
      if (!monitor) return null;
      const evaluation = { id: makeId('eval'), ...svc.evaluateMonitor(monitor, data.controlMonitorSignals), createdAt: now(), updatedAt: now() };
      data.controlHealthEvaluations.push(evaluation);
      if (svc.shouldOpenAlert(evaluation) && !svc.isSuppressed(id, data.controlMonitorSuppressions)) {
        data.controlMonitorAlerts.push({ id: makeId('alert'), ...svc.alertFromEvaluation(monitor, evaluation), createdAt: now(), updatedAt: now() });
      }
      store.write(data);
      return evaluation;
    },
    listEvaluations(filters = {}) {
      return ensureMonitoring(store.read()).controlHealthEvaluations
        .filter(x => !filters.monitorId || x.monitorId === filters.monitorId)
        .filter(x => !filters.healthStatus || x.healthStatus === filters.healthStatus)
        .sort((a, b) => String(b.evaluatedAt).localeCompare(String(a.evaluatedAt)));
    },
    listAlerts(filters = {}) {
      return ensureMonitoring(store.read()).controlMonitorAlerts
        .filter(x => !filters.monitorId || x.monitorId === filters.monitorId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity)
        .sort((a, b) => String(b.openedAt).localeCompare(String(a.openedAt)));
    },
    acknowledgeAlert(id, acknowledgedBy) {
      const data = ensureMonitoring(store.read());
      const idx = data.controlMonitorAlerts.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.controlMonitorAlerts[idx] = svc.acknowledgeAlert(data.controlMonitorAlerts[idx], acknowledgedBy);
      store.write(data);
      return data.controlMonitorAlerts[idx];
    },
    resolveAlert(id, resolvedBy) {
      const data = ensureMonitoring(store.read());
      const idx = data.controlMonitorAlerts.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.controlMonitorAlerts[idx] = svc.resolveAlert(data.controlMonitorAlerts[idx], resolvedBy);
      store.write(data);
      return data.controlMonitorAlerts[idx];
    },
    createSuppression(input) {
      const data = ensureMonitoring(store.read());
      const row = { id: makeId('suppress'), ...svc.normalizeSuppressionInput(input), createdAt: now(), updatedAt: now() };
      data.controlMonitorSuppressions.push(row);
      store.write(data);
      return row;
    },
    listSuppressions(filters = {}) {
      return ensureMonitoring(store.read()).controlMonitorSuppressions
        .filter(x => !filters.monitorId || x.monitorId === filters.monitorId)
        .filter(x => !filters.status || x.status === filters.status);
    },
    revokeSuppression(id, revokedBy) {
      const data = ensureMonitoring(store.read());
      const idx = data.controlMonitorSuppressions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.controlMonitorSuppressions[idx] = svc.revokeSuppression(data.controlMonitorSuppressions[idx], revokedBy);
      store.write(data);
      return data.controlMonitorSuppressions[idx];
    },
    metrics() {
      const data = ensureMonitoring(store.read());
      return svc.monitoringMetrics({
        monitors: data.controlMonitors,
        evaluations: data.controlHealthEvaluations,
        alerts: data.controlMonitorAlerts
      });
    }
  };
}

function createPostgresControlMonitoringRepository() {
  return {
    async listMonitors() { return []; },
    async createMonitor(input) { return { id: 'postgres-monitor-placeholder', ...svc.normalizeMonitorInput(input) }; },
    async ingestSignal(input) { return { id: 'postgres-signal-placeholder', ...svc.normalizeSignalInput(input) }; },
    async listSignals() { return []; },
    async evaluateMonitor() { return null; },
    async listEvaluations() { return []; },
    async listAlerts() { return []; },
    async acknowledgeAlert() { return null; },
    async resolveAlert() { return null; },
    async createSuppression(input) { return { id: 'postgres-suppression-placeholder', ...svc.normalizeSuppressionInput(input) }; },
    async listSuppressions() { return []; },
    async revokeSuppression() { return null; },
    async metrics() { return svc.monitoringMetrics({}); }
  };
}

module.exports = { createControlMonitoringRepository };
