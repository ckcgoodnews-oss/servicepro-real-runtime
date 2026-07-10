const { makeId, now } = require('../services/id');
const svc = require('../services/processingInventoryService');

function createProcessingInventoryRepository(store) {
  if (store.type === 'json') return createJsonProcessingInventoryRepository(store);
  if (store.type === 'postgres') return createPostgresProcessingInventoryRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureInventory(data) {
  data.processingActivities ||= [];
  data.processingDataCategories ||= [];
  data.processingSystemMappings ||= [];
  data.dpiaAssessments ||= [];
  data.dpiaDecisions ||= [];
  data.dpiaRemediationTasks ||= [];
  return data;
}

function createJsonProcessingInventoryRepository(store) {
  return {
    listActivities(filters = {}) {
      return ensureInventory(store.read()).processingActivities
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createActivity(input) {
      const data = ensureInventory(store.read());
      const row = { id: makeId('activity'), ...svc.normalizeActivityInput(input), createdAt: now(), updatedAt: now() };
      data.processingActivities.push(row);
      store.write(data);
      return row;
    },
    reviewActivity(id) {
      const data = ensureInventory(store.read());
      const idx = data.processingActivities.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.processingActivities[idx] = svc.reviewActivity(data.processingActivities[idx]);
      store.write(data);
      return data.processingActivities[idx];
    },
    createDataCategory(input) {
      const data = ensureInventory(store.read());
      const row = { id: makeId('datacat'), ...svc.normalizeDataCategoryInput(input), createdAt: now(), updatedAt: now() };
      data.processingDataCategories.push(row);
      store.write(data);
      return row;
    },
    listDataCategories(activityId) {
      return ensureInventory(store.read()).processingDataCategories.filter(x => x.activityId === activityId);
    },
    createSystemMapping(input) {
      const data = ensureInventory(store.read());
      const row = { id: makeId('sysmap'), ...svc.normalizeSystemMappingInput(input), createdAt: now(), updatedAt: now() };
      data.processingSystemMappings.push(row);
      store.write(data);
      return row;
    },
    listSystemMappings(activityId) {
      return ensureInventory(store.read()).processingSystemMappings.filter(x => x.activityId === activityId);
    },
    createDpia(input) {
      const data = ensureInventory(store.read());
      const categories = data.processingDataCategories.filter(x => x.activityId === input.activityId);
      const mappings = data.processingSystemMappings.filter(x => x.activityId === input.activityId);
      const inferred = svc.deriveActivityRisk(categories, mappings);
      const row = {
        id: makeId('dpia'),
        ...svc.normalizeDpiaInput({ ...input, inherentRisk: input.inherentRisk || inferred, residualRisk: input.residualRisk || inferred }),
        createdAt: now(),
        updatedAt: now()
      };
      data.dpiaAssessments.push(row);
      store.write(data);
      return row;
    },
    listDpias(filters = {}) {
      return ensureInventory(store.read()).dpiaAssessments
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.activityId || x.activityId === filters.activityId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
    },
    submitDpia(id) {
      const data = ensureInventory(store.read());
      const idx = data.dpiaAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dpiaAssessments[idx] = svc.submitDpia(data.dpiaAssessments[idx]);
      store.write(data);
      return data.dpiaAssessments[idx];
    },
    decideDpia(input) {
      const data = ensureInventory(store.read());
      const decision = { id: makeId('dpiadec'), ...svc.normalizeDecisionInput(input), createdAt: now(), updatedAt: now() };
      data.dpiaDecisions.push(decision);
      const idx = data.dpiaAssessments.findIndex(x => x.id === decision.dpiaId);
      if (idx !== -1) {
        if (decision.decisionType === 'approve') data.dpiaAssessments[idx] = svc.approveDpia(data.dpiaAssessments[idx]);
        else if (decision.decisionType === 'approve_with_conditions' || decision.decisionType === 'mitigate') data.dpiaAssessments[idx] = svc.requireMitigation(data.dpiaAssessments[idx]);
        else if (decision.decisionType === 'reject') data.dpiaAssessments[idx] = svc.rejectDpia(data.dpiaAssessments[idx]);
      }
      store.write(data);
      return decision;
    },
    createTask(input) {
      const data = ensureInventory(store.read());
      const row = { id: makeId('dpiatask'), ...svc.normalizeTaskInput(input), createdAt: now(), updatedAt: now() };
      data.dpiaRemediationTasks.push(row);
      store.write(data);
      return row;
    },
    listTasks(filters = {}) {
      return ensureInventory(store.read()).dpiaRemediationTasks
        .filter(x => !filters.dpiaId || x.dpiaId === filters.dpiaId)
        .filter(x => !filters.status || x.status === filters.status);
    },
    completeTask(id) {
      const data = ensureInventory(store.read());
      const idx = data.dpiaRemediationTasks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dpiaRemediationTasks[idx] = svc.completeTask(data.dpiaRemediationTasks[idx]);
      store.write(data);
      return data.dpiaRemediationTasks[idx];
    },
    metrics(tenantId) {
      const data = ensureInventory(store.read());
      return svc.inventoryMetrics({
        activities: data.processingActivities.filter(x => !tenantId || x.tenantId === tenantId),
        categories: data.processingDataCategories.filter(x => !tenantId || x.tenantId === tenantId),
        mappings: data.processingSystemMappings.filter(x => !tenantId || x.tenantId === tenantId),
        dpias: data.dpiaAssessments.filter(x => !tenantId || x.tenantId === tenantId),
        tasks: data.dpiaRemediationTasks.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresProcessingInventoryRepository() {
  return {
    async listActivities() { return []; },
    async createActivity(input) { return { id: 'postgres-activity-placeholder', ...svc.normalizeActivityInput(input) }; },
    async reviewActivity() { return null; },
    async createDataCategory(input) { return { id: 'postgres-data-category-placeholder', ...svc.normalizeDataCategoryInput(input) }; },
    async listDataCategories() { return []; },
    async createSystemMapping(input) { return { id: 'postgres-system-mapping-placeholder', ...svc.normalizeSystemMappingInput(input) }; },
    async listSystemMappings() { return []; },
    async createDpia(input) { return { id: 'postgres-dpia-placeholder', ...svc.normalizeDpiaInput(input) }; },
    async listDpias() { return []; },
    async submitDpia() { return null; },
    async decideDpia(input) { return { id: 'postgres-decision-placeholder', ...svc.normalizeDecisionInput(input) }; },
    async createTask(input) { return { id: 'postgres-task-placeholder', ...svc.normalizeTaskInput(input) }; },
    async listTasks() { return []; },
    async completeTask() { return null; },
    async metrics() { return svc.inventoryMetrics({}); }
  };
}

module.exports = { createProcessingInventoryRepository };
