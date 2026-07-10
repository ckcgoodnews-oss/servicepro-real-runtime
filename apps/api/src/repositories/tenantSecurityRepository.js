const { makeId, now } = require('../services/id');
const {
  normalizeTenantSecurityPolicyInput,
  evaluateTenantAccess,
  buildPolicySummary
} = require('../services/tenantSecurityService');

function createTenantSecurityRepository(store) {
  if (store.type === 'json') return createJsonTenantSecurityRepository(store);
  if (store.type === 'postgres') return createPostgresTenantSecurityRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTenantSecurity(data) {
  if (!data.tenantSecurityPolicies) data.tenantSecurityPolicies = [];
  if (!data.tenantAccessDecisions) data.tenantAccessDecisions = [];
  return data;
}

function createJsonTenantSecurityRepository(store) {
  return {
    listPolicies(tenantId, filters = {}) {
      return ensureTenantSecurity(store.read()).tenantSecurityPolicies
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    findPolicyById(tenantId, id) {
      return ensureTenantSecurity(store.read()).tenantSecurityPolicies.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    getActivePolicy(tenantId) {
      return this.listPolicies(tenantId, { status: 'active' })[0] || null;
    },
    createPolicy(tenantId, input) {
      const data = ensureTenantSecurity(store.read());
      const policy = {
        id: makeId('tspol'),
        tenantId,
        ...normalizeTenantSecurityPolicyInput(input),
        createdAt: now(),
        updatedAt: now()
      };
      data.tenantSecurityPolicies.push(policy);
      store.write(data);
      return policy;
    },
    updatePolicy(tenantId, id, input) {
      const data = ensureTenantSecurity(store.read());
      const idx = data.tenantSecurityPolicies.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      const merged = normalizeTenantSecurityPolicyInput({ ...data.tenantSecurityPolicies[idx], ...input });
      data.tenantSecurityPolicies[idx] = {
        ...data.tenantSecurityPolicies[idx],
        ...merged,
        id,
        tenantId,
        updatedAt: now()
      };
      store.write(data);
      return data.tenantSecurityPolicies[idx];
    },
    evaluate(tenantId, context = {}) {
      const data = ensureTenantSecurity(store.read());
      const policy = context.policyId
        ? data.tenantSecurityPolicies.find(x => x.tenantId === tenantId && x.id === context.policyId)
        : this.getActivePolicy(tenantId);

      const decision = evaluateTenantAccess(policy, context);
      const row = {
        id: makeId('tsdec'),
        tenantId,
        policyId: policy ? policy.id : '',
        userId: context.userId || '',
        action: context.action || '',
        ipAddress: context.ipAddress || '',
        result: decision.result,
        reason: decision.reason,
        challenges: decision.challenges || [],
        context,
        createdAt: now(),
        updatedAt: now()
      };
      data.tenantAccessDecisions.push(row);
      store.write(data);
      return row;
    },
    listDecisions(tenantId, filters = {}) {
      return ensureTenantSecurity(store.read()).tenantAccessDecisions
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.userId || x.userId === filters.userId)
        .filter(x => !filters.result || x.result === filters.result)
        .filter(x => !filters.action || x.action === filters.action)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    summary(tenantId) {
      const policy = this.getActivePolicy(tenantId);
      return policy ? buildPolicySummary(policy) : null;
    }
  };
}

function createPostgresTenantSecurityRepository(store) {
  const policySelect = `SELECT id::text, tenant_id as "tenantId", code, name, description, status,
    mfa_mode as "mfaMode", session_timeout_minutes as "sessionTimeoutMinutes",
    max_concurrent_sessions as "maxConcurrentSessions", allow_password_login as "allowPasswordLogin",
    require_sso as "requireSso", allowed_ip_ranges as "allowedIpRanges",
    blocked_ip_ranges as "blockedIpRanges", data_residency_region as "dataResidencyRegion",
    restrict_exports as "restrictExports", restrict_api_tokens as "restrictApiTokens",
    audit_log_retention_days as "auditLogRetentionDays", metadata,
    created_at as "createdAt", updated_at as "updatedAt"
    FROM tenant_security_policies`;

  const decisionSelect = `SELECT id::text, tenant_id as "tenantId", policy_id::text as "policyId",
    user_id as "userId", action, ip_address as "ipAddress", result, reason, challenges, context,
    created_at as "createdAt", updated_at as "updatedAt"
    FROM tenant_access_decisions`;

  return {
    async listPolicies(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      if (filters.status) {
        params.push(filters.status);
        where += ` AND status = $${params.length}`;
      }
      const result = await store.query(`${policySelect} ${where} ORDER BY name`, params);
      return result.rows;
    },
    async findPolicyById(tenantId, id) {
      const result = await store.query(`${policySelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async getActivePolicy(tenantId) {
      const rows = await this.listPolicies(tenantId, { status: 'active' });
      return rows[0] || null;
    },
    async createPolicy(tenantId, input) {
      const x = normalizeTenantSecurityPolicyInput(input);
      const result = await store.query(
        `INSERT INTO tenant_security_policies
         (tenant_id, code, name, description, status, mfa_mode, session_timeout_minutes,
          max_concurrent_sessions, allow_password_login, require_sso, allowed_ip_ranges,
          blocked_ip_ranges, data_residency_region, restrict_exports, restrict_api_tokens,
          audit_log_retention_days, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13,$14,$15,$16,$17::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, description, status,
                   mfa_mode as "mfaMode", session_timeout_minutes as "sessionTimeoutMinutes",
                   max_concurrent_sessions as "maxConcurrentSessions", allow_password_login as "allowPasswordLogin",
                   require_sso as "requireSso", allowed_ip_ranges as "allowedIpRanges",
                   blocked_ip_ranges as "blockedIpRanges", data_residency_region as "dataResidencyRegion",
                   restrict_exports as "restrictExports", restrict_api_tokens as "restrictApiTokens",
                   audit_log_retention_days as "auditLogRetentionDays", metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.status, x.mfaMode, x.sessionTimeoutMinutes,
          x.maxConcurrentSessions, x.allowPasswordLogin, x.requireSso, JSON.stringify(x.allowedIpRanges || []),
          JSON.stringify(x.blockedIpRanges || []), x.dataResidencyRegion, x.restrictExports,
          x.restrictApiTokens, x.auditLogRetentionDays, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async updatePolicy(tenantId, id, input) {
      const existing = await this.findPolicyById(tenantId, id);
      if (!existing) return null;
      const x = normalizeTenantSecurityPolicyInput({ ...existing, ...input });
      const result = await store.query(
        `UPDATE tenant_security_policies
         SET name=$3, description=$4, status=$5, mfa_mode=$6, session_timeout_minutes=$7,
             max_concurrent_sessions=$8, allow_password_login=$9, require_sso=$10,
             allowed_ip_ranges=$11::jsonb, blocked_ip_ranges=$12::jsonb,
             data_residency_region=$13, restrict_exports=$14, restrict_api_tokens=$15,
             audit_log_retention_days=$16, metadata=$17::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", code, name, description, status,
                   mfa_mode as "mfaMode", session_timeout_minutes as "sessionTimeoutMinutes",
                   max_concurrent_sessions as "maxConcurrentSessions", allow_password_login as "allowPasswordLogin",
                   require_sso as "requireSso", allowed_ip_ranges as "allowedIpRanges",
                   blocked_ip_ranges as "blockedIpRanges", data_residency_region as "dataResidencyRegion",
                   restrict_exports as "restrictExports", restrict_api_tokens as "restrictApiTokens",
                   audit_log_retention_days as "auditLogRetentionDays", metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.name, x.description, x.status, x.mfaMode, x.sessionTimeoutMinutes,
          x.maxConcurrentSessions, x.allowPasswordLogin, x.requireSso, JSON.stringify(x.allowedIpRanges || []),
          JSON.stringify(x.blockedIpRanges || []), x.dataResidencyRegion, x.restrictExports,
          x.restrictApiTokens, x.auditLogRetentionDays, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0] || null;
    },
    async evaluate(tenantId, context = {}) {
      const policy = context.policyId ? await this.findPolicyById(tenantId, context.policyId) : await this.getActivePolicy(tenantId);
      const decision = evaluateTenantAccess(policy, context);
      const result = await store.query(
        `INSERT INTO tenant_access_decisions
         (tenant_id, policy_id, user_id, action, ip_address, result, reason, challenges, context)
         VALUES ($1,NULLIF($2,'')::uuid,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb)
         RETURNING id::text, tenant_id as "tenantId", policy_id::text as "policyId",
                   user_id as "userId", action, ip_address as "ipAddress", result, reason, challenges, context,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, policy ? policy.id : '', context.userId || '', context.action || '', context.ipAddress || '',
          decision.result, decision.reason, JSON.stringify(decision.challenges || []), JSON.stringify(context || {})]
      );
      return result.rows[0];
    },
    async listDecisions(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      const map = { userId: 'user_id', result: 'result', action: 'action' };
      for (const [key, column] of Object.entries(map)) {
        if (filters[key]) {
          params.push(filters[key]);
          where += ` AND ${column} = $${params.length}`;
        }
      }
      const result = await store.query(`${decisionSelect} ${where} ORDER BY created_at DESC`, params);
      return result.rows;
    },
    async summary(tenantId) {
      const policy = await this.getActivePolicy(tenantId);
      return policy ? buildPolicySummary(policy) : null;
    }
  };
}

module.exports = { createTenantSecurityRepository };
