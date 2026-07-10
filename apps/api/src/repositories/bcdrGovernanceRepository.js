const { makeId, now } = require('../services/id');
const svc = require('../services/bcdrGovernanceService');

function createBcdrGovernanceRepository(store) {
  if (store.type === 'json') return createJsonBcdrGovernanceRepository(store);
  if (store.type === 'postgres') return createPostgresBcdrGovernanceRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureBcdr(data) {
  data.bcdrBias ||= [];
  data.bcdrPlans ||= [];
  data.bcdrApprovals ||= [];
  data.bcdrExercises ||= [];
  data.bcdrEvidence ||= [];
  data.bcdrGaps ||= [];
  return data;
}

function createJsonBcdrGovernanceRepository(store) {
  return {
    listBias(filters = {}) {
      return ensureBcdr(store.read()).bcdrBias
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.criticality || x.criticality === filters.criticality)
        .sort((a, b) => String(a.processName).localeCompare(String(b.processName)));
    },
    createBia(input) {
      const data = ensureBcdr(store.read());
      const row = { id: makeId('bia'), ...svc.normalizeBiaInput(input), createdAt: now(), updatedAt: now() };
      data.bcdrBias.push(row);
      store.write(data);
      return row;
    },
    submitBia(id) {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrBias.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrBias[idx] = svc.submitBia(data.bcdrBias[idx]);
      store.write(data);
      return data.bcdrBias[idx];
    },
    approveBia(id) {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrBias.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrBias[idx] = svc.approveBia(data.bcdrBias[idx]);
      store.write(data);
      return data.bcdrBias[idx];
    },
    createPlan(input) {
      const data = ensureBcdr(store.read());
      const row = { id: makeId('bcplan'), ...svc.normalizePlanInput(input), createdAt: now(), updatedAt: now() };
      data.bcdrPlans.push(row);
      store.write(data);
      return row;
    },
    listPlans(filters = {}) {
      return ensureBcdr(store.read()).bcdrPlans
        .filter(x => !filters.biaId || x.biaId === filters.biaId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    },
    submitPlan(id) {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrPlans.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrPlans[idx] = svc.submitPlan(data.bcdrPlans[idx]);
      store.write(data);
      return data.bcdrPlans[idx];
    },
    approvePlan(id) {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrPlans.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrPlans[idx] = svc.approvePlan(data.bcdrPlans[idx]);
      store.write(data);
      return data.bcdrPlans[idx];
    },
    activatePlan(id) {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrPlans.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrPlans[idx] = svc.activatePlan(data.bcdrPlans[idx]);
      store.write(data);
      return data.bcdrPlans[idx];
    },
    createApproval(input) {
      const data = ensureBcdr(store.read());
      const row = { id: makeId('bcapp'), ...svc.normalizeApprovalInput(input), createdAt: now(), updatedAt: now() };
      data.bcdrApprovals.push(row);
      store.write(data);
      return row;
    },
    approveGate(id, comments = '') {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrApprovals[idx] = svc.approveGate(data.bcdrApprovals[idx], comments);
      store.write(data);
      return data.bcdrApprovals[idx];
    },
    rejectGate(id, comments = '') {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrApprovals[idx] = svc.rejectGate(data.bcdrApprovals[idx], comments);
      store.write(data);
      return data.bcdrApprovals[idx];
    },
    createExercise(input) {
      const data = ensureBcdr(store.read());
      const row = { id: makeId('bcex'), ...svc.normalizeExerciseInput(input), createdAt: now(), updatedAt: now() };
      data.bcdrExercises.push(row);
      store.write(data);
      return row;
    },
    startExercise(id) {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrExercises.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrExercises[idx] = svc.startExercise(data.bcdrExercises[idx]);
      store.write(data);
      return data.bcdrExercises[idx];
    },
    completeExercise(id, achievedRtoHours, achievedRpoHours, summary = '') {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrExercises.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrExercises[idx] = svc.completeExercise(data.bcdrExercises[idx], achievedRtoHours, achievedRpoHours, summary);
      const pidx = data.bcdrPlans.findIndex(x => x.id === data.bcdrExercises[idx].planId);
      if (pidx !== -1) data.bcdrPlans[pidx] = svc.applyExerciseToPlan(data.bcdrPlans[pidx], data.bcdrExercises[idx]);
      store.write(data);
      return data.bcdrExercises[idx];
    },
    createEvidence(input) {
      const data = ensureBcdr(store.read());
      const row = { id: makeId('bcevid'), ...svc.normalizeEvidenceInput(input), createdAt: now(), updatedAt: now() };
      data.bcdrEvidence.push(row);
      store.write(data);
      return row;
    },
    listEvidence(exerciseId) {
      return ensureBcdr(store.read()).bcdrEvidence.filter(x => x.exerciseId === exerciseId);
    },
    createGap(input) {
      const data = ensureBcdr(store.read());
      const row = { id: makeId('bcgap'), ...svc.normalizeGapInput(input), createdAt: now(), updatedAt: now() };
      data.bcdrGaps.push(row);
      store.write(data);
      return row;
    },
    completeGap(id) {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrGaps.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrGaps[idx] = svc.completeGap(data.bcdrGaps[idx]);
      store.write(data);
      return data.bcdrGaps[idx];
    },
    acceptGapRisk(id, reason) {
      const data = ensureBcdr(store.read());
      const idx = data.bcdrGaps.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.bcdrGaps[idx] = svc.acceptGapRisk(data.bcdrGaps[idx], reason);
      store.write(data);
      return data.bcdrGaps[idx];
    },
    metrics(tenantId) {
      const data = ensureBcdr(store.read());
      return svc.bcdrMetrics({
        bias: data.bcdrBias.filter(x => !tenantId || x.tenantId === tenantId),
        plans: data.bcdrPlans.filter(x => !tenantId || x.tenantId === tenantId),
        approvals: data.bcdrApprovals.filter(x => !tenantId || x.tenantId === tenantId),
        exercises: data.bcdrExercises.filter(x => !tenantId || x.tenantId === tenantId),
        gaps: data.bcdrGaps.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresBcdrGovernanceRepository() {
  return {
    async listBias() { return []; },
    async createBia(input) { return { id: 'postgres-bia-placeholder', ...svc.normalizeBiaInput(input) }; },
    async submitBia() { return null; },
    async approveBia() { return null; },
    async createPlan(input) { return { id: 'postgres-plan-placeholder', ...svc.normalizePlanInput(input) }; },
    async listPlans() { return []; },
    async submitPlan() { return null; },
    async approvePlan() { return null; },
    async activatePlan() { return null; },
    async createApproval(input) { return { id: 'postgres-approval-placeholder', ...svc.normalizeApprovalInput(input) }; },
    async approveGate() { return null; },
    async rejectGate() { return null; },
    async createExercise(input) { return { id: 'postgres-exercise-placeholder', ...svc.normalizeExerciseInput(input) }; },
    async startExercise() { return null; },
    async completeExercise() { return null; },
    async createEvidence(input) { return { id: 'postgres-evidence-placeholder', ...svc.normalizeEvidenceInput(input) }; },
    async listEvidence() { return []; },
    async createGap(input) { return { id: 'postgres-gap-placeholder', ...svc.normalizeGapInput(input) }; },
    async completeGap() { return null; },
    async acceptGapRisk() { return null; },
    async metrics() { return svc.bcdrMetrics({}); }
  };
}

module.exports = { createBcdrGovernanceRepository };
