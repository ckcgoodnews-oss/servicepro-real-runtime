const { makeId, now } = require('../services/id');

function createCrmLeadsRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, filters = {}) {
      const d = data();
      d.crmLeads ||= [];
      let results = d.crmLeads.filter(l => l.tenantId === tenantId);
      if (filters.stage) results = results.filter(l => l.stage === filters.stage);
      if (filters.source) results = results.filter(l => l.source === filters.source);
      if (filters.assignedTo) results = results.filter(l => l.assignedTo === filters.assignedTo);
      return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    findById(tenantId, id) {
      const d = data();
      d.crmLeads ||= [];
      return d.crmLeads.find(l => l.tenantId === tenantId && l.id === id) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.crmLeads ||= [];
      const lead = {
        id: makeId('lead'),
        tenantId,
        name: input.name || '',
        email: input.email || '',
        phone: input.phone || '',
        company: input.company || '',
        source: input.source || 'manual',
        stage: input.stage || 'new',
        value: Number(input.value || 0),
        service: input.service || '',
        notes: input.notes || '',
        assignedTo: input.assignedTo || '',
        tags: input.tags || [],
        lastContactAt: '',
        convertedAt: '',
        lostReason: '',
        createdAt: now(),
        updatedAt: now()
      };
      d.crmLeads.push(lead);
      save(d);
      return lead;
    },

    update(tenantId, id, input) {
      const d = data();
      d.crmLeads ||= [];
      const lead = d.crmLeads.find(l => l.tenantId === tenantId && l.id === id);
      if (!lead) return null;
      for (const key of ['name', 'email', 'phone', 'company', 'source', 'stage', 'value', 'service', 'notes', 'assignedTo', 'tags', 'lastContactAt', 'lostReason']) {
        if (input[key] !== undefined) lead[key] = input[key];
      }
      if (input.stage === 'won' && !lead.convertedAt) lead.convertedAt = now();
      lead.updatedAt = now();
      save(d);
      return lead;
    },

    delete(tenantId, id) {
      const d = data();
      d.crmLeads ||= [];
      const idx = d.crmLeads.findIndex(l => l.tenantId === tenantId && l.id === id);
      if (idx < 0) return null;
      const removed = d.crmLeads.splice(idx, 1)[0];
      save(d);
      return removed;
    },

    pipeline(tenantId) {
      const leads = this.list(tenantId);
      const stages = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
      const pipeline = {};
      for (const stage of stages) {
        const stageLeads = leads.filter(l => l.stage === stage);
        pipeline[stage] = { count: stageLeads.length, value: stageLeads.reduce((s, l) => s + l.value, 0) };
      }
      pipeline.total = { count: leads.length, value: leads.reduce((s, l) => s + l.value, 0) };
      return pipeline;
    }
  };
}

function createPostgresImpl(store) {
  // Delegates to JSON for MVP - full PG implementation in next sprint
  return createJsonImpl(store);
}

module.exports = { createCrmLeadsRepository };
