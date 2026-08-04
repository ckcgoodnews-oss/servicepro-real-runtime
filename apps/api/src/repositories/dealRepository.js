const { makeId, now } = require('../services/id');

function createDealRepository(store) {
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
      d.deals ||= [];
      let results = d.deals.filter(deal => deal.tenantId === tenantId);
      if (filters.pipeline_id) results = results.filter(deal => deal.pipelineId === filters.pipeline_id);
      if (filters.stage) results = results.filter(deal => deal.stage === filters.stage);
      if (filters.status) results = results.filter(deal => deal.status === filters.status);
      if (filters.owner_id) results = results.filter(deal => deal.ownerId === filters.owner_id);
      return results.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    findById(tenantId, id) {
      const d = data();
      d.deals ||= [];
      return d.deals.find(deal => deal.tenantId === tenantId && deal.id === id) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.deals ||= [];
      const deal = {
        id: makeId('deal'),
        tenantId,
        pipelineId: input.pipeline_id || null,
        name: input.name || '',
        stage: input.stage || 'new',
        amount: Number(input.amount || 0),
        currency: input.currency || 'USD',
        expectedCloseDate: input.expected_close_date || null,
        probability: input.probability || null,
        ownerId: input.owner_id || null,
        contactId: input.contact_id || null,
        companyId: input.company_id || null,
        status: 'open',
        winReason: null,
        lossReason: null,
        competitor: input.competitor || null,
        source: input.source || null,
        notes: input.notes || '',
        properties: input.properties || {},
        createdAt: now(),
        updatedAt: now(),
        closedAt: null
      };
      d.deals.push(deal);
      save(d);
      return deal;
    },

    update(tenantId, id, input) {
      const d = data();
      d.deals ||= [];
      const idx = d.deals.findIndex(deal => deal.tenantId === tenantId && deal.id === id);
      if (idx === -1) return null;
      const deal = d.deals[idx];
      if (input.name !== undefined) deal.name = input.name;
      if (input.stage !== undefined) deal.stage = input.stage;
      if (input.amount !== undefined) deal.amount = Number(input.amount);
      if (input.currency !== undefined) deal.currency = input.currency;
      if (input.expected_close_date !== undefined) deal.expectedCloseDate = input.expected_close_date;
      if (input.probability !== undefined) deal.probability = input.probability;
      if (input.owner_id !== undefined) deal.ownerId = input.owner_id;
      if (input.contact_id !== undefined) deal.contactId = input.contact_id;
      if (input.company_id !== undefined) deal.companyId = input.company_id;
      if (input.status !== undefined) {
        deal.status = input.status;
        if (input.status === 'won' || input.status === 'lost') deal.closedAt = now();
      }
      if (input.win_reason !== undefined) deal.winReason = input.win_reason;
      if (input.loss_reason !== undefined) deal.lossReason = input.loss_reason;
      if (input.competitor !== undefined) deal.competitor = input.competitor;
      if (input.source !== undefined) deal.source = input.source;
      if (input.notes !== undefined) deal.notes = input.notes;
      if (input.properties !== undefined) deal.properties = input.properties;
      deal.updatedAt = now();
      save(d);
      return deal;
    },

    delete(tenantId, id) {
      const d = data();
      d.deals ||= [];
      const idx = d.deals.findIndex(deal => deal.tenantId === tenantId && deal.id === id);
      if (idx === -1) return null;
      d.deals.splice(idx, 1);
      save(d);
      return { deleted: true };
    },

    forecast(tenantId, filters = {}) {
      const d = data();
      d.deals ||= [];
      let results = d.deals.filter(deal => deal.tenantId === tenantId);
      if (filters.pipeline_id) results = results.filter(deal => deal.pipelineId === filters.pipeline_id);
      if (filters.owner_id) results = results.filter(deal => deal.ownerId === filters.owner_id);

      const stages = {};
      for (const deal of results) {
        const key = `${deal.stage}:${deal.status}`;
        if (!stages[key]) stages[key] = { stage: deal.stage, status: deal.status, count: 0, total_amount: 0 };
        stages[key].count++;
        stages[key].total_amount += deal.amount || 0;
      }
      return Object.values(stages);
    },

    listPipelines(tenantId) {
      const d = data();
      d.dealPipelines ||= [];
      return d.dealPipelines.filter(p => p.tenantId === tenantId).sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    },

    getPipeline(tenantId, id) {
      const d = data();
      d.dealPipelines ||= [];
      return d.dealPipelines.find(p => p.tenantId === tenantId && p.id === id) || null;
    },

    createPipeline(tenantId, input) {
      const d = data();
      d.dealPipelines ||= [];
      const pipeline = {
        id: makeId('pipeline'),
        tenantId,
        name: input.name || 'Default Pipeline',
        isDefault: !!input.is_default,
        stages: input.stages || [
          { id: 'new', name: 'New', order: 0, probability: 10 },
          { id: 'qualified', name: 'Qualified', order: 1, probability: 25 },
          { id: 'proposal', name: 'Proposal', order: 2, probability: 50 },
          { id: 'negotiation', name: 'Negotiation', order: 3, probability: 75 },
          { id: 'closed_won', name: 'Closed Won', order: 4, probability: 100 },
          { id: 'closed_lost', name: 'Closed Lost', order: 5, probability: 0 }
        ],
        createdAt: now(),
        updatedAt: now()
      };
      d.dealPipelines.push(pipeline);
      save(d);
      return pipeline;
    },

    updatePipeline(tenantId, id, input) {
      const d = data();
      d.dealPipelines ||= [];
      const idx = d.dealPipelines.findIndex(p => p.tenantId === tenantId && p.id === id);
      if (idx === -1) return null;
      const pipeline = d.dealPipelines[idx];
      if (input.name !== undefined) pipeline.name = input.name;
      if (input.is_default !== undefined) pipeline.isDefault = !!input.is_default;
      if (input.stages !== undefined) pipeline.stages = input.stages;
      pipeline.updatedAt = now();
      save(d);
      return pipeline;
    },

    listProducts(tenantId, dealId) {
      const d = data();
      d.dealProducts ||= [];
      return d.dealProducts.filter(p => p.tenantId === tenantId && p.dealId === dealId);
    },

    addProduct(tenantId, dealId, input) {
      const d = data();
      d.dealProducts ||= [];
      const total = (input.quantity || 1) * (input.unit_price || 0) * (1 - (input.discount_percent || 0) / 100);
      const product = {
        id: makeId('dprod'),
        tenantId,
        dealId,
        serviceId: input.service_id || null,
        name: input.name || '',
        quantity: input.quantity || 1,
        unitPrice: input.unit_price || 0,
        discountPercent: input.discount_percent || 0,
        total,
        recurring: !!input.recurring,
        recurringInterval: input.recurring_interval || null,
        createdAt: now()
      };
      d.dealProducts.push(product);
      save(d);
      return product;
    },

    removeProduct(tenantId, productId) {
      const d = data();
      d.dealProducts ||= [];
      const idx = d.dealProducts.findIndex(p => p.tenantId === tenantId && p.id === productId);
      if (idx === -1) return null;
      d.dealProducts.splice(idx, 1);
      save(d);
      return { deleted: true };
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store); // Postgres implementation to be added when migrating from JSON store
}

module.exports = { createDealRepository };
