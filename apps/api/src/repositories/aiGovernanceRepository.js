const { makeId, now } = require('../services/id');
const svc = require('../services/aiGovernanceService');

function createAiGovernanceRepository(store) {
  if (store.type === 'json') return createJsonAiGovernanceRepository(store);
  if (store.type === 'postgres') return createPostgresAiGovernanceRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureAi(data) {
  data.aiSystems ||= [];
  data.aiAssessments ||= [];
  data.aiApprovals ||= [];
  data.aiMonitoringSignals ||= [];
  data.aiIncidents ||= [];
  return data;
}

function createJsonAiGovernanceRepository(store) {
  return {
    listSystems(filters = {}) {
      return ensureAi(store.read()).aiSystems
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.riskTier || x.riskTier === filters.riskTier)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createSystem(input) {
      const data = ensureAi(store.read());
      const normalized = svc.normalizeSystemInput({ ...input, riskTier: input.riskTier || svc.deriveRiskTier(input) });
      const row = { id: makeId('aisys'), ...normalized, createdAt: now(), updatedAt: now() };
      data.aiSystems.push(row);
      store.write(data);
      return row;
    },
    activateSystem(id) {
      const data = ensureAi(store.read());
      const idx = data.aiSystems.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiSystems[idx] = svc.activateSystem(data.aiSystems[idx]);
      store.write(data);
      return data.aiSystems[idx];
    },
    pauseSystem(id) {
      const data = ensureAi(store.read());
      const idx = data.aiSystems.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiSystems[idx] = svc.pauseSystem(data.aiSystems[idx]);
      store.write(data);
      return data.aiSystems[idx];
    },
    reviewSystem(id) {
      const data = ensureAi(store.read());
      const idx = data.aiSystems.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiSystems[idx] = svc.reviewSystem(data.aiSystems[idx]);
      store.write(data);
      return data.aiSystems[idx];
    },
    createAssessment(input) {
      const data = ensureAi(store.read());
      const system = data.aiSystems.find(x => x.id === input.aiSystemId);
      const row = { id: makeId('aiassess'), ...svc.normalizeAssessmentInput({ ...input, inherentRisk: input.inherentRisk || (system && system.riskTier) || 'limited' }), createdAt: now(), updatedAt: now() };
      data.aiAssessments.push(row);
      store.write(data);
      return row;
    },
    listAssessments(filters = {}) {
      return ensureAi(store.read()).aiAssessments
        .filter(x => !filters.aiSystemId || x.aiSystemId === filters.aiSystemId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
    },
    submitAssessment(id, assessor) {
      const data = ensureAi(store.read());
      const idx = data.aiAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiAssessments[idx] = svc.submitAssessment(data.aiAssessments[idx], assessor);
      store.write(data);
      return data.aiAssessments[idx];
    },
    approveAssessment(id) {
      const data = ensureAi(store.read());
      const idx = data.aiAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiAssessments[idx] = svc.approveAssessment(data.aiAssessments[idx]);
      store.write(data);
      return data.aiAssessments[idx];
    },
    requireMitigation(id) {
      const data = ensureAi(store.read());
      const idx = data.aiAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiAssessments[idx] = svc.requireMitigation(data.aiAssessments[idx]);
      store.write(data);
      return data.aiAssessments[idx];
    },
    createApproval(input) {
      const data = ensureAi(store.read());
      const row = { id: makeId('aiapp'), ...svc.normalizeApprovalInput(input), createdAt: now(), updatedAt: now() };
      data.aiApprovals.push(row);
      store.write(data);
      return row;
    },
    approveGate(id, comments = '') {
      const data = ensureAi(store.read());
      const idx = data.aiApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiApprovals[idx] = svc.approveGate(data.aiApprovals[idx], comments);
      store.write(data);
      return data.aiApprovals[idx];
    },
    rejectGate(id, comments = '') {
      const data = ensureAi(store.read());
      const idx = data.aiApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiApprovals[idx] = svc.rejectGate(data.aiApprovals[idx], comments);
      store.write(data);
      return data.aiApprovals[idx];
    },
    createSignal(input) {
      const data = ensureAi(store.read());
      const row = { id: makeId('aisignal'), ...svc.evaluateSignal(svc.normalizeSignalInput(input)), createdAt: now(), updatedAt: now() };
      data.aiMonitoringSignals.push(row);
      store.write(data);
      return row;
    },
    listSignals(aiSystemId) {
      return ensureAi(store.read()).aiMonitoringSignals.filter(x => x.aiSystemId === aiSystemId).sort((a, b) => String(b.observedAt).localeCompare(String(a.observedAt)));
    },
    createIncident(input) {
      const data = ensureAi(store.read());
      const row = { id: makeId('aiinc'), ...svc.normalizeIncidentInput(input), createdAt: now(), updatedAt: now() };
      data.aiIncidents.push(row);
      store.write(data);
      return row;
    },
    listIncidents(filters = {}) {
      return ensureAi(store.read()).aiIncidents
        .filter(x => !filters.aiSystemId || x.aiSystemId === filters.aiSystemId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity);
    },
    mitigateIncident(id) {
      const data = ensureAi(store.read());
      const idx = data.aiIncidents.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiIncidents[idx] = svc.mitigateIncident(data.aiIncidents[idx]);
      store.write(data);
      return data.aiIncidents[idx];
    },
    closeIncident(id) {
      const data = ensureAi(store.read());
      const idx = data.aiIncidents.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.aiIncidents[idx] = svc.closeIncident(data.aiIncidents[idx]);
      store.write(data);
      return data.aiIncidents[idx];
    },
    metrics(tenantId) {
      const data = ensureAi(store.read());
      return svc.aiGovernanceMetrics({
        systems: data.aiSystems.filter(x => !tenantId || x.tenantId === tenantId),
        assessments: data.aiAssessments.filter(x => !tenantId || x.tenantId === tenantId),
        approvals: data.aiApprovals.filter(x => !tenantId || x.tenantId === tenantId),
        signals: data.aiMonitoringSignals.filter(x => !tenantId || x.tenantId === tenantId),
        incidents: data.aiIncidents.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresAiGovernanceRepository() {
  return {
    async listSystems() { return []; },
    async createSystem(input) { return { id: 'postgres-ai-system-placeholder', ...svc.normalizeSystemInput(input) }; },
    async activateSystem() { return null; },
    async pauseSystem() { return null; },
    async reviewSystem() { return null; },
    async createAssessment(input) { return { id: 'postgres-ai-assessment-placeholder', ...svc.normalizeAssessmentInput(input) }; },
    async listAssessments() { return []; },
    async submitAssessment() { return null; },
    async approveAssessment() { return null; },
    async requireMitigation() { return null; },
    async createApproval(input) { return { id: 'postgres-ai-approval-placeholder', ...svc.normalizeApprovalInput(input) }; },
    async approveGate() { return null; },
    async rejectGate() { return null; },
    async createSignal(input) { return { id: 'postgres-ai-signal-placeholder', ...svc.normalizeSignalInput(input) }; },
    async listSignals() { return []; },
    async createIncident(input) { return { id: 'postgres-ai-incident-placeholder', ...svc.normalizeIncidentInput(input) }; },
    async listIncidents() { return []; },
    async mitigateIncident() { return null; },
    async closeIncident() { return null; },
    async metrics() { return svc.aiGovernanceMetrics({}); }
  };
}

module.exports = { createAiGovernanceRepository };
