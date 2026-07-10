const { makeId, now } = require('../services/id');
const svc = require('../services/customerSuccessOnboardingService');

function createCustomerSuccessOnboardingRepository(store) {
  if (store.type === 'json') return createJsonCustomerSuccessOnboardingRepository(store);
  if (store.type === 'postgres') return createPostgresCustomerSuccessOnboardingRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureCs(data) {
  data.customerLaunchCohorts ||= [];
  data.customerOnboardingPlans ||= [];
  data.customerOnboardingTasks ||= [];
  data.customerAdoptionMetrics ||= [];
  data.customerFeedback ||= [];
  data.customerEscalations ||= [];
  data.customerSuccessPlans ||= [];
  return data;
}
function updateById(rows, id, fn) {
  const idx = rows.findIndex(x => x.id === id);
  if (idx === -1) return null;
  rows[idx] = fn(rows[idx]);
  return rows[idx];
}
function createJsonCustomerSuccessOnboardingRepository(store) {
  return {
    createCohort(input) { const data = ensureCs(store.read()); const row = { id: makeId('cohort'), ...svc.normalizeCohortInput(input), createdAt: now(), updatedAt: now() }; data.customerLaunchCohorts.push(row); store.write(data); return row; },
    activateCohort(id) { const data = ensureCs(store.read()); const row = updateById(data.customerLaunchCohorts, id, svc.activateCohort); store.write(data); return row; },
    completeCohort(id) { const data = ensureCs(store.read()); const row = updateById(data.customerLaunchCohorts, id, svc.completeCohort); store.write(data); return row; },
    createPlan(input) { const data = ensureCs(store.read()); const row = { id: makeId('onboard'), ...svc.normalizeOnboardingPlanInput(input), createdAt: now(), updatedAt: now() }; data.customerOnboardingPlans.push(row); store.write(data); return row; },
    startPlan(id) { const data = ensureCs(store.read()); const row = updateById(data.customerOnboardingPlans, id, svc.startPlan); store.write(data); return row; },
    completePlan(id) { const data = ensureCs(store.read()); const row = updateById(data.customerOnboardingPlans, id, svc.completePlan); store.write(data); return row; },
    blockPlan(id, blockerSummary) { const data = ensureCs(store.read()); const row = updateById(data.customerOnboardingPlans, id, x => svc.blockPlan(x, blockerSummary)); store.write(data); return row; },
    createTask(input) { const data = ensureCs(store.read()); const row = { id: makeId('onboardtask'), ...svc.normalizeTaskInput(input), createdAt: now(), updatedAt: now() }; data.customerOnboardingTasks.push(row); store.write(data); return row; },
    startTask(id) { const data = ensureCs(store.read()); const row = updateById(data.customerOnboardingTasks, id, svc.startTask); store.write(data); return row; },
    completeTask(id) { const data = ensureCs(store.read()); const row = updateById(data.customerOnboardingTasks, id, svc.completeTask); store.write(data); return row; },
    createMetric(input) { const data = ensureCs(store.read()); const row = { id: makeId('adopt'), ...svc.normalizeAdoptionMetricInput(input), createdAt: now(), updatedAt: now() }; data.customerAdoptionMetrics.push(row); store.write(data); return row; },
    createFeedback(input) { const data = ensureCs(store.read()); const row = { id: makeId('custfb'), ...svc.normalizeFeedbackInput(input), createdAt: now(), updatedAt: now() }; data.customerFeedback.push(row); store.write(data); return row; },
    reviewFeedback(id, reviewedBy) { const data = ensureCs(store.read()); const row = updateById(data.customerFeedback, id, x => svc.reviewFeedback(x, reviewedBy)); store.write(data); return row; },
    resolveFeedback(id, resolution) { const data = ensureCs(store.read()); const row = updateById(data.customerFeedback, id, x => svc.resolveFeedback(x, resolution)); store.write(data); return row; },
    createEscalation(input) { const data = ensureCs(store.read()); const row = { id: makeId('custesc'), ...svc.normalizeEscalationInput(input), createdAt: now(), updatedAt: now() }; data.customerEscalations.push(row); store.write(data); return row; },
    startEscalation(id, owner = '') { const data = ensureCs(store.read()); const row = updateById(data.customerEscalations, id, x => svc.startEscalation(x, owner)); store.write(data); return row; },
    resolveEscalation(id, resolution) { const data = ensureCs(store.read()); const row = updateById(data.customerEscalations, id, x => svc.resolveEscalation(x, resolution)); store.write(data); return row; },
    closeEscalation(id) { const data = ensureCs(store.read()); const row = updateById(data.customerEscalations, id, svc.closeEscalation); store.write(data); return row; },
    createSuccessPlan(input) { const data = ensureCs(store.read()); const row = { id: makeId('success'), ...svc.normalizeSuccessPlanInput(input), createdAt: now(), updatedAt: now() }; data.customerSuccessPlans.push(row); store.write(data); return row; },
    activateSuccessPlan(id) { const data = ensureCs(store.read()); const row = updateById(data.customerSuccessPlans, id, svc.activateSuccessPlan); store.write(data); return row; },
    markSuccessPlanAtRisk(id, risk) { const data = ensureCs(store.read()); const row = updateById(data.customerSuccessPlans, id, x => svc.markSuccessPlanAtRisk(x, risk)); store.write(data); return row; },
    metrics(tenantId) { const data = ensureCs(store.read()); return svc.customerSuccessMetrics({ cohorts: data.customerLaunchCohorts.filter(x => !tenantId || x.tenantId === tenantId), plans: data.customerOnboardingPlans.filter(x => !tenantId || x.tenantId === tenantId), tasks: data.customerOnboardingTasks.filter(x => !tenantId || x.tenantId === tenantId), metrics: data.customerAdoptionMetrics.filter(x => !tenantId || x.tenantId === tenantId), feedback: data.customerFeedback.filter(x => !tenantId || x.tenantId === tenantId), escalations: data.customerEscalations.filter(x => !tenantId || x.tenantId === tenantId), successPlans: data.customerSuccessPlans.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresCustomerSuccessOnboardingRepository() {
  return {
    async createCohort(input) { return { id: 'postgres-cohort-placeholder', ...svc.normalizeCohortInput(input) }; }, async activateCohort() { return null; }, async completeCohort() { return null; },
    async createPlan(input) { return { id: 'postgres-plan-placeholder', ...svc.normalizeOnboardingPlanInput(input) }; }, async startPlan() { return null; }, async completePlan() { return null; }, async blockPlan() { return null; },
    async createTask(input) { return { id: 'postgres-task-placeholder', ...svc.normalizeTaskInput(input) }; }, async startTask() { return null; }, async completeTask() { return null; },
    async createMetric(input) { return { id: 'postgres-metric-placeholder', ...svc.normalizeAdoptionMetricInput(input) }; },
    async createFeedback(input) { return { id: 'postgres-feedback-placeholder', ...svc.normalizeFeedbackInput(input) }; }, async reviewFeedback() { return null; }, async resolveFeedback() { return null; },
    async createEscalation(input) { return { id: 'postgres-escalation-placeholder', ...svc.normalizeEscalationInput(input) }; }, async startEscalation() { return null; }, async resolveEscalation() { return null; }, async closeEscalation() { return null; },
    async createSuccessPlan(input) { return { id: 'postgres-success-placeholder', ...svc.normalizeSuccessPlanInput(input) }; }, async activateSuccessPlan() { return null; }, async markSuccessPlanAtRisk() { return null; },
    async metrics() { return svc.customerSuccessMetrics({}); }
  };
}
module.exports = { createCustomerSuccessOnboardingRepository };
