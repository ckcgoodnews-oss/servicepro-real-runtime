const { makeId, now } = require('../services/id');
const {
  normalizeCommunicationInput,
  summarizeCommunication,
  communicationTimelineSort
} = require('../services/communicationService');

function createCommunicationRepository(store) {
  if (store.type === 'json') return createJsonCommunicationRepository(store);
  if (store.type === 'postgres') return createPostgresCommunicationRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureCommunications(data) {
  if (!data.communications) data.communications = [];
  return data;
}

function applyFilters(rows, filters = {}) {
  return rows
    .filter(x => !filters.customerId || x.customerId === filters.customerId)
    .filter(x => !filters.jobId || x.jobId === filters.jobId)
    .filter(x => !filters.estimateId || x.estimateId === filters.estimateId)
    .filter(x => !filters.invoiceId || x.invoiceId === filters.invoiceId)
    .filter(x => !filters.channel || x.channel === filters.channel)
    .filter(x => !filters.direction || x.direction === filters.direction)
    .filter(x => !filters.status || x.status === filters.status);
}

function createJsonCommunicationRepository(store) {
  return {
    list(tenantId, filters = {}) {
      const rows = ensureCommunications(store.read()).communications.filter(x => x.tenantId === tenantId);
      return communicationTimelineSort(applyFilters(rows, filters));
    },
    timeline(tenantId, filters = {}) {
      return this.list(tenantId, filters).map(summarizeCommunication);
    },
    findById(tenantId, id) {
      return ensureCommunications(store.read()).communications.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    create(tenantId, input) {
      const data = ensureCommunications(store.read());
      const event = {
        id: makeId('comm'),
        tenantId,
        ...normalizeCommunicationInput(input),
        createdAt: now(),
        updatedAt: now()
      };
      data.communications.push(event);
      store.write(data);
      return event;
    },
    updateStatus(tenantId, id, input) {
      const data = ensureCommunications(store.read());
      const idx = data.communications.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.communications[idx] = {
        ...data.communications[idx],
        status: input.status || data.communications[idx].status,
        deliveredAt: input.deliveredAt || data.communications[idx].deliveredAt,
        failedAt: input.failedAt || data.communications[idx].failedAt,
        failureReason: input.failureReason || data.communications[idx].failureReason,
        metadata: input.metadata || data.communications[idx].metadata,
        updatedAt: now()
      };
      store.write(data);
      return data.communications[idx];
    }
  };
}

function createPostgresCommunicationRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    job_id::text as "jobId", estimate_id::text as "estimateId", invoice_id::text as "invoiceId",
    payment_id::text as "paymentId", agreement_id::text as "agreementId", channel, direction, status,
    subject, body, from_address as "fromAddress", to_address as "toAddress", cc_address as "ccAddress",
    bcc_address as "bccAddress", external_message_id as "externalMessageId", template_key as "templateKey",
    sent_at as "sentAt", delivered_at as "deliveredAt", failed_at as "failedAt", failure_reason as "failureReason",
    tags, metadata, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    FROM communications`;

  function whereClause(tenantId, filters = {}) {
    const params = [tenantId];
    let where = 'WHERE tenant_id = $1';
    const map = {
      customerId: 'customer_id',
      jobId: 'job_id',
      estimateId: 'estimate_id',
      invoiceId: 'invoice_id',
      channel: 'channel',
      direction: 'direction',
      status: 'status'
    };
    for (const [key, column] of Object.entries(map)) {
      if (filters[key]) {
        params.push(filters[key]);
        where += ` AND ${column} = $${params.length}`;
      }
    }
    return { where, params };
  }

  return {
    async list(tenantId, filters = {}) {
      const { where, params } = whereClause(tenantId, filters);
      const result = await store.query(`${selectSql} ${where} ORDER BY created_at DESC`, params);
      return result.rows;
    },
    async timeline(tenantId, filters = {}) {
      const rows = await this.list(tenantId, filters);
      return rows.map(summarizeCommunication);
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      const x = normalizeCommunicationInput(input);
      const result = await store.query(
        `INSERT INTO communications
         (tenant_id, customer_id, job_id, estimate_id, invoice_id, payment_id, agreement_id, channel, direction, status,
          subject, body, from_address, to_address, cc_address, bcc_address, external_message_id, template_key,
          sent_at, delivered_at, failed_at, failure_reason, tags, metadata, created_by)
         VALUES ($1,$2::uuid,NULLIF($3,'')::uuid,NULLIF($4,'')::uuid,NULLIF($5,'')::uuid,NULLIF($6,'')::uuid,NULLIF($7,'')::uuid,
                 $8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NULLIF($19,'')::timestamptz,NULLIF($20,'')::timestamptz,
                 NULLIF($21,'')::timestamptz,$22,$23::jsonb,$24::jsonb,$25)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", estimate_id::text as "estimateId", invoice_id::text as "invoiceId",
                   payment_id::text as "paymentId", agreement_id::text as "agreementId", channel, direction, status,
                   subject, body, from_address as "fromAddress", to_address as "toAddress", cc_address as "ccAddress",
                   bcc_address as "bccAddress", external_message_id as "externalMessageId", template_key as "templateKey",
                   sent_at as "sentAt", delivered_at as "deliveredAt", failed_at as "failedAt", failure_reason as "failureReason",
                   tags, metadata, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.customerId, x.jobId, x.estimateId, x.invoiceId, x.paymentId, x.agreementId, x.channel, x.direction, x.status,
          x.subject, x.body, x.fromAddress, x.toAddress, x.ccAddress, x.bccAddress, x.externalMessageId, x.templateKey,
          x.sentAt, x.deliveredAt, x.failedAt, x.failureReason, JSON.stringify(x.tags || []), JSON.stringify(x.metadata || {}), x.createdBy]
      );
      return result.rows[0];
    },
    async updateStatus(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const result = await store.query(
        `UPDATE communications
         SET status=$3, delivered_at=NULLIF($4,'')::timestamptz, failed_at=NULLIF($5,'')::timestamptz,
             failure_reason=$6, metadata=$7::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", estimate_id::text as "estimateId", invoice_id::text as "invoiceId",
                   payment_id::text as "paymentId", agreement_id::text as "agreementId", channel, direction, status,
                   subject, body, from_address as "fromAddress", to_address as "toAddress", cc_address as "ccAddress",
                   bcc_address as "bccAddress", external_message_id as "externalMessageId", template_key as "templateKey",
                   sent_at as "sentAt", delivered_at as "deliveredAt", failed_at as "failedAt", failure_reason as "failureReason",
                   tags, metadata, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, input.status || existing.status, input.deliveredAt || existing.deliveredAt || '', input.failedAt || existing.failedAt || '',
          input.failureReason || existing.failureReason || '', JSON.stringify(input.metadata || existing.metadata || {})]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createCommunicationRepository };
