const { makeId, now } = require('../services/id');
const svc = require('../services/operationalRiskService');

function createOperationalRiskRepository(store) {
  if (store.type === 'json') return createJsonOperationalRiskRepository(store);
  if (store.type === 'postgres') return createPostgresOperationalRiskRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureRisk(data) {
  data.operationalRisks ||= [];
  data.riskMitigationPlans ||= [];
  data.riskKris ||= [];
  data.riskReviews ||= [];
  data.riskAcceptances ||= [];
  return data;
}

function createJsonOperationalRiskRepository(store) {
  return {
    listRisks(filters = {}) {
      return ensureRisk(store.read()).operationalRisks
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.category || x.category === filters.category)
        .filter(x => !filters.residualLevel || x.residualLevel === filters.residualLevel)
        .sort((a, b) => String(b.identifiedAt).localeCompare(String(a.identifiedAt)));
    },
    createRisk(input) {
      const data = ensureRisk(store.read());
      const row = { id: makeId('risk'), ...svc.normalizeRiskInput(input), createdAt: now(), updatedAt: now() };
      row.riskNumber = row.riskNumber || `RISK-${String(data.operationalRisks.length + 1).padStart(6, '0')}`;
      data.operationalRisks.push(row);
      store.write(data);
      return row;
    },
    closeRisk(id) {
      const data = ensureRisk(store.read());
      const idx = data.operationalRisks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.operationalRisks[idx] = svc.closeRisk(data.operationalRisks[idx]);
      store.write(data);
      return data.operationalRisks[idx];
    },
    createMitigationPlan(input) {
      const data = ensureRisk(store.read());
      const row = { id: makeId('mitplan'), ...svc.normalizeMitigationPlanInput(input), createdAt: now(), updatedAt: now() };
      data.riskMitigationPlans.push(row);
      store.write(data);
      return row;
    },
    listMitigationPlans(riskId) {
      return ensureRisk(store.read()).riskMitigationPlans.filter(x => x.riskId === riskId);
    },
    completeMitigationPlan(id) {
      const data = ensureRisk(store.read());
      const idx = data.riskMitigationPlans.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.riskMitigationPlans[idx] = svc.completeMitigationPlan(data.riskMitigationPlans[idx]);
      const riskIdx = data.operationalRisks.findIndex(x => x.id === data.riskMitigationPlans[idx].riskId);
      if (riskIdx !== -1) data.operationalRisks[riskIdx] = svc.applyMitigationToRisk(data.operationalRisks[riskIdx], data.riskMitigationPlans[idx]);
      store.write(data);
      return data.riskMitigationPlans[idx];
    },
    createKri(input) {
      const data = ensureRisk(store.read());
      const evaluated = svc.evaluateKri(svc.normalizeKriInput(input));
      const row = { id: makeId('kri'), ...evaluated, createdAt: now(), updatedAt: now() };
      data.riskKris.push(row);
      store.write(data);
      return row;
    },
    listKris(riskId) {
      return ensureRisk(store.read()).riskKris.filter(x => x.riskId === riskId);
    },
    updateKriValue(id, currentValue) {
      const data = ensureRisk(store.read());
      const idx = data.riskKris.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.riskKris[idx] = { ...svc.evaluateKri({ ...data.riskKris[idx], currentValue: Number(currentValue), observedAt: now() }), updatedAt: now() };
      store.write(data);
      return data.riskKris[idx];
    },
    createReview(input) {
      const data = ensureRisk(store.read());
      const row = { id: makeId('riskrev'), ...svc.normalizeReviewInput(input), createdAt: now(), updatedAt: now() };
      data.riskReviews.push(row);
      store.write(data);
      return row;
    },
    listReviews(riskId) {
      return ensureRisk(store.read()).riskReviews.filter(x => x.riskId === riskId).sort((a, b) => String(b.scheduledAt).localeCompare(String(a.scheduledAt)));
    },
    completeReview(id, notes = '') {
      const data = ensureRisk(store.read());
      const idx = data.riskReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.riskReviews[idx] = svc.completeReview(data.riskReviews[idx], notes);
      const riskIdx = data.operationalRisks.findIndex(x => x.id === data.riskReviews[idx].riskId);
      if (riskIdx !== -1) data.operationalRisks[riskIdx] = svc.applyReviewToRisk(data.operationalRisks[riskIdx], data.riskReviews[idx]);
      store.write(data);
      return data.riskReviews[idx];
    },
    createAcceptance(input) {
      const data = ensureRisk(store.read());
      const row = { id: makeId('riskacc'), ...svc.normalizeAcceptanceInput(input), createdAt: now(), updatedAt: now() };
      data.riskAcceptances.push(row);
      store.write(data);
      return row;
    },
    approveAcceptance(id, approvedBy) {
      const data = ensureRisk(store.read());
      const idx = data.riskAcceptances.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.riskAcceptances[idx] = svc.approveAcceptance(data.riskAcceptances[idx], approvedBy);
      const riskIdx = data.operationalRisks.findIndex(x => x.id === data.riskAcceptances[idx].riskId);
      if (riskIdx !== -1) data.operationalRisks[riskIdx] = { ...data.operationalRisks[riskIdx], status: 'accepted', updatedAt: now() };
      store.write(data);
      return data.riskAcceptances[idx];
    },
    rejectAcceptance(id, approvedBy) {
      const data = ensureRisk(store.read());
      const idx = data.riskAcceptances.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.riskAcceptances[idx] = svc.rejectAcceptance(data.riskAcceptances[idx], approvedBy);
      store.write(data);
      return data.riskAcceptances[idx];
    },
    metrics(tenantId) {
      const data = ensureRisk(store.read());
      return svc.riskMetrics(
        data.operationalRisks.filter(x => !tenantId || x.tenantId === tenantId),
        data.riskKris.filter(x => !tenantId || x.tenantId === tenantId)
      );
    }
  };
}

function createPostgresOperationalRiskRepository() {
  return {
    async listRisks() { return []; },
    async createRisk(input) { return { id: 'postgres-risk-placeholder', ...svc.normalizeRiskInput(input) }; },
    async closeRisk() { return null; },
    async createMitigationPlan(input) { return { id: 'postgres-mitigation-placeholder', ...svc.normalizeMitigationPlanInput(input) }; },
    async listMitigationPlans() { return []; },
    async completeMitigationPlan() { return null; },
    async createKri(input) { return { id: 'postgres-kri-placeholder', ...svc.normalizeKriInput(input) }; },
    async listKris() { return []; },
    async updateKriValue() { return null; },
    async createReview(input) { return { id: 'postgres-review-placeholder', ...svc.normalizeReviewInput(input) }; },
    async listReviews() { return []; },
    async completeReview() { return null; },
    async createAcceptance(input) { return { id: 'postgres-acceptance-placeholder', ...svc.normalizeAcceptanceInput(input) }; },
    async approveAcceptance() { return null; },
    async rejectAcceptance() { return null; },
    async metrics() { return svc.riskMetrics([], []); }
  };
}

module.exports = { createOperationalRiskRepository };
