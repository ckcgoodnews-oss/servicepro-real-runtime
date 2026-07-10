const { makeId, now } = require('../services/id');
const {
  normalizeSurveyTemplateInput,
  normalizeSurveySendInput,
  normalizeSurveyResponseInput,
  scoreSurveyResponse,
  summarizeSurveyResponses
} = require('../services/surveyService');

function createSurveyRepository(store) {
  if (store.type === 'json') return createJsonSurveyRepository(store);
  if (store.type === 'postgres') return createPostgresSurveyRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureSurveys(data) {
  if (!data.surveyTemplates) data.surveyTemplates = [];
  if (!data.surveySends) data.surveySends = [];
  if (!data.surveyResponses) data.surveyResponses = [];
  return data;
}

function createJsonSurveyRepository(store) {
  return {
    listTemplates(tenantId) {
      return ensureSurveys(store.read()).surveyTemplates.filter(x => x.tenantId === tenantId);
    },
    findTemplateById(tenantId, id) {
      return this.listTemplates(tenantId).find(x => x.id === id) || null;
    },
    createTemplate(tenantId, input) {
      const data = ensureSurveys(store.read());
      const template = { id: makeId('svtmpl'), tenantId, ...normalizeSurveyTemplateInput(input), createdAt: now(), updatedAt: now() };
      data.surveyTemplates.push(template);
      store.write(data);
      return template;
    },
    listSends(tenantId, filters = {}) {
      return ensureSurveys(store.read()).surveySends
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.entityType || x.entityType === filters.entityType)
        .filter(x => !filters.entityId || x.entityId === filters.entityId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    findSendById(tenantId, id) {
      return ensureSurveys(store.read()).surveySends.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    createSend(tenantId, input) {
      const data = ensureSurveys(store.read());
      const send = { id: makeId('svsend'), tenantId, ...normalizeSurveySendInput(input), createdAt: now(), updatedAt: now() };
      data.surveySends.push(send);
      store.write(data);
      return send;
    },
    markSent(tenantId, id, sentAt) {
      const data = ensureSurveys(store.read());
      const idx = data.surveySends.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.surveySends[idx] = { ...data.surveySends[idx], status: 'sent', sentAt: sentAt || now(), updatedAt: now() };
      store.write(data);
      return data.surveySends[idx];
    },
    createResponse(tenantId, input) {
      const data = ensureSurveys(store.read());
      const send = data.surveySends.find(x => x.tenantId === tenantId && x.id === input.surveySendId);
      const normalized = normalizeSurveyResponseInput({
        ...input,
        customerId: input.customerId || (send ? send.customerId : ''),
        entityType: input.entityType || (send ? send.entityType : 'customer'),
        entityId: input.entityId || (send ? send.entityId : ''),
        jobId: input.jobId || (send ? send.jobId : ''),
        invoiceId: input.invoiceId || (send ? send.invoiceId : '')
      });
      const scoring = scoreSurveyResponse(normalized);
      const response = { id: makeId('svresp'), tenantId, ...normalized, ...scoring, createdAt: now(), updatedAt: now() };
      data.surveyResponses.push(response);
      if (send) {
        send.status = 'completed';
        send.completedAt = response.submittedAt;
        send.updatedAt = now();
      }
      store.write(data);
      return response;
    },
    listResponses(tenantId, filters = {}) {
      return ensureSurveys(store.read()).surveyResponses
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.entityType || x.entityType === filters.entityType)
        .filter(x => !filters.entityId || x.entityId === filters.entityId)
        .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
    },
    summary(tenantId, filters = {}) {
      return summarizeSurveyResponses(this.listResponses(tenantId, filters));
    }
  };
}

function createPostgresSurveyRepository(store) {
  const templateSelect = `SELECT id::text, tenant_id as "tenantId", code, name, description,
    trigger_type as "triggerType", active, questions, metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM survey_templates`;
  const sendSelect = `SELECT id::text, tenant_id as "tenantId", template_id::text as "templateId",
    customer_id::text as "customerId", entity_type as "entityType", entity_id as "entityId",
    job_id::text as "jobId", invoice_id::text as "invoiceId", email, phone, status, token,
    sent_at as "sentAt", opened_at as "openedAt", completed_at as "completedAt", expires_at as "expiresAt",
    metadata, created_at as "createdAt", updated_at as "updatedAt" FROM survey_sends`;
  const responseSelect = `SELECT id::text, tenant_id as "tenantId", survey_send_id::text as "surveySendId",
    customer_id::text as "customerId", entity_type as "entityType", entity_id as "entityId",
    job_id::text as "jobId", invoice_id::text as "invoiceId", answers, csat_score::float as "csatScore",
    nps_score as "npsScore", nps_category as "npsCategory", comment, submitted_at as "submittedAt",
    metadata, created_at as "createdAt", updated_at as "updatedAt" FROM survey_responses`;

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
      const x = normalizeSurveyTemplateInput(input);
      const result = await store.query(
        `INSERT INTO survey_templates (tenant_id, code, name, description, trigger_type, active, questions, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, description,
                   trigger_type as "triggerType", active, questions, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.triggerType, x.active, JSON.stringify(x.questions), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listSends(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { customerId: 'customer_id', entityType: 'entity_type', entityId: 'entity_id', status: 'status' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${sendSelect} ${where} ORDER BY created_at DESC`, params);
      return result.rows;
    },
    async findSendById(tenantId, id) {
      const result = await store.query(`${sendSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createSend(tenantId, input) {
      const x = normalizeSurveySendInput(input);
      const result = await store.query(
        `INSERT INTO survey_sends
         (tenant_id, template_id, customer_id, entity_type, entity_id, job_id, invoice_id, email, phone, status, token,
          sent_at, opened_at, completed_at, expires_at, metadata)
         VALUES ($1,$2::uuid,$3::uuid,$4,$5,NULLIF($6,'')::uuid,NULLIF($7,'')::uuid,$8,$9,$10,$11,
                 NULLIF($12,'')::timestamptz,NULLIF($13,'')::timestamptz,NULLIF($14,'')::timestamptz,NULLIF($15,'')::timestamptz,$16::jsonb)
         RETURNING id::text, tenant_id as "tenantId", template_id::text as "templateId",
                   customer_id::text as "customerId", entity_type as "entityType", entity_id as "entityId",
                   job_id::text as "jobId", invoice_id::text as "invoiceId", email, phone, status, token,
                   sent_at as "sentAt", opened_at as "openedAt", completed_at as "completedAt", expires_at as "expiresAt",
                   metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.templateId, x.customerId, x.entityType, x.entityId, x.jobId, x.invoiceId, x.email, x.phone, x.status, x.token,
          x.sentAt, x.openedAt, x.completedAt, x.expiresAt, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async markSent(tenantId, id, sentAt) {
      const result = await store.query(
        `UPDATE survey_sends SET status='sent', sent_at=$3::timestamptz, updated_at=now()
         WHERE tenant_id=$1 AND id=$2 RETURNING id::text, tenant_id as "tenantId", template_id::text as "templateId",
         customer_id::text as "customerId", entity_type as "entityType", entity_id as "entityId",
         job_id::text as "jobId", invoice_id::text as "invoiceId", email, phone, status, token,
         sent_at as "sentAt", opened_at as "openedAt", completed_at as "completedAt", expires_at as "expiresAt",
         metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, sentAt || new Date().toISOString()]
      );
      return result.rows[0] || null;
    },
    async createResponse(tenantId, input) {
      const send = await this.findSendById(tenantId, input.surveySendId);
      const normalized = normalizeSurveyResponseInput({
        ...input,
        customerId: input.customerId || (send ? send.customerId : ''),
        entityType: input.entityType || (send ? send.entityType : 'customer'),
        entityId: input.entityId || (send ? send.entityId : ''),
        jobId: input.jobId || (send ? send.jobId : ''),
        invoiceId: input.invoiceId || (send ? send.invoiceId : '')
      });
      const scoring = scoreSurveyResponse(normalized);
      const result = await store.query(
        `INSERT INTO survey_responses
         (tenant_id, survey_send_id, customer_id, entity_type, entity_id, job_id, invoice_id, answers,
          csat_score, nps_score, nps_category, comment, submitted_at, metadata)
         VALUES ($1,$2::uuid,$3::uuid,$4,$5,NULLIF($6,'')::uuid,NULLIF($7,'')::uuid,$8::jsonb,$9,$10,$11,$12,$13::timestamptz,$14::jsonb)
         RETURNING id::text, tenant_id as "tenantId", survey_send_id::text as "surveySendId",
                   customer_id::text as "customerId", entity_type as "entityType", entity_id as "entityId",
                   job_id::text as "jobId", invoice_id::text as "invoiceId", answers, csat_score::float as "csatScore",
                   nps_score as "npsScore", nps_category as "npsCategory", comment, submitted_at as "submittedAt",
                   metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, normalized.surveySendId, normalized.customerId, normalized.entityType, normalized.entityId,
          normalized.jobId, normalized.invoiceId, JSON.stringify(normalized.answers), scoring.csatScore,
          scoring.npsScore, scoring.npsCategory, normalized.comment, normalized.submittedAt, JSON.stringify(normalized.metadata || {})]
      );
      if (send) {
        await store.query(`UPDATE survey_sends SET status='completed', completed_at=$3::timestamptz, updated_at=now() WHERE tenant_id=$1 AND id=$2`, [tenantId, send.id, normalized.submittedAt]);
      }
      return result.rows[0];
    },
    async listResponses(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { customerId: 'customer_id', entityType: 'entity_type', entityId: 'entity_id' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${responseSelect} ${where} ORDER BY submitted_at DESC`, params);
      return result.rows;
    },
    async summary(tenantId, filters = {}) {
      const rows = await this.listResponses(tenantId, filters);
      return summarizeSurveyResponses(rows);
    }
  };
}

module.exports = { createSurveyRepository };
