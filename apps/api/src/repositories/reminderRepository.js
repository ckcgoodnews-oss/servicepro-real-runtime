const { makeId, now } = require('../services/id');
const {
  normalizeReminderRuleInput,
  normalizeFollowUpInput,
  isDue,
  isOverdue,
  completeFollowUp,
  snoozeFollowUp,
  followUpSummary
} = require('../services/reminderService');

function createReminderRepository(store) {
  if (store.type === 'json') return createJsonReminderRepository(store);
  if (store.type === 'postgres') return createPostgresReminderRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureReminders(data) {
  if (!data.reminderRules) data.reminderRules = [];
  if (!data.followUps) data.followUps = [];
  return data;
}

function filterFollowUps(rows, filters = {}) {
  return rows
    .filter(x => !filters.customerId || x.customerId === filters.customerId)
    .filter(x => !filters.entityType || x.entityType === filters.entityType)
    .filter(x => !filters.entityId || x.entityId === filters.entityId)
    .filter(x => !filters.status || x.status === filters.status)
    .filter(x => !filters.assignedTo || x.assignedTo === filters.assignedTo);
}

function createJsonReminderRepository(store) {
  return {
    listRules(tenantId) {
      return ensureReminders(store.read()).reminderRules.filter(x => x.tenantId === tenantId);
    },
    createRule(tenantId, input) {
      const data = ensureReminders(store.read());
      const rule = { id: makeId('remrule'), tenantId, ...normalizeReminderRuleInput(input), createdAt: now(), updatedAt: now() };
      data.reminderRules.push(rule);
      store.write(data);
      return rule;
    },
    listFollowUps(tenantId, filters = {}) {
      const rows = ensureReminders(store.read()).followUps.filter(x => x.tenantId === tenantId);
      return filterFollowUps(rows, filters).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
    },
    timeline(tenantId, filters = {}, today) {
      return this.listFollowUps(tenantId, filters).map(x => followUpSummary(x, today));
    },
    findFollowUpById(tenantId, id) {
      return ensureReminders(store.read()).followUps.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    createFollowUp(tenantId, input) {
      const data = ensureReminders(store.read());
      const followUp = { id: makeId('followup'), tenantId, ...normalizeFollowUpInput(input), createdAt: now(), updatedAt: now() };
      data.followUps.push(followUp);
      store.write(data);
      return followUp;
    },
    updateFollowUp(tenantId, id, input) {
      const data = ensureReminders(store.read());
      const idx = data.followUps.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.followUps[idx] = { ...data.followUps[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.followUps[idx];
    },
    complete(tenantId, id) {
      const data = ensureReminders(store.read());
      const idx = data.followUps.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.followUps[idx] = completeFollowUp(data.followUps[idx]);
      store.write(data);
      return data.followUps[idx];
    },
    snooze(tenantId, id, snoozedUntil) {
      const data = ensureReminders(store.read());
      const idx = data.followUps.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.followUps[idx] = snoozeFollowUp(data.followUps[idx], snoozedUntil);
      store.write(data);
      return data.followUps[idx];
    },
    due(tenantId, today) {
      return this.listFollowUps(tenantId).filter(x => isDue(x, today));
    },
    overdue(tenantId, today) {
      return this.listFollowUps(tenantId).filter(x => isOverdue(x, today));
    }
  };
}

function createPostgresReminderRepository(store) {
  const ruleSelect = `SELECT id::text, tenant_id as "tenantId", name, description, trigger_type as "triggerType",
    entity_type as "entityType", offset_days as "offsetDays", default_priority as "defaultPriority",
    default_channel as "defaultChannel", active, metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM reminder_rules`;
  const followUpSelect = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    entity_type as "entityType", entity_id as "entityId", job_id::text as "jobId", invoice_id::text as "invoiceId",
    estimate_id::text as "estimateId", agreement_id::text as "agreementId", assigned_to as "assignedTo",
    title, description, due_date as "dueDate", status, priority, channel, completed_at as "completedAt",
    snoozed_until as "snoozedUntil", source_rule_id::text as "sourceRuleId", metadata,
    created_at as "createdAt", updated_at as "updatedAt" FROM follow_ups`;

  function followUpWhere(tenantId, filters = {}) {
    const params = [tenantId];
    let where = 'WHERE tenant_id = $1';
    const map = {
      customerId: 'customer_id',
      entityType: 'entity_type',
      entityId: 'entity_id',
      status: 'status',
      assignedTo: 'assigned_to'
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
    async listRules(tenantId) {
      const result = await store.query(`${ruleSelect} WHERE tenant_id = $1 ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async createRule(tenantId, input) {
      const x = normalizeReminderRuleInput(input);
      const result = await store.query(
        `INSERT INTO reminder_rules
         (tenant_id, name, description, trigger_type, entity_type, offset_days, default_priority, default_channel, active, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
         RETURNING id::text, tenant_id as "tenantId", name, description, trigger_type as "triggerType",
                   entity_type as "entityType", offset_days as "offsetDays", default_priority as "defaultPriority",
                   default_channel as "defaultChannel", active, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.name, x.description, x.triggerType, x.entityType, x.offsetDays, x.defaultPriority, x.defaultChannel, x.active, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listFollowUps(tenantId, filters = {}) {
      const { where, params } = followUpWhere(tenantId, filters);
      const result = await store.query(`${followUpSelect} ${where} ORDER BY due_date ASC, created_at DESC`, params);
      return result.rows;
    },
    async timeline(tenantId, filters = {}, today) {
      const rows = await this.listFollowUps(tenantId, filters);
      return rows.map(x => followUpSummary(x, today));
    },
    async findFollowUpById(tenantId, id) {
      const result = await store.query(`${followUpSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createFollowUp(tenantId, input) {
      const x = normalizeFollowUpInput(input);
      const result = await store.query(
        `INSERT INTO follow_ups
         (tenant_id, customer_id, entity_type, entity_id, job_id, invoice_id, estimate_id, agreement_id, assigned_to,
          title, description, due_date, status, priority, channel, completed_at, snoozed_until, source_rule_id, metadata)
         VALUES ($1,$2::uuid,$3,$4,NULLIF($5,'')::uuid,NULLIF($6,'')::uuid,NULLIF($7,'')::uuid,NULLIF($8,'')::uuid,$9,
                 $10,$11,$12::date,$13,$14,$15,NULLIF($16,'')::timestamptz,NULLIF($17,'')::date,NULLIF($18,'')::uuid,$19::jsonb)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   entity_type as "entityType", entity_id as "entityId", job_id::text as "jobId", invoice_id::text as "invoiceId",
                   estimate_id::text as "estimateId", agreement_id::text as "agreementId", assigned_to as "assignedTo",
                   title, description, due_date as "dueDate", status, priority, channel, completed_at as "completedAt",
                   snoozed_until as "snoozedUntil", source_rule_id::text as "sourceRuleId", metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.customerId, x.entityType, x.entityId, x.jobId, x.invoiceId, x.estimateId, x.agreementId, x.assignedTo,
          x.title, x.description, x.dueDate, x.status, x.priority, x.channel, x.completedAt, x.snoozedUntil, x.sourceRuleId,
          JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async updateFollowUp(tenantId, id, input) {
      const existing = await this.findFollowUpById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE follow_ups SET assigned_to=$3, title=$4, description=$5, due_date=$6::date, status=$7,
         priority=$8, channel=$9, metadata=$10::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   entity_type as "entityType", entity_id as "entityId", job_id::text as "jobId", invoice_id::text as "invoiceId",
                   estimate_id::text as "estimateId", agreement_id::text as "agreementId", assigned_to as "assignedTo",
                   title, description, due_date as "dueDate", status, priority, channel, completed_at as "completedAt",
                   snoozed_until as "snoozedUntil", source_rule_id::text as "sourceRuleId", metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.assignedTo || '', x.title, x.description || '', x.dueDate, x.status, x.priority, x.channel, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async complete(tenantId, id) {
      const result = await store.query(
        `UPDATE follow_ups SET status='completed', completed_at=now(), updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   entity_type as "entityType", entity_id as "entityId", job_id::text as "jobId", invoice_id::text as "invoiceId",
                   estimate_id::text as "estimateId", agreement_id::text as "agreementId", assigned_to as "assignedTo",
                   title, description, due_date as "dueDate", status, priority, channel, completed_at as "completedAt",
                   snoozed_until as "snoozedUntil", source_rule_id::text as "sourceRuleId", metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id]
      );
      return result.rows[0] || null;
    },
    async snooze(tenantId, id, snoozedUntil) {
      const result = await store.query(
        `UPDATE follow_ups SET status='snoozed', snoozed_until=$3::date, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   entity_type as "entityType", entity_id as "entityId", job_id::text as "jobId", invoice_id::text as "invoiceId",
                   estimate_id::text as "estimateId", agreement_id::text as "agreementId", assigned_to as "assignedTo",
                   title, description, due_date as "dueDate", status, priority, channel, completed_at as "completedAt",
                   snoozed_until as "snoozedUntil", source_rule_id::text as "sourceRuleId", metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, snoozedUntil]
      );
      return result.rows[0] || null;
    },
    async due(tenantId, today) {
      const result = await store.query(`${followUpSelect} WHERE tenant_id = $1 AND status IN ('open','snoozed') AND due_date <= $2::date AND (snoozed_until IS NULL OR snoozed_until <= $2::date) ORDER BY due_date`, [tenantId, today]);
      return result.rows;
    },
    async overdue(tenantId, today) {
      const result = await store.query(`${followUpSelect} WHERE tenant_id = $1 AND status IN ('open','snoozed') AND due_date < $2::date AND (snoozed_until IS NULL OR snoozed_until <= $2::date) ORDER BY due_date`, [tenantId, today]);
      return result.rows;
    }
  };
}

module.exports = { createReminderRepository };
