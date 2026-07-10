const { makeId, now } = require('../services/id');
const {
  normalizeInspectionTemplateInput,
  instantiateInspection,
  updateInspectionItem,
  scoreInspection,
  completeInspection
} = require('../services/qaInspectionService');

function createQaInspectionRepository(store) {
  if (store.type === 'json') return createJsonQaInspectionRepository(store);
  if (store.type === 'postgres') return createPostgresQaInspectionRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureQa(data) {
  if (!data.qaInspectionTemplates) data.qaInspectionTemplates = [];
  if (!data.qaInspections) data.qaInspections = [];
  return data;
}

function createJsonQaInspectionRepository(store) {
  return {
    listTemplates(tenantId) {
      return ensureQa(store.read()).qaInspectionTemplates.filter(x => x.tenantId === tenantId);
    },
    findTemplateById(tenantId, id) {
      return this.listTemplates(tenantId).find(x => x.id === id) || null;
    },
    createTemplate(tenantId, input) {
      const data = ensureQa(store.read());
      const template = { id: makeId('qatmpl'), tenantId, ...normalizeInspectionTemplateInput(input), createdAt: now(), updatedAt: now() };
      data.qaInspectionTemplates.push(template);
      store.write(data);
      return template;
    },
    listInspections(tenantId, filters = {}) {
      return ensureQa(store.read()).qaInspections
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.entityType || x.entityType === filters.entityType)
        .filter(x => !filters.entityId || x.entityId === filters.entityId)
        .filter(x => !filters.jobId || x.jobId === filters.jobId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    findInspectionById(tenantId, id) {
      return ensureQa(store.read()).qaInspections.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    createInspectionFromTemplate(tenantId, templateId, input) {
      const data = ensureQa(store.read());
      const template = data.qaInspectionTemplates.find(x => x.tenantId === tenantId && x.id === templateId);
      if (!template) return null;
      const inspection = { id: makeId('qainsp'), tenantId, ...instantiateInspection(template, input), createdAt: now(), updatedAt: now() };
      data.qaInspections.push(inspection);
      store.write(data);
      return inspection;
    },
    updateItem(tenantId, inspectionId, itemCode, patch) {
      const data = ensureQa(store.read());
      const idx = data.qaInspections.findIndex(x => x.tenantId === tenantId && x.id === inspectionId);
      if (idx === -1) return null;
      data.qaInspections[idx] = updateInspectionItem(data.qaInspections[idx], itemCode, patch);
      store.write(data);
      return data.qaInspections[idx];
    },
    complete(tenantId, inspectionId) {
      const data = ensureQa(store.read());
      const idx = data.qaInspections.findIndex(x => x.tenantId === tenantId && x.id === inspectionId);
      if (idx === -1) return null;
      const template = data.qaInspectionTemplates.find(x => x.tenantId === tenantId && x.id === data.qaInspections[idx].templateId);
      data.qaInspections[idx] = completeInspection(data.qaInspections[idx], template ? template.passingScorePercent : 100);
      store.write(data);
      return data.qaInspections[idx];
    },
    score(tenantId, inspectionId) {
      const inspection = this.findInspectionById(tenantId, inspectionId);
      if (!inspection) return null;
      const template = this.findTemplateById(tenantId, inspection.templateId);
      return scoreInspection(inspection, template ? template.passingScorePercent : 100);
    }
  };
}

function createPostgresQaInspectionRepository(store) {
  const templateSelect = `SELECT id::text, tenant_id as "tenantId", code, name, description,
    applies_to as "appliesTo", active, passing_score_percent::float as "passingScorePercent",
    items, metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM qa_inspection_templates`;
  const inspectionSelect = `SELECT id::text, tenant_id as "tenantId", template_id::text as "templateId",
    template_code as "templateCode", entity_type as "entityType", entity_id as "entityId",
    job_id::text as "jobId", customer_id::text as "customerId", asset_id::text as "assetId",
    technician_id::text as "technicianId", inspector_id as "inspectorId", status,
    score_percent::float as "scorePercent", passed, started_at as "startedAt", completed_at as "completedAt",
    corrective_action_required as "correctiveActionRequired", corrective_action_notes as "correctiveActionNotes",
    items, metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM qa_inspections`;

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
      const x = normalizeInspectionTemplateInput(input);
      const result = await store.query(
        `INSERT INTO qa_inspection_templates
         (tenant_id, code, name, description, applies_to, active, passing_score_percent, items, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, description,
                   applies_to as "appliesTo", active, passing_score_percent::float as "passingScorePercent",
                   items, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.appliesTo, x.active, x.passingScorePercent, JSON.stringify(x.items), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listInspections(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { entityType: 'entity_type', entityId: 'entity_id', jobId: 'job_id', status: 'status' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${inspectionSelect} ${where} ORDER BY created_at DESC`, params);
      return result.rows;
    },
    async findInspectionById(tenantId, id) {
      const result = await store.query(`${inspectionSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createInspectionFromTemplate(tenantId, templateId, input) {
      const template = await this.findTemplateById(tenantId, templateId);
      if (!template) return null;
      const x = instantiateInspection(template, input);
      const result = await store.query(
        `INSERT INTO qa_inspections
         (tenant_id, template_id, template_code, entity_type, entity_id, job_id, customer_id, asset_id,
          technician_id, inspector_id, status, score_percent, passed, started_at, completed_at,
          corrective_action_required, corrective_action_notes, items, metadata)
         VALUES ($1,$2::uuid,$3,$4,$5,NULLIF($6,'')::uuid,NULLIF($7,'')::uuid,NULLIF($8,'')::uuid,
                 NULLIF($9,'')::uuid,$10,$11,$12,$13,NULLIF($14,'')::timestamptz,NULLIF($15,'')::timestamptz,
                 $16,$17,$18::jsonb,$19::jsonb)
         RETURNING id::text, tenant_id as "tenantId", template_id::text as "templateId",
                   template_code as "templateCode", entity_type as "entityType", entity_id as "entityId",
                   job_id::text as "jobId", customer_id::text as "customerId", asset_id::text as "assetId",
                   technician_id::text as "technicianId", inspector_id as "inspectorId", status,
                   score_percent::float as "scorePercent", passed, started_at as "startedAt", completed_at as "completedAt",
                   corrective_action_required as "correctiveActionRequired", corrective_action_notes as "correctiveActionNotes",
                   items, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, templateId, x.templateCode, x.entityType, x.entityId, x.jobId, x.customerId, x.assetId,
          x.technicianId, x.inspectorId, x.status, x.scorePercent, x.passed, x.startedAt, x.completedAt,
          x.correctiveActionRequired, x.correctiveActionNotes, JSON.stringify(x.items), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async updateItem(tenantId, inspectionId, itemCode, patch) {
      const existing = await this.findInspectionById(tenantId, inspectionId);
      if (!existing) return null;
      const next = updateInspectionItem(existing, itemCode, patch);
      const result = await store.query(
        `UPDATE qa_inspections SET items=$3::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", template_id::text as "templateId",
                   template_code as "templateCode", entity_type as "entityType", entity_id as "entityId",
                   job_id::text as "jobId", customer_id::text as "customerId", asset_id::text as "assetId",
                   technician_id::text as "technicianId", inspector_id as "inspectorId", status,
                   score_percent::float as "scorePercent", passed, started_at as "startedAt", completed_at as "completedAt",
                   corrective_action_required as "correctiveActionRequired", corrective_action_notes as "correctiveActionNotes",
                   items, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, inspectionId, JSON.stringify(next.items)]
      );
      return result.rows[0];
    },
    async complete(tenantId, inspectionId) {
      const existing = await this.findInspectionById(tenantId, inspectionId);
      if (!existing) return null;
      const template = await this.findTemplateById(tenantId, existing.templateId);
      const next = completeInspection(existing, template ? template.passingScorePercent : 100);
      const result = await store.query(
        `UPDATE qa_inspections SET status=$3, score_percent=$4, passed=$5, completed_at=$6::timestamptz,
         corrective_action_required=$7, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", template_id::text as "templateId",
                   template_code as "templateCode", entity_type as "entityType", entity_id as "entityId",
                   job_id::text as "jobId", customer_id::text as "customerId", asset_id::text as "assetId",
                   technician_id::text as "technicianId", inspector_id as "inspectorId", status,
                   score_percent::float as "scorePercent", passed, started_at as "startedAt", completed_at as "completedAt",
                   corrective_action_required as "correctiveActionRequired", corrective_action_notes as "correctiveActionNotes",
                   items, metadata, created_at as "CreatedAt", updated_at as "updatedAt"`,
        [tenantId, inspectionId, next.status, next.scorePercent, next.passed, next.completedAt, next.correctiveActionRequired]
      );
      return result.rows[0];
    },
    async score(tenantId, inspectionId) {
      const inspection = await this.findInspectionById(tenantId, inspectionId);
      if (!inspection) return null;
      const template = await this.findTemplateById(tenantId, inspection.templateId);
      return scoreInspection(inspection, template ? template.passingScorePercent : 100);
    }
  };
}

module.exports = { createQaInspectionRepository };
