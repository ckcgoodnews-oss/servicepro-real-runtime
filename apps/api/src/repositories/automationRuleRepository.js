const { makeId, now } = require('../services/id');

function createAutomationRuleRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, filters = {}) {
      const d = data(); d.automationRules ||= [];
      let r = d.automationRules.filter(a => a.tenantId === tenantId);
      if (filters.trigger_type) r = r.filter(a => a.triggerType === filters.trigger_type);
      if (filters.is_active !== undefined) r = r.filter(a => a.isActive === filters.is_active);
      return r.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    findById(tenantId, id) {
      const d = data(); d.automationRules ||= [];
      return d.automationRules.find(a => a.tenantId === tenantId && a.id === id) || null;
    },

    create(tenantId, input) {
      const d = data(); d.automationRules ||= [];
      const rule = {
        id: makeId('arule'), tenantId, name: input.name || '',
        description: input.description || '',
        triggerType: input.trigger_type,
        triggerConfig: input.trigger_config || {},
        conditions: input.conditions || [],
        actions: input.actions || [],
        isActive: input.is_active !== false,
        executionCount: 0, lastExecutedAt: null,
        createdAt: now(), updatedAt: now()
      };
      d.automationRules.push(rule); save(d); return rule;
    },

    update(tenantId, id, input) {
      const d = data(); d.automationRules ||= [];
      const idx = d.automationRules.findIndex(a => a.tenantId === tenantId && a.id === id);
      if (idx === -1) return null;
      const rule = d.automationRules[idx];
      if (input.name !== undefined) rule.name = input.name;
      if (input.description !== undefined) rule.description = input.description;
      if (input.trigger_type !== undefined) rule.triggerType = input.trigger_type;
      if (input.trigger_config !== undefined) rule.triggerConfig = input.trigger_config;
      if (input.conditions !== undefined) rule.conditions = input.conditions;
      if (input.actions !== undefined) rule.actions = input.actions;
      if (input.is_active !== undefined) rule.isActive = !!input.is_active;
      rule.updatedAt = now(); save(d); return rule;
    },

    delete(tenantId, id) {
      const d = data(); d.automationRules ||= [];
      const idx = d.automationRules.findIndex(a => a.tenantId === tenantId && a.id === id);
      if (idx === -1) return null;
      d.automationRules.splice(idx, 1); save(d); return { deleted: true };
    },

    // Execute and log
    recordExecution(tenantId, ruleId, triggerData, conditionsMet, actionsExecuted, status) {
      const d = data(); d.automationExecutions ||= []; d.automationRules ||= [];
      const exec = {
        id: makeId('aexec'), tenantId, ruleId, triggerData, conditionsMet,
        actionsExecuted, status, executedAt: now()
      };
      d.automationExecutions.push(exec);
      const rule = d.automationRules.find(a => a.id === ruleId);
      if (rule) { rule.executionCount++; rule.lastExecutedAt = now(); }
      save(d); return exec;
    },

    listExecutions(tenantId, ruleId, limit = 50) {
      const d = data(); d.automationExecutions ||= [];
      return d.automationExecutions.filter(e => e.tenantId === tenantId && e.ruleId === ruleId)
        .sort((a, b) => (b.executedAt || '').localeCompare(a.executedAt || ''))
        .slice(0, limit);
    },

    // Find rules matching a trigger
    findByTrigger(tenantId, triggerType) {
      const d = data(); d.automationRules ||= [];
      return d.automationRules.filter(a => a.tenantId === tenantId && a.triggerType === triggerType && a.isActive);
    }
  };
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createAutomationRuleRepository };
