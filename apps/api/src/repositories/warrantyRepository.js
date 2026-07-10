const { makeId, now } = require('../services/id');
const {
  normalizeWarrantyPolicyInput,
  normalizeWarrantyClaimInput,
  normalizeCallbackInput,
  evaluateWarrantyEligibility,
  approveClaim,
  denyClaim,
  completeCallback
} = require('../services/warrantyService');

function createWarrantyRepository(store) {
  if (store.type === 'json') return createJsonWarrantyRepository(store);
  if (store.type === 'postgres') return createPostgresWarrantyRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureWarranty(data) {
  if (!data.warrantyPolicies) data.warrantyPolicies = [];
  if (!data.warrantyClaims) data.warrantyClaims = [];
  if (!data.callbacks) data.callbacks = [];
  return data;
}

function createJsonWarrantyRepository(store) {
  return {
    listPolicies(tenantId) {
      return ensureWarranty(store.read()).warrantyPolicies.filter(x => x.tenantId === tenantId);
    },
    findPolicyById(tenantId, id) {
      return this.listPolicies(tenantId).find(x => x.id === id) || null;
    },
    createPolicy(tenantId, input) {
      const data = ensureWarranty(store.read());
      const policy = { id: makeId('wpol'), tenantId, ...normalizeWarrantyPolicyInput(input), createdAt: now(), updatedAt: now() };
      data.warrantyPolicies.push(policy);
      store.write(data);
      return policy;
    },
    listClaims(tenantId, filters = {}) {
      return ensureWarranty(store.read()).warrantyClaims
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.originalJobId || x.originalJobId === filters.originalJobId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.claimDate).localeCompare(String(a.claimDate)));
    },
    findClaimById(tenantId, id) {
      return ensureWarranty(store.read()).warrantyClaims.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    createClaim(tenantId, input) {
      const data = ensureWarranty(store.read());
      const claim = { id: makeId('wclaim'), tenantId, ...normalizeWarrantyClaimInput(input), createdAt: now(), updatedAt: now() };
      data.warrantyClaims.push(claim);
      store.write(data);
      return claim;
    },
    approveClaim(tenantId, id, approvedBy) {
      const data = ensureWarranty(store.read());
      const idx = data.warrantyClaims.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.warrantyClaims[idx] = approveClaim(data.warrantyClaims[idx], approvedBy);
      store.write(data);
      return data.warrantyClaims[idx];
    },
    denyClaim(tenantId, id, deniedReason) {
      const data = ensureWarranty(store.read());
      const idx = data.warrantyClaims.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.warrantyClaims[idx] = denyClaim(data.warrantyClaims[idx], deniedReason);
      store.write(data);
      return data.warrantyClaims[idx];
    },
    evaluateEligibility(tenantId, input) {
      const policy = this.findPolicyById(tenantId, input.policyId);
      return evaluateWarrantyEligibility(policy, input.originalCompletionDate, input.claimDate);
    },
    listCallbacks(tenantId, filters = {}) {
      return ensureWarranty(store.read()).callbacks
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.originalJobId || x.originalJobId === filters.originalJobId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.reportedAt).localeCompare(String(a.reportedAt)));
    },
    createCallback(tenantId, input) {
      const data = ensureWarranty(store.read());
      const callback = { id: makeId('callback'), tenantId, ...normalizeCallbackInput(input), createdAt: now(), updatedAt: now() };
      data.callbacks.push(callback);
      store.write(data);
      return callback;
    },
    completeCallback(tenantId, id, resolutionNotes) {
      const data = ensureWarranty(store.read());
      const idx = data.callbacks.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.callbacks[idx] = completeCallback(data.callbacks[idx], resolutionNotes);
      store.write(data);
      return data.callbacks[idx];
    }
  };
}

function createPostgresWarrantyRepository(store) {
  const policySelect = `SELECT id::text, tenant_id as "tenantId", code, name, description,
    coverage_type as "coverageType", duration_days as "durationDays",
    labor_covered_percent::float as "laborCoveredPercent", parts_covered_percent::float as "partsCoveredPercent",
    active, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM warranty_policies`;
  const claimSelect = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    original_job_id::text as "originalJobId", callback_job_id::text as "callbackJobId", policy_id::text as "policyId",
    claim_date as "claimDate", status, problem_summary as "problemSummary", diagnosis, covered,
    denied_reason as "deniedReason", approved_by as "approvedBy", approved_at as "approvedAt",
    completed_at as "completedAt", estimated_labor_credit::float as "estimatedLaborCredit",
    estimated_parts_credit::float as "estimatedPartsCredit", actual_labor_credit::float as "actualLaborCredit",
    actual_parts_credit::float as "actualPartsCredit", metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM warranty_claims`;
  const callbackSelect = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    original_job_id::text as "originalJobId", callback_job_id::text as "callbackJobId",
    warranty_claim_id::text as "warrantyClaimId", status, reason, reported_at as "reportedAt",
    scheduled_at as "scheduledAt", resolved_at as "resolvedAt", billable, root_cause as "rootCause",
    resolution_notes as "resolutionNotes", metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM callbacks`;

  return {
    async listPolicies(tenantId) {
      const result = await store.query(`${policySelect} WHERE tenant_id = $1 ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async findPolicyById(tenantId, id) {
      const result = await store.query(`${policySelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createPolicy(tenantId, input) {
      const x = normalizeWarrantyPolicyInput(input);
      const result = await store.query(
        `INSERT INTO warranty_policies
         (tenant_id, code, name, description, coverage_type, duration_days, labor_covered_percent, parts_covered_percent, active, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, description,
                   coverage_type as "coverageType", duration_days as "durationDays",
                   labor_covered_percent::float as "laborCoveredPercent", parts_covered_percent::float as "partsCoveredPercent",
                   active, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.coverageType, x.durationDays, x.laborCoveredPercent, x.partsCoveredPercent, x.active, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listClaims(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { customerId: 'customer_id', originalJobId: 'original_job_id', status: 'status' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${claimSelect} ${where} ORDER BY claim_date DESC`, params);
      return result.rows;
    },
    async findClaimById(tenantId, id) {
      const result = await store.query(`${claimSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createClaim(tenantId, input) {
      const x = normalizeWarrantyClaimInput(input);
      const result = await store.query(
        `INSERT INTO warranty_claims
         (tenant_id, customer_id, original_job_id, callback_job_id, policy_id, claim_date, status,
          problem_summary, diagnosis, covered, denied_reason, approved_by, approved_at, completed_at,
          estimated_labor_credit, estimated_parts_credit, actual_labor_credit, actual_parts_credit, metadata)
         VALUES ($1,$2::uuid,$3::uuid,NULLIF($4,'')::uuid,NULLIF($5,'')::uuid,$6::date,$7,$8,$9,$10,$11,$12,
                 NULLIF($13,'')::timestamptz,NULLIF($14,'')::timestamptz,$15,$16,$17,$18,$19::jsonb)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   original_job_id::text as "originalJobId", callback_job_id::text as "callbackJobId", policy_id::text as "policyId",
                   claim_date as "claimDate", status, problem_summary as "problemSummary", diagnosis, covered,
                   denied_reason as "deniedReason", approved_by as "approvedBy", approved_at as "approvedAt",
                   completed_at as "completedAt", estimated_labor_credit::float as "estimatedLaborCredit",
                   estimated_parts_credit::float as "estimatedPartsCredit", actual_labor_credit::float as "actualLaborCredit",
                   actual_parts_credit::float as "actualPartsCredit", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.customerId, x.originalJobId, x.callbackJobId, x.policyId, x.claimDate, x.status, x.problemSummary,
          x.diagnosis, x.covered, x.deniedReason, x.approvedBy, x.approvedAt, x.completedAt, x.estimatedLaborCredit,
          x.estimatedPartsCredit, x.actualLaborCredit, x.actualPartsCredit, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async approveClaim(tenantId, id, approvedBy) {
      const result = await store.query(
        `UPDATE warranty_claims SET status='approved', covered=true, approved_by=$3, approved_at=now(),
         denied_reason='', updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING *`,
        [tenantId, id, approvedBy]
      );
      return result.rows[0] ? this.findClaimById(tenantId, id) : null;
    },
    async denyClaim(tenantId, id, deniedReason) {
      const result = await store.query(
        `UPDATE warranty_claims SET status='denied', covered=false, denied_reason=$3, updated_at=now()
         WHERE tenant_id=$1 AND id=$2 RETURNING *`,
        [tenantId, id, deniedReason]
      );
      return result.rows[0] ? this.findClaimById(tenantId, id) : null;
    },
    async evaluateEligibility(tenantId, input) {
      const policy = await this.findPolicyById(tenantId, input.policyId);
      return evaluateWarrantyEligibility(policy, input.originalCompletionDate, input.claimDate);
    },
    async listCallbacks(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { customerId: 'customer_id', originalJobId: 'original_job_id', status: 'status' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${callbackSelect} ${where} ORDER BY reported_at DESC`, params);
      return result.rows;
    },
    async createCallback(tenantId, input) {
      const x = normalizeCallbackInput(input);
      const result = await store.query(
        `INSERT INTO callbacks
         (tenant_id, customer_id, original_job_id, callback_job_id, warranty_claim_id, status, reason,
          reported_at, scheduled_at, resolved_at, billable, root_cause, resolution_notes, metadata)
         VALUES ($1,$2::uuid,$3::uuid,NULLIF($4,'')::uuid,NULLIF($5,'')::uuid,$6,$7,$8::timestamptz,
                 NULLIF($9,'')::timestamptz,NULLIF($10,'')::timestamptz,$11,$12,$13,$14::jsonb)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   original_job_id::text as "originalJobId", callback_job_id::text as "callbackJobId",
                   warranty_claim_id::text as "warrantyClaimId", status, reason, reported_at as "reportedAt",
                   scheduled_at as "scheduledAt", resolved_at as "resolvedAt", billable, root_cause as "rootCause",
                   resolution_notes as "resolutionNotes", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.customerId, x.originalJobId, x.callbackJobId, x.warrantyClaimId, x.status, x.reason,
          x.reportedAt, x.scheduledAt, x.resolvedAt, x.billable, x.rootCause, x.resolutionNotes, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async completeCallback(tenantId, id, resolutionNotes) {
      const callback = (await this.listCallbacks(tenantId)).find(x => x.id === id);
      if (!callback) return null;
      const next = completeCallback(callback, resolutionNotes);
      const result = await store.query(
        `UPDATE callbacks SET status=$3, resolved_at=$4::timestamptz, resolution_notes=$5, updated_at=now()
         WHERE tenant_id=$1 AND id=$2 RETURNING *`,
        [tenantId, id, next.status, next.resolvedAt, next.resolutionNotes]
      );
      return result.rows[0] ? (await this.listCallbacks(tenantId)).find(x => x.id === id) : null;
    }
  };
}

module.exports = { createWarrantyRepository };
