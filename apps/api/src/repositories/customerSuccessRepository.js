const { makeId, now } = require('../services/id');
const {
  normalizeAccountPlanInput,
  normalizeMilestoneInput,
  normalizeSuccessTaskInput,
  normalizeQbrInput,
  normalizeRenewalRiskInput,
  completeMilestone,
  completeTask,
  completeQbr,
  resolveRenewalRisk,
  calculateAdoptionScore,
  calculateRenewalRisk
} = require('../services/customerSuccessService');

function createCustomerSuccessRepository(store) {
  if (store.type === 'json') return createJsonCustomerSuccessRepository(store);
  if (store.type === 'postgres') return createPostgresCustomerSuccessRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureCustomerSuccess(data) {
  if (!data.customerSuccessAccountPlans) data.customerSuccessAccountPlans = [];
  if (!data.customerSuccessMilestones) data.customerSuccessMilestones = [];
  if (!data.customerSuccessTasks) data.customerSuccessTasks = [];
  if (!data.customerSuccessQbrs) data.customerSuccessQbrs = [];
  if (!data.customerSuccessRenewalRisks) data.customerSuccessRenewalRisks = [];
  return data;
}

function createJsonCustomerSuccessRepository(store) {
  return {
    listAccountPlans(filters = {}) {
      return ensureCustomerSuccess(store.read()).customerSuccessAccountPlans
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.accountName).localeCompare(String(b.accountName)));
    },
    createAccountPlan(input) {
      const data = ensureCustomerSuccess(store.read());
      const row = { id: makeId('csplan'), ...normalizeAccountPlanInput(input), createdAt: now(), updatedAt: now() };
      data.customerSuccessAccountPlans.push(row);
      store.write(data);
      return row;
    },
    listMilestones(accountPlanId) {
      return ensureCustomerSuccess(store.read()).customerSuccessMilestones
        .filter(x => x.accountPlanId === accountPlanId)
        .sort((a, b) => String(a.targetDate).localeCompare(String(b.targetDate)));
    },
    createMilestone(input) {
      const data = ensureCustomerSuccess(store.read());
      const row = { id: makeId('csmile'), ...normalizeMilestoneInput(input), createdAt: now(), updatedAt: now() };
      data.customerSuccessMilestones.push(row);
      store.write(data);
      return row;
    },
    completeMilestone(id) {
      const data = ensureCustomerSuccess(store.read());
      const idx = data.customerSuccessMilestones.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.customerSuccessMilestones[idx] = completeMilestone(data.customerSuccessMilestones[idx]);
      store.write(data);
      return data.customerSuccessMilestones[idx];
    },
    listTasks(filters = {}) {
      return ensureCustomerSuccess(store.read()).customerSuccessTasks
        .filter(x => !filters.accountPlanId || x.accountPlanId === filters.accountPlanId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
    },
    createTask(input) {
      const data = ensureCustomerSuccess(store.read());
      const row = { id: makeId('cstask'), ...normalizeSuccessTaskInput(input), createdAt: now(), updatedAt: now() };
      data.customerSuccessTasks.push(row);
      store.write(data);
      return row;
    },
    completeTask(id) {
      const data = ensureCustomerSuccess(store.read());
      const idx = data.customerSuccessTasks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.customerSuccessTasks[idx] = completeTask(data.customerSuccessTasks[idx]);
      store.write(data);
      return data.customerSuccessTasks[idx];
    },
    listQbrs(accountPlanId) {
      return ensureCustomerSuccess(store.read()).customerSuccessQbrs
        .filter(x => x.accountPlanId === accountPlanId)
        .sort((a, b) => String(b.scheduledAt).localeCompare(String(a.scheduledAt)));
    },
    createQbr(input) {
      const data = ensureCustomerSuccess(store.read());
      const row = { id: makeId('qbr'), ...normalizeQbrInput(input), createdAt: now(), updatedAt: now() };
      data.customerSuccessQbrs.push(row);
      store.write(data);
      return row;
    },
    completeQbr(id, outcomes = []) {
      const data = ensureCustomerSuccess(store.read());
      const idx = data.customerSuccessQbrs.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.customerSuccessQbrs[idx] = completeQbr(data.customerSuccessQbrs[idx], outcomes);
      store.write(data);
      return data.customerSuccessQbrs[idx];
    },
    listRenewalRisks(accountPlanId) {
      return ensureCustomerSuccess(store.read()).customerSuccessRenewalRisks
        .filter(x => x.accountPlanId === accountPlanId)
        .sort((a, b) => String(b.openedAt).localeCompare(String(a.openedAt)));
    },
    createRenewalRisk(input) {
      const data = ensureCustomerSuccess(store.read());
      const row = { id: makeId('csrisk'), ...normalizeRenewalRiskInput(input), createdAt: now(), updatedAt: now() };
      data.customerSuccessRenewalRisks.push(row);
      store.write(data);
      return row;
    },
    resolveRenewalRisk(id) {
      const data = ensureCustomerSuccess(store.read());
      const idx = data.customerSuccessRenewalRisks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.customerSuccessRenewalRisks[idx] = resolveRenewalRisk(data.customerSuccessRenewalRisks[idx]);
      store.write(data);
      return data.customerSuccessRenewalRisks[idx];
    },
    score(accountPlanId) {
      const data = ensureCustomerSuccess(store.read());
      const accountPlan = data.customerSuccessAccountPlans.find(x => x.id === accountPlanId);
      const milestones = data.customerSuccessMilestones.filter(x => x.accountPlanId === accountPlanId);
      const tasks = data.customerSuccessTasks.filter(x => x.accountPlanId === accountPlanId);
      const risks = data.customerSuccessRenewalRisks.filter(x => x.accountPlanId === accountPlanId);
      const adoption = calculateAdoptionScore({ milestones, tasks });
      const renewal = calculateRenewalRisk({ accountPlan, risks, adoptionScore: adoption.score });
      return { adoption, renewal };
    }
  };
}

function createPostgresCustomerSuccessRepository() {
  return {
    async listAccountPlans() { return []; },
    async createAccountPlan(input) { return { id: 'postgres-csplan-placeholder', ...normalizeAccountPlanInput(input) }; },
    async listMilestones() { return []; },
    async createMilestone(input) { return { id: 'postgres-csmile-placeholder', ...normalizeMilestoneInput(input) }; },
    async completeMilestone() { return null; },
    async listTasks() { return []; },
    async createTask(input) { return { id: 'postgres-cstask-placeholder', ...normalizeSuccessTaskInput(input) }; },
    async completeTask() { return null; },
    async listQbrs() { return []; },
    async createQbr(input) { return { id: 'postgres-qbr-placeholder', ...normalizeQbrInput(input) }; },
    async completeQbr() { return null; },
    async listRenewalRisks() { return []; },
    async createRenewalRisk(input) { return { id: 'postgres-csrisk-placeholder', ...normalizeRenewalRiskInput(input) }; },
    async resolveRenewalRisk() { return null; },
    async score() { return { adoption: calculateAdoptionScore({}), renewal: calculateRenewalRisk({}) }; }
  };
}

module.exports = { createCustomerSuccessRepository };
