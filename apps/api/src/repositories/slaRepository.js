const { makeId, now } = require('../services/id');
const {
  normalizeSlaPolicyInput,
  normalizeSlaTimerInput,
  buildTimerFromPolicy,
  evaluateSlaTimer,
  markResponded,
  markResolved,
  markBreached
} = require('../services/slaService');

function createSlaRepository(store) {
  if (store.type === 'json') return createJsonSlaRepository(store);
  if (store.type === 'postgres') return createPostgresSlaRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureSla(data) {
  if (!data.slaPolicies) data.slaPolicies = [];
  if (!data.slaTimers) data.slaTimers = [];
  return data;
}

function createJsonSlaRepository(store) {
  return {
    listPolicies(tenantId) {
      return ensureSla(store.read()).slaPolicies.filter(x => x.tenantId === tenantId).sort((a, b) => String(a.priority).localeCompare(String(b.priority)));
    },
    findPolicyById(tenantId, id) {
      return this.listPolicies(tenantId).find(x => x.id === id) || null;
    },
    createPolicy(tenantId, input) {
      const data = ensureSla(store.read());
      const policy = { id: makeId('slapolicy'), tenantId, ...normalizeSlaPolicyInput(input), createdAt: now(), updatedAt: now() };
      data.slaPolicies.push(policy);
      store.write(data);
      return policy;
    },
    listTimers(tenantId, filters = {}) {
      return ensureSla(store.read()).slaTimers
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.jobId || x.jobId === filters.jobId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.responseDueAt).localeCompare(String(b.responseDueAt)));
    },
    findTimerById(tenantId, id) {
      return ensureSla(store.read()).slaTimers.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    createTimer(tenantId, input) {
      const data = ensureSla(store.read());
      const timer = { id: makeId('slatimer'), tenantId, ...normalizeSlaTimerInput(input), createdAt: now(), updatedAt: now() };
      data.slaTimers.push(timer);
      store.write(data);
      return timer;
    },
    createTimerFromPolicy(tenantId, policyId, input) {
      const data = ensureSla(store.read());
      const policy = data.slaPolicies.find(x => x.tenantId === tenantId && x.id === policyId);
      if (!policy) return null;
      const timer = { id: makeId('slatimer'), tenantId, ...buildTimerFromPolicy(policy, input), createdAt: now(), updatedAt: now() };
      data.slaTimers.push(timer);
      store.write(data);
      return timer;
    },
    markResponded(tenantId, id, respondedAt) {
      const data = ensureSla(store.read());
      const idx = data.slaTimers.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.slaTimers[idx] = markResponded(data.slaTimers[idx], respondedAt || new Date().toISOString());
      store.write(data);
      return data.slaTimers[idx];
    },
    markResolved(tenantId, id, resolvedAt) {
      const data = ensureSla(store.read());
      const idx = data.slaTimers.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.slaTimers[idx] = markResolved(data.slaTimers[idx], resolvedAt || new Date().toISOString());
      store.write(data);
      return data.slaTimers[idx];
    },
    evaluate(tenantId, nowIso) {
      return this.listTimers(tenantId).map(timer => ({ ...timer, evaluation: evaluateSlaTimer(timer, nowIso) }));
    },
    markBreaches(tenantId, nowIso) {
      const data = ensureSla(store.read());
      const changed = [];
      for (let i = 0; i < data.slaTimers.length; i += 1) {
        const timer = data.slaTimers[i];
        if (timer.tenantId !== tenantId || !['active', 'responded'].includes(timer.status)) continue;
        const evaluation = evaluateSlaTimer(timer, nowIso);
        if (evaluation.breached) {
          data.slaTimers[i] = markBreached(timer, evaluation.responseBreached ? 'Response SLA breached' : 'Resolution SLA breached', nowIso || new Date().toISOString());
          changed.push(data.slaTimers[i]);
        }
      }
      store.write(data);
      return changed;
    }
  };
}

function createPostgresSlaRepository(store) {
  const policySelect = `SELECT id::text, tenant_id as "tenantId", name, description, priority,
    response_minutes as "responseMinutes", resolution_minutes as "resolutionMinutes",
    warning_before_minutes as "warningBeforeMinutes", applies_to_service_type as "appliesToServiceType",
    applies_to_agreement_tier as "appliesToAgreementTier", active, metadata,
    created_at as "createdAt", updated_at as "updatedAt" FROM sla_policies`;
  const timerSelect = `SELECT id::text, tenant_id as "tenantId", job_id::text as "jobId",
    customer_id::text as "customerId", policy_id::text as "policyId", priority, status,
    started_at as "startedAt", response_due_at as "responseDueAt", resolution_due_at as "resolutionDueAt",
    responded_at as "respondedAt", resolved_at as "resolvedAt", breached_at as "breachedAt",
    breach_reason as "breachReason", metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM sla_timers`;

  return {
    async listPolicies(tenantId) {
      const result = await store.query(`${policySelect} WHERE tenant_id = $1 ORDER BY priority, name`, [tenantId]);
      return result.rows;
    },
    async findPolicyById(tenantId, id) {
      const result = await store.query(`${policySelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createPolicy(tenantId, input) {
      const x = normalizeSlaPolicyInput(input);
      const result = await store.query(
        `INSERT INTO sla_policies
         (tenant_id, name, description, priority, response_minutes, resolution_minutes, warning_before_minutes,
          applies_to_service_type, applies_to_agreement_tier, active, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
         RETURNING id::text, tenant_id as "tenantId", name, description, priority,
                   response_minutes as "responseMinutes", resolution_minutes as "resolutionMinutes",
                   warning_before_minutes as "warningBeforeMinutes", applies_to_service_type as "appliesToServiceType",
                   applies_to_agreement_tier as "appliesToAgreementTier", active, metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.name, x.description, x.priority, x.responseMinutes, x.resolutionMinutes, x.warningBeforeMinutes,
          x.appliesToServiceType, x.appliesToAgreementTier, x.active, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listTimers(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      if (filters.jobId) {
        params.push(filters.jobId);
        where += ` AND job_id = $${params.length}`;
      }
      if (filters.status) {
        params.push(filters.status);
        where += ` AND status = $${params.length}`;
      }
      const result = await store.query(`${timerSelect} ${where} ORDER BY response_due_at`, params);
      return result.rows;
    },
    async findTimerById(tenantId, id) {
      const result = await store.query(`${timerSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createTimer(tenantId, input) {
      const x = normalizeSlaTimerInput(input);
      const result = await store.query(
        `INSERT INTO sla_timers
         (tenant_id, job_id, customer_id, policy_id, priority, status, started_at, response_due_at, resolution_due_at,
          responded_at, resolved_at, breached_at, breach_reason, metadata)
         VALUES ($1,$2::uuid,NULLIF($3,'')::uuid,$4::uuid,$5,$6,$7::timestamptz,$8::timestamptz,$9::timestamptz,
                 NULLIF($10,'')::timestamptz,NULLIF($11,'')::timestamptz,NULLIF($12,'')::timestamptz,$13,$14::jsonb)
         RETURNING id::text, tenant_id as "tenantId", job_id::text as "jobId",
                   customer_id::text as "customerId", policy_id::text as "policyId", priority, status,
                   started_at as "startedAt", response_due_at as "responseDueAt", resolution_due_at as "resolutionDueAt",
                   responded_at as "respondedAt", resolved_at as "resolvedAt", breached_at as "breachedAt",
                   breach_reason as "breachReason", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.jobId, x.customerId, x.policyId, x.priority, x.status, x.startedAt, x.responseDueAt, x.resolutionDueAt,
          x.respondedAt, x.resolvedAt, x.breachedAt, x.breachReason, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async createTimerFromPolicy(tenantId, policyId, input) {
      const policy = await this.findPolicyById(tenantId, policyId);
      if (!policy) return null;
      return this.createTimer(tenantId, buildTimerFromPolicy(policy, input));
    },
    async markResponded(tenantId, id, respondedAt) {
      const result = await store.query(
        `UPDATE sla_timers SET status='responded', responded_at=$3::timestamptz, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", job_id::text as "jobId",
                   customer_id::text as "customerId", policy_id::text as "policyId", priority, status,
                   started_at as "startedAt", response_due_at as "responseDueAt", resolution_due_at as "resolutionDueAt",
                   responded_at as "respondedAt", resolved_at as "resolvedAt", breached_at as "breachedAt",
                   breach_reason as "breachReason", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, respondedAt || new Date().toISOString()]
      );
      return result.rows[0] || null;
    },
    async markResolved(tenantId, id, resolvedAt) {
      const stamp = resolvedAt || new Date().toISOString();
      const result = await store.query(
        `UPDATE sla_timers SET status='resolved', responded_at=COALESCE(responded_at,$3::timestamptz),
         resolved_at=$3::timestamptz, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", job_id::text as "jobId",
                   customer_id::text as "customerId", policy_id::text as "policyId", priority, status,
                   started_at as "startedAt", response_due_at as "responseDueAt", resolution_due_at as "resolutionDueAt",
                   responded_at as "respondedAt", resolved_at as "resolvedAt", breached_at as "breachedAt",
                   breach_reason as "breachReason", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, stamp]
      );
      return result.rows[0] || null;
    },
    async evaluate(tenantId, nowIso) {
      const rows = await this.listTimers(tenantId);
      return rows.map(timer => ({ ...timer, evaluation: evaluateSlaTimer(timer, nowIso) }));
    },
    async markBreaches(tenantId, nowIso) {
      const rows = await this.listTimers(tenantId);
      const breached = [];
      for (const timer of rows.filter(t => ['active', 'responded'].includes(t.status))) {
        const evaluation = evaluateSlaTimer(timer, nowIso);
        if (!evaluation.breached) continue;
        const result = await store.query(
          `UPDATE sla_timers SET status='breached', breached_at=$3::timestamptz, breach_reason=$4, updated_at=now()
           WHERE tenant_id=$1 AND id=$2 RETURNING id::text, tenant_id as "tenantId", job_id::text as "jobId",
           customer_id::text as "customerId", policy_id::text as "policyId", priority, status,
           started_at as "startedAt", response_due_at as "responseDueAt", resolution_due_at as "resolutionDueAt",
           responded_at as "respondedAt", resolved_at as "resolvedAt", breached_at as "breachedAt",
           breach_reason as "breachReason", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
          [tenantId, timer.id, nowIso || new Date().toISOString(), evaluation.responseBreached ? 'Response SLA breached' : 'Resolution SLA breached']
        );
        if (result.rows[0]) breached.push(result.rows[0]);
      }
      return breached;
    }
  };
}

module.exports = { createSlaRepository };
