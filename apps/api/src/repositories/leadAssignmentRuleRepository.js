const { makeId, now } = require('../services/id');

function createLeadAssignmentRuleRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId) {
      const d = data();
      d.leadAssignmentRules ||= [];
      return d.leadAssignmentRules.filter(r => r.tenantId === tenantId)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    },

    getActive(tenantId) {
      const d = data();
      d.leadAssignmentRules ||= [];
      return d.leadAssignmentRules.filter(r => r.tenantId === tenantId && r.isActive)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    },

    findById(tenantId, id) {
      const d = data();
      d.leadAssignmentRules ||= [];
      return d.leadAssignmentRules.find(r => r.tenantId === tenantId && r.id === id) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.leadAssignmentRules ||= [];
      const rule = {
        id: makeId('assign'),
        tenantId,
        name: input.name || 'Default Rule',
        strategy: input.strategy || 'round_robin',
        criteria: input.criteria || {},
        assignees: input.assignees || [],
        currentIndex: 0,
        isActive: input.is_active !== false,
        priority: input.priority || 0,
        createdAt: now(),
        updatedAt: now()
      };
      d.leadAssignmentRules.push(rule);
      save(d);
      return rule;
    },

    update(tenantId, id, input) {
      const d = data();
      d.leadAssignmentRules ||= [];
      const idx = d.leadAssignmentRules.findIndex(r => r.tenantId === tenantId && r.id === id);
      if (idx === -1) return null;
      const rule = d.leadAssignmentRules[idx];
      if (input.name !== undefined) rule.name = input.name;
      if (input.strategy !== undefined) rule.strategy = input.strategy;
      if (input.criteria !== undefined) rule.criteria = input.criteria;
      if (input.assignees !== undefined) rule.assignees = input.assignees;
      if (input.is_active !== undefined) rule.isActive = !!input.is_active;
      if (input.priority !== undefined) rule.priority = input.priority;
      rule.updatedAt = now();
      save(d);
      return rule;
    },

    advanceRoundRobin(tenantId, id) {
      const d = data();
      d.leadAssignmentRules ||= [];
      const rule = d.leadAssignmentRules.find(r => r.tenantId === tenantId && r.id === id);
      if (!rule || !rule.assignees.length) return null;
      const assignee = rule.assignees[rule.currentIndex % rule.assignees.length];
      rule.currentIndex = (rule.currentIndex + 1) % rule.assignees.length;
      save(d);
      return assignee;
    },

    delete(tenantId, id) {
      const d = data();
      d.leadAssignmentRules ||= [];
      const idx = d.leadAssignmentRules.findIndex(r => r.tenantId === tenantId && r.id === id);
      if (idx === -1) return null;
      d.leadAssignmentRules.splice(idx, 1);
      save(d);
      return { deleted: true };
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createLeadAssignmentRuleRepository };
