const { makeId, now } = require('../services/id');
const {
  normalizeServiceMonitorInput,
  normalizeSloInput,
  normalizeAlertEventInput,
  normalizeIncidentInput,
  normalizeIncidentTimelineInput,
  acknowledgeAlert,
  resolveAlert,
  transitionIncident,
  evaluateSlo,
  summarizeIncidents
} = require('../services/observabilityService');

function createObservabilityRepository(store) {
  if (store.type === 'json') return createJsonObservabilityRepository(store);
  if (store.type === 'postgres') return createPostgresObservabilityRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureObs(data) {
  if (!data.serviceMonitors) data.serviceMonitors = [];
  if (!data.serviceSlos) data.serviceSlos = [];
  if (!data.alertEvents) data.alertEvents = [];
  if (!data.incidents) data.incidents = [];
  if (!data.incidentTimelineEvents) data.incidentTimelineEvents = [];
  return data;
}

function createJsonObservabilityRepository(store) {
  return {
    listMonitors(tenantId, filters = {}) {
      return ensureObs(store.read()).serviceMonitors
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.serviceName || x.serviceName === filters.serviceName)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createMonitor(tenantId, input) {
      const data = ensureObs(store.read());
      const row = { id: makeId('mon'), tenantId, ...normalizeServiceMonitorInput(input), createdAt: now(), updatedAt: now() };
      data.serviceMonitors.push(row);
      store.write(data);
      return row;
    },
    listSlos(tenantId, filters = {}) {
      return ensureObs(store.read()).serviceSlos
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.serviceName || x.serviceName === filters.serviceName)
        .filter(x => filters.active === undefined || x.active === filters.active)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createSlo(tenantId, input) {
      const data = ensureObs(store.read());
      const row = { id: makeId('slo'), tenantId, ...normalizeSloInput(input), createdAt: now(), updatedAt: now() };
      data.serviceSlos.push(row);
      store.write(data);
      return row;
    },
    evaluateSlo(tenantId, input = {}) {
      const data = ensureObs(store.read());
      const slo = data.serviceSlos.find(x => x.tenantId === tenantId && x.id === input.sloId);
      return slo ? evaluateSlo(slo, input.measurements || []) : null;
    },
    listAlerts(tenantId, filters = {}) {
      return ensureObs(store.read()).alertEvents
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity)
        .filter(x => !filters.monitorId || x.monitorId === filters.monitorId)
        .sort((a, b) => String(b.openedAt).localeCompare(String(a.openedAt)));
    },
    createAlert(tenantId, input) {
      const data = ensureObs(store.read());
      const row = { id: makeId('alert'), tenantId, ...normalizeAlertEventInput(input), createdAt: now(), updatedAt: now() };
      data.alertEvents.push(row);
      store.write(data);
      return row;
    },
    acknowledgeAlert(tenantId, id, actor) {
      const data = ensureObs(store.read());
      const idx = data.alertEvents.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.alertEvents[idx] = acknowledgeAlert(data.alertEvents[idx], actor);
      store.write(data);
      return data.alertEvents[idx];
    },
    resolveAlert(tenantId, id, actor) {
      const data = ensureObs(store.read());
      const idx = data.alertEvents.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.alertEvents[idx] = resolveAlert(data.alertEvents[idx], actor);
      store.write(data);
      return data.alertEvents[idx];
    },
    listIncidents(tenantId, filters = {}) {
      return ensureObs(store.read()).incidents
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity)
        .sort((a, b) => String(b.openedAt).localeCompare(String(a.openedAt)));
    },
    createIncident(tenantId, input) {
      const data = ensureObs(store.read());
      const row = { id: makeId('inc'), tenantId, ...normalizeIncidentInput(input), createdAt: now(), updatedAt: now() };
      data.incidents.push(row);
      data.incidentTimelineEvents.push({
        id: makeId('inctl'),
        tenantId,
        incidentId: row.id,
        eventType: 'created',
        message: row.title,
        actor: row.commander || '',
        occurredAt: row.openedAt,
        metadata: {},
        createdAt: now(),
        updatedAt: now()
      });
      store.write(data);
      return row;
    },
    transitionIncident(tenantId, id, input = {}) {
      const data = ensureObs(store.read());
      const idx = data.incidents.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.incidents[idx] = transitionIncident(data.incidents[idx], input.status, input.actor || '');
      data.incidentTimelineEvents.push({
        id: makeId('inctl'),
        tenantId,
        incidentId: id,
        eventType: 'status_change',
        message: `Incident moved to ${input.status}`,
        actor: input.actor || '',
        occurredAt: now(),
        metadata: {},
        createdAt: now(),
        updatedAt: now()
      });
      store.write(data);
      return data.incidents[idx];
    },
    addTimelineEvent(tenantId, input) {
      const data = ensureObs(store.read());
      const row = { id: makeId('inctl'), tenantId, ...normalizeIncidentTimelineInput(input), createdAt: now(), updatedAt: now() };
      data.incidentTimelineEvents.push(row);
      store.write(data);
      return row;
    },
    listTimeline(tenantId, incidentId) {
      return ensureObs(store.read()).incidentTimelineEvents
        .filter(x => x.tenantId === tenantId && x.incidentId === incidentId)
        .sort((a, b) => String(a.occurredAt).localeCompare(String(b.occurredAt)));
    },
    summary(tenantId) {
      return summarizeIncidents(this.listIncidents(tenantId));
    }
  };
}

function createPostgresObservabilityRepository(store) {
  async function rows(sql, params) {
    return (await store.query(sql, params)).rows;
  }

  return {
    async listMonitors(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id=$1';
      if (filters.serviceName) { params.push(filters.serviceName); where += ` AND service_name=$${params.length}`; }
      if (filters.status) { params.push(filters.status); where += ` AND status=$${params.length}`; }
      return rows(`SELECT id::text, tenant_id as "tenantId", code, name, service_name as "serviceName", monitor_type as "monitorType", status, target, check_interval_seconds as "checkIntervalSeconds", timeout_seconds as "timeoutSeconds", owner_team as "ownerTeam", escalation_policy as "escalationPolicy", metadata, created_at as "createdAt", updated_at as "updatedAt" FROM service_monitors ${where} ORDER BY name`, params);
    },
    async createMonitor(tenantId, input) {
      const x = normalizeServiceMonitorInput(input);
      return (await rows(`INSERT INTO service_monitors (tenant_id, code, name, service_name, monitor_type, status, target, check_interval_seconds, timeout_seconds, owner_team, escalation_policy, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb) RETURNING id::text, tenant_id as "tenantId", code, name, service_name as "serviceName", monitor_type as "monitorType", status, target, check_interval_seconds as "checkIntervalSeconds", timeout_seconds as "timeoutSeconds", owner_team as "ownerTeam", escalation_policy as "escalationPolicy", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.code, x.name, x.serviceName, x.monitorType, x.status, x.target, x.checkIntervalSeconds, x.timeoutSeconds, x.ownerTeam, x.escalationPolicy, JSON.stringify(x.metadata || {})]))[0];
    },
    async listSlos(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id=$1';
      if (filters.serviceName) { params.push(filters.serviceName); where += ` AND service_name=$${params.length}`; }
      return rows(`SELECT id::text, tenant_id as "tenantId", code, service_name as "serviceName", name, description, target_percent::float as "targetPercent", window, measurement_type as "measurementType", active, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM service_slos ${where} ORDER BY name`, params);
    },
    async createSlo(tenantId, input) {
      const x = normalizeSloInput(input);
      return (await rows(`INSERT INTO service_slos (tenant_id, code, service_name, name, description, target_percent, window, measurement_type, active, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb) RETURNING id::text, tenant_id as "tenantId", code, service_name as "serviceName", name, description, target_percent::float as "targetPercent", window, measurement_type as "measurementType", active, metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.code, x.serviceName, x.name, x.description, x.targetPercent, x.window, x.measurementType, x.active, JSON.stringify(x.metadata || {})]))[0];
    },
    async evaluateSlo(tenantId, input = {}) {
      const slo = (await rows(`SELECT id::text, tenant_id as "tenantId", code, service_name as "serviceName", name, description, target_percent::float as "targetPercent", window, measurement_type as "measurementType", active, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM service_slos WHERE tenant_id=$1 AND id=$2 LIMIT 1`, [tenantId, input.sloId]))[0];
      return slo ? evaluateSlo(slo, input.measurements || []) : null;
    },
    async listAlerts() { return []; },
    async createAlert(tenantId, input) { return { id: 'postgres-alert-placeholder', tenantId, ...normalizeAlertEventInput(input) }; },
    async acknowledgeAlert() { return null; },
    async resolveAlert() { return null; },
    async listIncidents() { return []; },
    async createIncident(tenantId, input) { return { id: 'postgres-incident-placeholder', tenantId, ...normalizeIncidentInput(input) }; },
    async transitionIncident() { return null; },
    async addTimelineEvent(tenantId, input) { return { id: 'postgres-timeline-placeholder', tenantId, ...normalizeIncidentTimelineInput(input) }; },
    async listTimeline() { return []; },
    async summary() { return summarizeIncidents([]); }
  };
}

module.exports = { createObservabilityRepository };
