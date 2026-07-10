const { makeId, now } = require('../services/id');
const {
  normalizeTemplateInput,
  instantiateChecklistFromTemplate,
  updateChecklistItem,
  completeChecklist
} = require('../services/checklistService');

function createChecklistRepository(store) {
  if (store.type === 'json') return createJsonChecklistRepository(store);
  if (store.type === 'postgres') return createPostgresChecklistRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureChecklists(data) {
  if (!data.checklistTemplates) data.checklistTemplates = [];
  if (!data.jobChecklists) data.jobChecklists = [];
  return data;
}

function createJsonChecklistRepository(store) {
  return {
    listTemplates(tenantId) {
      return ensureChecklists(store.read()).checklistTemplates.filter(x => x.tenantId === tenantId);
    },
    findTemplateById(tenantId, id) {
      return this.listTemplates(tenantId).find(x => x.id === id) || null;
    },
    createTemplate(tenantId, input) {
      const data = ensureChecklists(store.read());
      const template = { id: makeId('cltmpl'), tenantId, ...normalizeTemplateInput(input), createdAt: now(), updatedAt: now() };
      data.checklistTemplates.push(template);
      store.write(data);
      return template;
    },
    listJobChecklists(tenantId, jobId = '') {
      return ensureChecklists(store.read()).jobChecklists.filter(x => x.tenantId === tenantId && (!jobId || x.jobId === jobId));
    },
    findJobChecklistById(tenantId, id) {
      return this.listJobChecklists(tenantId).find(x => x.id === id) || null;
    },
    createFromTemplate(tenantId, templateId, input) {
      const data = ensureChecklists(store.read());
      const template = data.checklistTemplates.find(x => x.tenantId === tenantId && x.id === templateId);
      if (!template) return null;
      const checklist = { id: makeId('jobcl'), tenantId, ...instantiateChecklistFromTemplate(template, input) };
      data.jobChecklists.push(checklist);
      store.write(data);
      return checklist;
    },
    updateItem(tenantId, checklistId, itemCode, patch) {
      const data = ensureChecklists(store.read());
      const idx = data.jobChecklists.findIndex(x => x.tenantId === tenantId && x.id === checklistId);
      if (idx === -1) return null;
      data.jobChecklists[idx] = updateChecklistItem(data.jobChecklists[idx], itemCode, patch);
      store.write(data);
      return data.jobChecklists[idx];
    },
    complete(tenantId, checklistId) {
      const data = ensureChecklists(store.read());
      const idx = data.jobChecklists.findIndex(x => x.tenantId === tenantId && x.id === checklistId);
      if (idx === -1) return null;
      data.jobChecklists[idx] = completeChecklist(data.jobChecklists[idx]);
      store.write(data);
      return data.jobChecklists[idx];
    }
  };
}

function createPostgresChecklistRepository(store) {
  const templateSelect = `SELECT id::text, tenant_id as "tenantId", code, name, description,
    applies_to as "appliesTo", active, items, created_at as "createdAt", updated_at as "updatedAt"
    FROM checklist_templates`;
  const checklistSelect = `SELECT id::text, tenant_id as "tenantId", template_id::text as "templateId",
    template_code as "templateCode", job_id::text as "jobId", technician_id::text as "technicianId",
    status, started_at as "startedAt", completed_at as "completedAt", items,
    created_at as "createdAt", updated_at as "updatedAt" FROM job_checklists`;

  return {
    async listTemplates(tenantId) {
      const result = await store.query(`${templateSelect} WHERE tenant_id = $1 ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async findTemplateById(tenantId, id) {
      const result = await store.query(`${templateSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createTemplate(tenantId, input) {
      const x = normalizeTemplateInput(input);
      const result = await store.query(
        `INSERT INTO checklist_templates (tenant_id, code, name, description, applies_to, active, items)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, description,
                   applies_to as "appliesTo", active, items, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.appliesTo, x.active, JSON.stringify(x.items)]
      );
      return result.rows[0];
    },
    async listJobChecklists(tenantId, jobId = '') {
      const params = jobId ? [tenantId, jobId] : [tenantId];
      const where = jobId ? 'WHERE tenant_id = $1 AND job_id = $2' : 'WHERE tenant_id = $1';
      const result = await store.query(`${checklistSelect} ${where} ORDER BY created_at DESC`, params);
      return result.rows;
    },
    async findJobChecklistById(tenantId, id) {
      const result = await store.query(`${checklistSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createFromTemplate(tenantId, templateId, input) {
      const template = await this.findTemplateById(tenantId, templateId);
      if (!template) return null;
      const checklist = instantiateChecklistFromTemplate(template, input);
      const result = await store.query(
        `INSERT INTO job_checklists
         (tenant_id, template_id, template_code, job_id, technician_id, status, started_at, completed_at, items)
         VALUES ($1,$2::uuid,$3,$4::uuid,NULLIF($5,'')::uuid,$6,NULLIF($7,'')::timestamptz,NULLIF($8,'')::timestamptz,$9::jsonb)
         RETURNING id::text, tenant_id as "tenantId", template_id::text as "templateId",
                   template_code as "templateCode", job_id::text as "jobId", technician_id::text as "technicianId",
                   status, started_at as "startedAt", completed_at as "completedAt", items,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, templateId, checklist.templateCode, checklist.jobId, checklist.technicianId, checklist.status, checklist.startedAt, checklist.completedAt, JSON.stringify(checklist.items)]
      );
      return result.rows[0];
    },
    async updateItem(tenantId, checklistId, itemCode, patch) {
      const existing = await this.findJobChecklistById(tenantId, checklistId);
      if (!existing) return null;
      const next = updateChecklistItem(existing, itemCode, patch);
      const result = await store.query(
        `UPDATE job_checklists SET items=$3::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", template_id::text as "templateId",
                   template_code as "templateCode", job_id::text as "jobId", technician_id::text as "technicianId",
                   status, started_at as "startedAt", completed_at as "completedAt", items,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, checklistId, JSON.stringify(next.items)]
      );
      return result.rows[0];
    },
    async complete(tenantId, checklistId) {
      const existing = await this.findJobChecklistById(tenantId, checklistId);
      if (!existing) return null;
      const next = completeChecklist(existing);
      const result = await store.query(
        `UPDATE job_checklists SET status=$3, completed_at=$4::timestamptz, items=$5::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", template_id::text as "templateId",
                   template_code as "templateCode", job_id::text as "jobId", technician_id::text as "technicianId",
                   status, started_at as "startedAt", completed_at as "completedAt", items,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, checklistId, next.status, next.completedAt, JSON.stringify(next.items)]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createChecklistRepository };
