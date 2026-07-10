const { makeId, now } = require('../services/id');
const svc = require('../services/privacyBreachService');

function createPrivacyBreachRepository(store) {
  if (store.type === 'json') return createJsonPrivacyBreachRepository(store);
  if (store.type === 'postgres') return createPostgresPrivacyBreachRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureBreach(data) {
  data.privacyBreachIncidents ||= [];
  data.privacyBreachAssessments ||= [];
  data.privacyBreachObligations ||= [];
  data.privacyBreachNotices ||= [];
  data.privacyBreachEvidence ||= [];
  return data;
}

function createJsonPrivacyBreachRepository(store) {
  return {
    listIncidents(filters = {}) {
      return ensureBreach(store.read()).privacyBreachIncidents
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity)
        .sort((a, b) => String(b.reportedAt).localeCompare(String(a.reportedAt)));
    },
    createIncident(input) {
      const data = ensureBreach(store.read());
      const row = { id: makeId('pbinc'), ...svc.normalizeIncidentInput(input), createdAt: now(), updatedAt: now() };
      row.incidentNumber = row.incidentNumber || `PB-${String(data.privacyBreachIncidents.length + 1).padStart(6, '0')}`;
      data.privacyBreachIncidents.push(row);
      store.write(data);
      return row;
    },
    transitionIncident(id, status) {
      const data = ensureBreach(store.read());
      const idx = data.privacyBreachIncidents.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyBreachIncidents[idx] = svc.transitionIncident(data.privacyBreachIncidents[idx], status);
      store.write(data);
      return data.privacyBreachIncidents[idx];
    },
    createAssessment(input) {
      const data = ensureBreach(store.read());
      const incident = data.privacyBreachIncidents.find(x => x.id === input.incidentId);
      const normalized = svc.normalizeAssessmentInput({
        ...input,
        riskOfHarm: input.riskOfHarm || (incident ? svc.assessBreachRisk(incident) : 'unknown'),
        decision: input.decision || (incident ? svc.recommendDecision(incident, input) : 'escalate_to_counsel')
      });
      const row = { id: makeId('pbassess'), ...normalized, createdAt: now(), updatedAt: now() };
      data.privacyBreachAssessments.push(row);
      store.write(data);
      return row;
    },
    listAssessments(incidentId) {
      return ensureBreach(store.read()).privacyBreachAssessments.filter(x => x.incidentId === incidentId);
    },
    submitAssessment(id, assessor) {
      const data = ensureBreach(store.read());
      const idx = data.privacyBreachAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyBreachAssessments[idx] = svc.submitAssessment(data.privacyBreachAssessments[idx], assessor);
      store.write(data);
      return data.privacyBreachAssessments[idx];
    },
    approveAssessment(id) {
      const data = ensureBreach(store.read());
      const idx = data.privacyBreachAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyBreachAssessments[idx] = svc.approveAssessment(data.privacyBreachAssessments[idx]);
      store.write(data);
      return data.privacyBreachAssessments[idx];
    },
    createObligation(input) {
      const data = ensureBreach(store.read());
      const incident = data.privacyBreachIncidents.find(x => x.id === input.incidentId);
      let dueAt = input.dueAt || '';
      if (!dueAt && incident && input.noticeType === 'regulator') dueAt = svc.regulatorDueAt(incident.discoveredAt);
      if (!dueAt && incident && ['customer', 'data_subject'].includes(input.noticeType)) dueAt = svc.subjectNoticeDueAt(incident.discoveredAt);
      const row = { id: makeId('pbobl'), ...svc.normalizeObligationInput({ ...input, dueAt }), createdAt: now(), updatedAt: now() };
      data.privacyBreachObligations.push(row);
      store.write(data);
      return row;
    },
    listObligations(filters = {}) {
      return ensureBreach(store.read()).privacyBreachObligations
        .filter(x => !filters.incidentId || x.incidentId === filters.incidentId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.noticeType || x.noticeType === filters.noticeType);
    },
    completeObligation(id) {
      const data = ensureBreach(store.read());
      const idx = data.privacyBreachObligations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyBreachObligations[idx] = svc.completeObligation(data.privacyBreachObligations[idx]);
      store.write(data);
      return data.privacyBreachObligations[idx];
    },
    waiveObligation(id, reason) {
      const data = ensureBreach(store.read());
      const idx = data.privacyBreachObligations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyBreachObligations[idx] = svc.waiveObligation(data.privacyBreachObligations[idx], reason);
      store.write(data);
      return data.privacyBreachObligations[idx];
    },
    markOverdue(asOf = new Date().toISOString()) {
      const data = ensureBreach(store.read());
      data.privacyBreachObligations = data.privacyBreachObligations.map(x => svc.markObligationOverdue(x, asOf));
      store.write(data);
      return data.privacyBreachObligations.filter(x => x.status === 'overdue');
    },
    createNotice(input) {
      const data = ensureBreach(store.read());
      const row = { id: makeId('pbnotice'), ...svc.normalizeNoticeInput(input), createdAt: now(), updatedAt: now() };
      data.privacyBreachNotices.push(row);
      store.write(data);
      return row;
    },
    approveNotice(id, approvedBy) {
      const data = ensureBreach(store.read());
      const idx = data.privacyBreachNotices.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyBreachNotices[idx] = svc.approveNotice(data.privacyBreachNotices[idx], approvedBy);
      store.write(data);
      return data.privacyBreachNotices[idx];
    },
    sendNotice(id) {
      const data = ensureBreach(store.read());
      const idx = data.privacyBreachNotices.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyBreachNotices[idx] = svc.sendNotice(data.privacyBreachNotices[idx]);
      const oblIdx = data.privacyBreachObligations.findIndex(x => x.id === data.privacyBreachNotices[idx].obligationId);
      if (oblIdx !== -1) data.privacyBreachObligations[oblIdx] = svc.completeObligation(data.privacyBreachObligations[oblIdx]);
      store.write(data);
      return data.privacyBreachNotices[idx];
    },
    failNotice(id, reason = '') {
      const data = ensureBreach(store.read());
      const idx = data.privacyBreachNotices.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.privacyBreachNotices[idx] = svc.failNotice(data.privacyBreachNotices[idx], reason);
      store.write(data);
      return data.privacyBreachNotices[idx];
    },
    createEvidence(input) {
      const data = ensureBreach(store.read());
      const row = { id: makeId('pbevid'), ...svc.normalizeEvidenceInput(input), createdAt: now(), updatedAt: now() };
      data.privacyBreachEvidence.push(row);
      store.write(data);
      return row;
    },
    listEvidence(incidentId) {
      return ensureBreach(store.read()).privacyBreachEvidence.filter(x => x.incidentId === incidentId);
    },
    metrics(tenantId) {
      const data = ensureBreach(store.read());
      return svc.breachMetrics({
        incidents: data.privacyBreachIncidents.filter(x => !tenantId || x.tenantId === tenantId),
        assessments: data.privacyBreachAssessments.filter(x => !tenantId || x.tenantId === tenantId),
        obligations: data.privacyBreachObligations.filter(x => !tenantId || x.tenantId === tenantId),
        notices: data.privacyBreachNotices.filter(x => !tenantId || x.tenantId === tenantId),
        evidence: data.privacyBreachEvidence.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresPrivacyBreachRepository() {
  return {
    async listIncidents() { return []; },
    async createIncident(input) { return { id: 'postgres-breach-incident-placeholder', ...svc.normalizeIncidentInput(input) }; },
    async transitionIncident() { return null; },
    async createAssessment(input) { return { id: 'postgres-assessment-placeholder', ...svc.normalizeAssessmentInput(input) }; },
    async listAssessments() { return []; },
    async submitAssessment() { return null; },
    async approveAssessment() { return null; },
    async createObligation(input) { return { id: 'postgres-obligation-placeholder', ...svc.normalizeObligationInput(input) }; },
    async listObligations() { return []; },
    async completeObligation() { return null; },
    async waiveObligation() { return null; },
    async markOverdue() { return []; },
    async createNotice(input) { return { id: 'postgres-notice-placeholder', ...svc.normalizeNoticeInput(input) }; },
    async approveNotice() { return null; },
    async sendNotice() { return null; },
    async failNotice() { return null; },
    async createEvidence(input) { return { id: 'postgres-evidence-placeholder', ...svc.normalizeEvidenceInput(input) }; },
    async listEvidence() { return []; },
    async metrics() { return svc.breachMetrics({}); }
  };
}

module.exports = { createPrivacyBreachRepository };
