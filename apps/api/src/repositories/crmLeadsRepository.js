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
  const select = `SELECT id::text, tenant_id as "tenantId", name, email, phone, company, source, stage,
    value::float, service, notes, assigned_to as "assignedTo", tags,
    last_contact_at as "lastContactAt", converted_at as "convertedAt", lost_reason as "lostReason",
    created_at as "createdAt", updated_at as "updatedAt" FROM crm_leads`;
  return {
    async list(tenantId, filters = {}) {
      const values = [tenantId];
      const where = ['tenant_id = $1'];
      for (const [column, value] of [['stage', filters.stage], ['source', filters.source], ['assigned_to', filters.assignedTo]]) {
        if (value) { values.push(value); where.push(`${column} = $${values.length}`); }
      }
      return (await store.query(`${select} WHERE ${where.join(' AND ')} ORDER BY created_at DESC`, values)).rows;
    },
    async findById(tenantId, id) {
      return (await store.query(`${select} WHERE tenant_id = $1 AND id = $2::uuid LIMIT 1`, [tenantId, id])).rows[0] || null;
    },
    async create(tenantId, input) {
      const result = await store.query(
        `INSERT INTO crm_leads
          (tenant_id, name, email, phone, company, source, stage, value, service, notes, assigned_to, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
         RETURNING id::text, tenant_id as "tenantId", name, email, phone, company, source, stage,
           value::float, service, notes, assigned_to as "assignedTo", tags,
           last_contact_at as "lastContactAt", converted_at as "convertedAt", lost_reason as "lostReason",
           created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.name || '', input.email || '', input.phone || '', input.company || '', input.source || 'manual',
          input.stage || 'new', Number(input.value || 0), input.service || '', input.notes || '', input.assignedTo || '',
          JSON.stringify(input.tags || [])]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const next = { ...existing, ...input };
      const convertedAt = input.stage === 'won' && !existing.convertedAt ? now() : existing.convertedAt;
      return (await store.query(
        `UPDATE crm_leads SET name=$3,email=$4,phone=$5,company=$6,source=$7,stage=$8,value=$9,service=$10,
           notes=$11,assigned_to=$12,tags=$13::jsonb,last_contact_at=NULLIF($14,'')::timestamptz,
           converted_at=NULLIF($15,'')::timestamptz,lost_reason=$16,updated_at=now()
         WHERE tenant_id=$1 AND id=$2::uuid
         RETURNING id::text, tenant_id as "tenantId", name, email, phone, company, source, stage,
           value::float, service, notes, assigned_to as "assignedTo", tags,
           last_contact_at as "lastContactAt", converted_at as "convertedAt", lost_reason as "lostReason",
           created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, next.name, next.email, next.phone, next.company, next.source, next.stage, Number(next.value || 0),
          next.service, next.notes, next.assignedTo, JSON.stringify(next.tags || []), next.lastContactAt || '',
          convertedAt || '', next.lostReason || '']
      )).rows[0] || null;
    },
    async delete(tenantId, id) {
      return (await store.query('DELETE FROM crm_leads WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text', [tenantId, id])).rows[0] || null;
    },
    async pipeline(tenantId) {
      const leads = await this.list(tenantId);
      const pipeline = {};
      for (const stage of ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']) {
        const rows = leads.filter(lead => lead.stage === stage);
        pipeline[stage] = { count: rows.length, value: rows.reduce((sum, lead) => sum + lead.value, 0) };
      }
      pipeline.total = { count: leads.length, value: leads.reduce((sum, lead) => sum + lead.value, 0) };
      return pipeline;
    }
  };
}

module.exports = { createCrmLeadsRepository };
