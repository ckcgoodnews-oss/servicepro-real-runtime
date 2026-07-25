const { makeId, now } = require('../services/id');
const { issueAccessToken, hashToken, issueOpaqueToken } = require('../services/tokenService');

const DEFAULT_MODULES = ['operations', 'crm', 'assets', 'inventory', 'billing', 'analytics', 'knowledge', 'communications', 'marketplace', 'administration'];

function createTenantManagementCenterRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

// ============================================================
// JSON Implementation
// ============================================================
function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }
  function ensure(d) {
    d.impersonationSessions ||= [];
    d.billingEvents ||= [];
    d.tenantModules ||= [];
    d.tenantOAuthClients ||= [];
    d.tenantWebhooks ||= [];
    d.tenantUsageSnapshots ||= [];
    return d;
  }

  function auditLog(d, tenantId, actorId, action, metadata = {}) {
    d.tenantAdminAudit ||= [];
    d.tenantAdminAudit.push({ id: makeId('tmc_audit'), tenantId, actorId, action, metadata, createdAt: now() });
  }

  return {
    // ---- Sprint 3: Impersonation ----
    async startImpersonation(adminId, adminEmail, tenantId, ownerId, opts = {}) {
      const d = ensure(data());
      const users = d.users || [];
      const owner = users.find(u => u.tenantId === tenantId && u.id === ownerId);
      if (!owner) return null;

      const token = issueAccessToken({
        userId: owner.id,
        tenantId,
        email: owner.email,
        roles: opts.mode === 'read_only' ? ['read_only'] : (owner.roles || ['owner']),
        permissions: opts.mode === 'read_only'
          ? (owner.permissions || []).filter(p => p.endsWith('.read'))
          : (owner.permissions || []),
        sessionId: `imp_${makeId('session')}`
      });

      const session = {
        id: makeId('imp'),
        adminUserId: adminId,
        adminEmail,
        targetTenantId: tenantId,
        targetOwnerId: ownerId,
        targetOwnerEmail: owner.email || '',
        mode: opts.mode || 'full',
        tokenHash: hashToken(token),
        startedAt: now(),
        endedAt: '',
        endedReason: '',
        ipAddress: opts.ipAddress || '',
        userAgent: opts.userAgent || ''
      };
      d.impersonationSessions.push(session);
      auditLog(d, tenantId, adminId, 'impersonation.start', { ownerId, mode: session.mode });
      save(d);
      return { session, token };
    },

    async endImpersonation(sessionId, reason, actorId) {
      const d = ensure(data());
      const session = d.impersonationSessions.find(s => s.id === sessionId && !s.endedAt);
      if (!session) return null;
      session.endedAt = now();
      session.endedReason = reason || 'manual';
      auditLog(d, session.targetTenantId, actorId, 'impersonation.end', { sessionId, reason });
      save(d);
      return session;
    },

    async listImpersonationSessions(tenantId) {
      const d = ensure(data());
      return d.impersonationSessions
        .filter(s => !tenantId || s.targetTenantId === tenantId)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        .slice(0, 100);
    },

    async terminateAllSessions(tenantId, actorId) {
      const d = ensure(data());
      let count = 0;
      for (const s of d.impersonationSessions) {
        if (s.targetTenantId === tenantId && !s.endedAt) {
          s.endedAt = now();
          s.endedReason = 'emergency_terminate';
          count++;
        }
      }
      auditLog(d, tenantId, actorId, 'impersonation.terminate_all', { count });
      save(d);
      return { terminated: count };
    },

    // ---- Sprint 4: Subscription & Billing ----
    async updateSubscription(tenantId, input, actorId) {
      const d = ensure(data());
      d.tenantAdminRecords ||= [];
      let record = d.tenantAdminRecords.find(r => r.tenantId === tenantId);
      if (!record) {
        record = { tenantId, createdAt: now() };
        d.tenantAdminRecords.push(record);
      }

      if (input.subscriptionPlan !== undefined) record.subscriptionPlan = input.subscriptionPlan;
      if (input.subscriptionStatus !== undefined) record.subscriptionStatus = input.subscriptionStatus;
      if (input.subscriptionSeats !== undefined) record.subscriptionSeats = Number(input.subscriptionSeats);
      if (input.subscriptionExpiresAt !== undefined) record.subscriptionExpiresAt = input.subscriptionExpiresAt;
      if (input.billingProvider !== undefined) record.billingProvider = input.billingProvider;
      if (input.billingExternalId !== undefined) record.billingExternalId = input.billingExternalId;
      if (input.billingEmail !== undefined) record.billingEmail = input.billingEmail;
      if (input.usageLimits !== undefined) record.usageLimits = input.usageLimits;
      record.updatedAt = now();
      auditLog(d, tenantId, actorId, 'subscription.update', input);
      save(d);
      return record;
    },

    async addBillingEvent(tenantId, input, actorId) {
      const d = ensure(data());
      const event = {
        id: makeId('billing'),
        tenantId,
        eventType: input.eventType || 'charge',
        amountCents: Number(input.amountCents || 0),
        currency: input.currency || 'USD',
        description: input.description || '',
        externalId: input.externalId || '',
        metadata: input.metadata || {},
        createdAt: now()
      };
      d.billingEvents.push(event);
      auditLog(d, tenantId, actorId, 'billing.event', { eventType: event.eventType, amountCents: event.amountCents });
      save(d);
      return event;
    },

    async listBillingEvents(tenantId) {
      const d = ensure(data());
      return d.billingEvents
        .filter(e => e.tenantId === tenantId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 200);
    },

    // ---- Sprint 5: Feature/Module Management ----
    async listModules(tenantId) {
      const d = ensure(data());
      return d.tenantModules.filter(m => m.tenantId === tenantId);
    },

    async setModule(tenantId, moduleKey, input, actorId) {
      const d = ensure(data());
      let mod = d.tenantModules.find(m => m.tenantId === tenantId && m.moduleKey === moduleKey);
      if (!mod) {
        mod = { id: makeId('module'), tenantId, moduleKey, enabled: true, isBeta: false, config: {}, enabledAt: now(), disabledAt: '' };
        d.tenantModules.push(mod);
      }
      if (input.enabled !== undefined) {
        mod.enabled = Boolean(input.enabled);
        if (mod.enabled) { mod.enabledAt = now(); mod.disabledAt = ''; }
        else { mod.disabledAt = now(); }
      }
      if (input.isBeta !== undefined) mod.isBeta = Boolean(input.isBeta);
      if (input.config !== undefined) mod.config = input.config;
      auditLog(d, tenantId, actorId, 'module.set', { moduleKey, enabled: mod.enabled });
      save(d);
      return mod;
    },

    // ---- Sprint 6: White-label & Branding ----
    async updateBranding(tenantId, input, actorId) {
      const d = ensure(data());
      d.tenantAdminRecords ||= [];
      let record = d.tenantAdminRecords.find(r => r.tenantId === tenantId);
      if (!record) { record = { tenantId, createdAt: now() }; d.tenantAdminRecords.push(record); }
      record.branding = { ...(record.branding || {}), ...input };
      record.updatedAt = now();
      auditLog(d, tenantId, actorId, 'branding.update', input);
      save(d);
      return record.branding;
    },

    async updateWhiteLabel(tenantId, input, actorId) {
      const d = ensure(data());
      d.tenantAdminRecords ||= [];
      let record = d.tenantAdminRecords.find(r => r.tenantId === tenantId);
      if (!record) { record = { tenantId, createdAt: now() }; d.tenantAdminRecords.push(record); }
      record.whiteLabel = { ...(record.whiteLabel || {}), ...input };
      record.updatedAt = now();
      auditLog(d, tenantId, actorId, 'white_label.update', input);
      save(d);
      return record.whiteLabel;
    },

    // ---- Sprint 7: OAuth & Webhooks ----
    async createOAuthClient(tenantId, input, actorId) {
      const d = ensure(data());
      const clientId = `sp_${makeId('client')}`;
      const clientSecret = issueOpaqueToken(32);
      const client = {
        id: makeId('oauth'),
        tenantId,
        clientName: input.clientName || 'OAuth Client',
        clientId,
        clientSecretHash: hashToken(clientSecret),
        redirectUris: input.redirectUris || [],
        scopes: input.scopes || [],
        rateLimitRpm: Number(input.rateLimitRpm || 60),
        revokedAt: '',
        createdAt: now()
      };
      d.tenantOAuthClients.push(client);
      auditLog(d, tenantId, actorId, 'oauth_client.create', { clientName: client.clientName });
      save(d);
      return { ...client, clientSecret, clientSecretHash: undefined };
    },

    async listOAuthClients(tenantId) {
      const d = ensure(data());
      return d.tenantOAuthClients
        .filter(c => c.tenantId === tenantId && !c.revokedAt)
        .map(({ clientSecretHash, ...c }) => c);
    },

    async revokeOAuthClient(tenantId, clientId, actorId) {
      const d = ensure(data());
      const client = d.tenantOAuthClients.find(c => c.tenantId === tenantId && c.id === clientId && !c.revokedAt);
      if (!client) return null;
      client.revokedAt = now();
      auditLog(d, tenantId, actorId, 'oauth_client.revoke', { clientId });
      save(d);
      return { ...client, clientSecretHash: undefined };
    },

    async createWebhook(tenantId, input, actorId) {
      const d = ensure(data());
      const secret = issueOpaqueToken(24);
      const webhook = {
        id: makeId('webhook'),
        tenantId,
        url: input.url || '',
        events: input.events || [],
        secretHash: hashToken(secret),
        active: true,
        lastTriggeredAt: '',
        failureCount: 0,
        createdAt: now()
      };
      d.tenantWebhooks.push(webhook);
      auditLog(d, tenantId, actorId, 'webhook.create', { url: webhook.url });
      save(d);
      return { ...webhook, secret, secretHash: undefined };
    },

    async listWebhooks(tenantId) {
      const d = ensure(data());
      return d.tenantWebhooks
        .filter(w => w.tenantId === tenantId)
        .map(({ secretHash, ...w }) => w);
    },

    async deleteWebhook(tenantId, webhookId, actorId) {
      const d = ensure(data());
      const idx = d.tenantWebhooks.findIndex(w => w.tenantId === tenantId && w.id === webhookId);
      if (idx < 0) return null;
      const removed = d.tenantWebhooks.splice(idx, 1)[0];
      auditLog(d, tenantId, actorId, 'webhook.delete', { webhookId });
      save(d);
      return { ...removed, secretHash: undefined };
    },

    // ---- Sprint 8: Usage & Monitoring ----
    async getUsageStats(tenantId) {
      const d = data();
      const users = (d.users || []).filter(u => u.tenantId === tenantId);
      const customers = (d.customers || []).filter(c => c.tenantId === tenantId);
      const jobs = (d.jobs || []).filter(j => j.tenantId === tenantId);
      const assets = (d.customerAssets || []).filter(a => a.tenantId === tenantId);
      const media = (d.mediaAttachments || []).filter(m => m.tenantId === tenantId);
      const storageBytes = media.reduce((sum, m) => sum + Number(m.sizeBytes || m.size_bytes || 0), 0);
      const logins = (d.authEvents || []).filter(e => e.tenantId === tenantId && e.eventType === 'login');
      const errors = (d.securityEvents || []).filter(e => e.tenantId === tenantId && e.severity === 'error');
      return {
        usersCount: users.length,
        customersCount: customers.length,
        jobsCount: jobs.length,
        assetsCount: assets.length,
        storageBytes,
        mediaCount: media.length,
        loginCount: logins.length,
        errorCount: errors.length,
        snapshotAt: now()
      };
    },

    async getHealthCheck(tenantId) {
      const d = data();
      const usage = await this.getUsageStats(tenantId);
      const record = (d.tenantAdminRecords || []).find(r => r.tenantId === tenantId) || {};
      const issues = [];
      if (record.status && record.status !== 'active') issues.push(`Tenant status: ${record.status}`);
      if (usage.usersCount === 0) issues.push('No users configured');
      if (usage.customersCount === 0) issues.push('No customer records');
      if (usage.errorCount > 10) issues.push(`High error count: ${usage.errorCount}`);
      const score = Math.max(0, 100 - issues.length * 20);
      return { score, status: score >= 80 ? 'healthy' : score >= 50 ? 'attention' : 'critical', issues, usage, checkedAt: now() };
    },

    // ---- Sprint 9: Full Audit Center ----
    async searchAudit(tenantId, filters = {}) {
      const d = ensure(data());
      let results = (d.tenantAdminAudit || []).filter(e => e.tenantId === tenantId);
      if (filters.action) results = results.filter(e => e.action.includes(filters.action));
      if (filters.actorId) results = results.filter(e => e.actorId === filters.actorId);
      if (filters.from) results = results.filter(e => e.createdAt >= filters.from);
      if (filters.to) results = results.filter(e => e.createdAt <= filters.to);
      return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, Number(filters.limit || 200));
    },

    async exportAudit(tenantId, filters = {}) {
      return this.searchAudit(tenantId, { ...filters, limit: 10000 });
    },

    // ---- Sprint 10: Recovery ----
    async listDeletedTenants() {
      const d = data();
      return (d.tenantAdminRecords || [])
        .filter(r => r.deletedAt || r.status === 'deleted')
        .map(r => ({ tenantId: r.tenantId, status: r.status, deletedAt: r.deletedAt, archivedAt: r.archivedAt }));
    },

    async listDeletedOwners(tenantId) {
      const d = data();
      return (d.users || [])
        .filter(u => u.tenantId === tenantId && u.deletedAt)
        .map(u => ({ id: u.id, email: u.email, name: u.name, deletedAt: u.deletedAt }));
    },

    async permanentPurge(tenantId, actorId) {
      const d = ensure(data());
      const record = (d.tenantAdminRecords || []).find(r => r.tenantId === tenantId);
      if (!record || record.status !== 'deleted') return null;
      record.permanentlyPurgedAt = now();
      record.status = 'purged';
      // Remove tenant data across collections
      for (const key of ['users', 'customers', 'jobs', 'customerAssets', 'invoices', 'services', 'estimates', 'payments']) {
        if (d[key]) d[key] = d[key].filter(r => r.tenantId !== tenantId);
      }
      auditLog(d, tenantId, actorId, 'tenant.permanent_purge', {});
      save(d);
      return record;
    },

    // ---- Sprint 1: Create tenant ----
    async createTenant(input, actorId) {
      const d = ensure(data());
      // Delegate workspace creation to workspaces repo pattern
      d.tenants ||= [];
      const tenantKey = input.tenantId || `tenant_${makeId('t')}`;
      if (d.tenants.some(t => t.tenantKey === tenantKey)) return null;
      const tenant = { id: makeId('tenant'), tenantKey, name: input.name || tenantKey, createdAt: now() };
      d.tenants.push(tenant);

      // Create admin record
      const record = {
        tenantId: tenantKey,
        status: 'active',
        plan: input.plan || 'free',
        subscriptionPlan: input.subscriptionPlan || 'free',
        subscriptionStatus: 'active',
        subscriptionSeats: Number(input.seats || 5),
        tags: input.tags || [],
        notes: input.notes || '',
        featureFlags: input.featureFlags || {},
        branding: {},
        whiteLabel: {},
        storageBytes: 0,
        usageLimits: input.usageLimits || {},
        createdAt: now(),
        updatedAt: now()
      };
      d.tenantAdminRecords ||= [];
      d.tenantAdminRecords.push(record);
      auditLog(d, tenantKey, actorId, 'tenant.create', { name: tenant.name });
      save(d);
      return { ...tenant, ...record };
    },

    // ---- Sprint 1: Transfer Owner ----
    async transferOwner(ownerId, fromTenantId, toTenantId, actorId) {
      const d = data();
      const user = (d.users || []).find(u => u.id === ownerId && u.tenantId === fromTenantId);
      if (!user) return null;
      user.tenantId = toTenantId;
      user.updatedAt = now();
      auditLog(d, fromTenantId, actorId, 'owner.transfer_out', { ownerId, toTenantId });
      auditLog(d, toTenantId, actorId, 'owner.transfer_in', { ownerId, fromTenantId });
      save(d);
      return user;
    },

    // ---- Sprint 2: Bulk Operations ----
    async bulkUpdateStatus(tenantIds, status, actorId) {
      const d = ensure(data());
      const results = [];
      for (const tenantId of tenantIds) {
        let record = (d.tenantAdminRecords || []).find(r => r.tenantId === tenantId);
        if (!record) { record = { tenantId, createdAt: now() }; d.tenantAdminRecords.push(record); }
        record.status = status;
        record.updatedAt = now();
        if (status === 'archived') record.archivedAt = now();
        if (status === 'deleted') record.deletedAt = now();
        if (status === 'active') { record.archivedAt = ''; record.deletedAt = ''; }
        auditLog(d, tenantId, actorId, 'tenant.bulk_status', { status });
        results.push(record);
      }
      save(d);
      return results;
    }
  };
}

// ============================================================
// PostgreSQL Implementation
// ============================================================
function createPostgresImpl(store) {
  async function q(sql, params = []) { return store.query(sql, params); }

  async function auditLog(tenantId, actorId, action, metadata = {}) {
    await q(`INSERT INTO platform_tenant_admin_audit (tenant_id, actor_id, action, metadata) VALUES ($1,$2,$3,$4::jsonb)`,
      [tenantId, actorId || '', action, JSON.stringify(metadata)]);
  }

  return {
    // ---- Sprint 3: Impersonation ----
    async startImpersonation(adminId, adminEmail, tenantId, ownerId, opts = {}) {
      const owner = (await q(`SELECT id::text, email, roles, tenant_id AS "tenantId" FROM runtime_users WHERE tenant_id=$1 AND id=$2`, [tenantId, ownerId])).rows[0];
      if (!owner) return null;
      const roles = owner.roles || ['owner'];
      const token = issueAccessToken({
        userId: owner.id,
        tenantId,
        email: owner.email,
        roles: opts.mode === 'read_only' ? ['read_only'] : roles,
        permissions: [],
        sessionId: `imp_${makeId('session')}`
      });
      const session = (await q(
        `INSERT INTO platform_impersonation_sessions (admin_user_id, admin_email, target_tenant_id, target_owner_id, target_owner_email, mode, token_hash, ip_address, user_agent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id::text, admin_user_id AS "adminUserId", admin_email AS "adminEmail", target_tenant_id AS "targetTenantId", target_owner_id AS "targetOwnerId", target_owner_email AS "targetOwnerEmail", mode, started_at AS "startedAt"`,
        [adminId, adminEmail, tenantId, ownerId, owner.email || '', opts.mode || 'full', hashToken(token), opts.ipAddress || '', opts.userAgent || '']
      )).rows[0];
      await auditLog(tenantId, adminId, 'impersonation.start', { ownerId, mode: opts.mode || 'full' });
      return { session, token };
    },

    async endImpersonation(sessionId, reason, actorId) {
      const row = (await q(
        `UPDATE platform_impersonation_sessions SET ended_at=now(), ended_reason=$2 WHERE id=$1::uuid AND ended_at IS NULL
         RETURNING id::text, target_tenant_id AS "targetTenantId", ended_at AS "endedAt"`,
        [sessionId, reason || 'manual']
      )).rows[0];
      if (row) await auditLog(row.targetTenantId, actorId, 'impersonation.end', { sessionId, reason });
      return row || null;
    },

    async listImpersonationSessions(tenantId) {
      const where = tenantId ? 'WHERE target_tenant_id=$1' : '';
      const params = tenantId ? [tenantId] : [];
      return (await q(
        `SELECT id::text, admin_user_id AS "adminUserId", admin_email AS "adminEmail", target_tenant_id AS "targetTenantId",
                target_owner_id AS "targetOwnerId", target_owner_email AS "targetOwnerEmail", mode,
                started_at AS "startedAt", ended_at AS "endedAt", ended_reason AS "endedReason"
         FROM platform_impersonation_sessions ${where} ORDER BY started_at DESC LIMIT 100`, params
      )).rows;
    },

    async terminateAllSessions(tenantId, actorId) {
      const result = await q(
        `UPDATE platform_impersonation_sessions SET ended_at=now(), ended_reason='emergency_terminate' WHERE target_tenant_id=$1 AND ended_at IS NULL`,
        [tenantId]
      );
      await auditLog(tenantId, actorId, 'impersonation.terminate_all', { count: result.rowCount });
      return { terminated: result.rowCount };
    },

    // ---- Sprint 4: Subscription & Billing ----
    async updateSubscription(tenantId, input, actorId) {
      const fields = [];
      const values = [tenantId];
      let idx = 2;
      for (const [key, col] of Object.entries({
        subscriptionPlan: 'subscription_plan', subscriptionStatus: 'subscription_status',
        subscriptionSeats: 'subscription_seats', subscriptionExpiresAt: 'subscription_expires_at',
        billingProvider: 'billing_provider', billingExternalId: 'billing_external_id',
        billingEmail: 'billing_email', usageLimits: 'usage_limits'
      })) {
        if (input[key] !== undefined) {
          fields.push(`${col}=$${idx}`);
          values.push(col === 'usage_limits' ? JSON.stringify(input[key]) : input[key]);
          idx++;
        }
      }
      if (!fields.length) return null;
      fields.push('updated_at=now()');

      const row = (await q(
        `UPDATE platform_tenant_admin_records SET ${fields.join(', ')} WHERE tenant_id=$1
         RETURNING tenant_id AS "tenantId", subscription_plan AS "subscriptionPlan", subscription_status AS "subscriptionStatus",
                  subscription_seats AS "subscriptionSeats", subscription_expires_at AS "subscriptionExpiresAt",
                  billing_provider AS "billingProvider", billing_external_id AS "billingExternalId",
                  billing_email AS "billingEmail", usage_limits AS "usageLimits"`,
        values
      )).rows[0];
      await auditLog(tenantId, actorId, 'subscription.update', input);
      return row;
    },

    async addBillingEvent(tenantId, input, actorId) {
      const row = (await q(
        `INSERT INTO platform_billing_events (tenant_id, event_type, amount_cents, currency, description, external_id, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
         RETURNING id::text, tenant_id AS "tenantId", event_type AS "eventType", amount_cents AS "amountCents",
                   currency, description, external_id AS "externalId", created_at AS "createdAt"`,
        [tenantId, input.eventType || 'charge', Number(input.amountCents || 0), input.currency || 'USD',
         input.description || '', input.externalId || '', JSON.stringify(input.metadata || {})]
      )).rows[0];
      await auditLog(tenantId, actorId, 'billing.event', { eventType: row.eventType, amountCents: row.amountCents });
      return row;
    },

    async listBillingEvents(tenantId) {
      return (await q(
        `SELECT id::text, tenant_id AS "tenantId", event_type AS "eventType", amount_cents AS "amountCents",
                currency, description, external_id AS "externalId", metadata, created_at AS "createdAt"
         FROM platform_billing_events WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 200`, [tenantId]
      )).rows;
    },

    // ---- Sprint 5: Feature/Module Management ----
    async listModules(tenantId) {
      return (await q(
        `SELECT id::text, tenant_id AS "tenantId", module_key AS "moduleKey", enabled, is_beta AS "isBeta",
                config, enabled_at AS "enabledAt", disabled_at AS "disabledAt"
         FROM platform_tenant_modules WHERE tenant_id=$1 ORDER BY module_key`, [tenantId]
      )).rows;
    },

    async setModule(tenantId, moduleKey, input, actorId) {
      const enabled = input.enabled !== undefined ? Boolean(input.enabled) : true;
      const row = (await q(
        `INSERT INTO platform_tenant_modules (tenant_id, module_key, enabled, is_beta, config, enabled_at, disabled_at)
         VALUES ($1,$2,$3,$4,$5::jsonb, CASE WHEN $3 THEN now() ELSE NULL END, CASE WHEN NOT $3 THEN now() ELSE NULL END)
         ON CONFLICT (tenant_id, module_key) DO UPDATE SET enabled=EXCLUDED.enabled, is_beta=EXCLUDED.is_beta, config=EXCLUDED.config,
           enabled_at=CASE WHEN EXCLUDED.enabled THEN now() ELSE platform_tenant_modules.enabled_at END,
           disabled_at=CASE WHEN NOT EXCLUDED.enabled THEN now() ELSE NULL END
         RETURNING id::text, tenant_id AS "tenantId", module_key AS "moduleKey", enabled, is_beta AS "isBeta", config`,
        [tenantId, moduleKey, enabled, Boolean(input.isBeta), JSON.stringify(input.config || {})]
      )).rows[0];
      await auditLog(tenantId, actorId, 'module.set', { moduleKey, enabled });
      return row;
    },

    // ---- Sprint 6: White-label & Branding ----
    async updateBranding(tenantId, input, actorId) {
      const row = (await q(
        `UPDATE platform_tenant_admin_records SET branding = branding || $2::jsonb, updated_at=now() WHERE tenant_id=$1
         RETURNING branding`, [tenantId, JSON.stringify(input)]
      )).rows[0];
      await auditLog(tenantId, actorId, 'branding.update', input);
      return row?.branding || input;
    },

    async updateWhiteLabel(tenantId, input, actorId) {
      const row = (await q(
        `UPDATE platform_tenant_admin_records SET white_label = white_label || $2::jsonb, updated_at=now() WHERE tenant_id=$1
         RETURNING white_label AS "whiteLabel"`, [tenantId, JSON.stringify(input)]
      )).rows[0];
      await auditLog(tenantId, actorId, 'white_label.update', input);
      return row?.whiteLabel || input;
    },

    // ---- Sprint 7: OAuth & Webhooks ----
    async createOAuthClient(tenantId, input, actorId) {
      const clientId = `sp_${makeId('client')}`;
      const clientSecret = issueOpaqueToken(32);
      const row = (await q(
        `INSERT INTO platform_tenant_oauth_clients (tenant_id, client_name, client_id, client_secret_hash, redirect_uris, scopes, rate_limit_rpm)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7)
         RETURNING id::text, tenant_id AS "tenantId", client_name AS "clientName", client_id AS "clientId", redirect_uris AS "redirectUris", scopes, rate_limit_rpm AS "rateLimitRpm", created_at AS "createdAt"`,
        [tenantId, input.clientName || 'OAuth Client', clientId, hashToken(clientSecret),
         JSON.stringify(input.redirectUris || []), JSON.stringify(input.scopes || []), Number(input.rateLimitRpm || 60)]
      )).rows[0];
      await auditLog(tenantId, actorId, 'oauth_client.create', { clientName: row.clientName });
      return { ...row, clientSecret };
    },

    async listOAuthClients(tenantId) {
      return (await q(
        `SELECT id::text, tenant_id AS "tenantId", client_name AS "clientName", client_id AS "clientId",
                redirect_uris AS "redirectUris", scopes, rate_limit_rpm AS "rateLimitRpm", created_at AS "createdAt"
         FROM platform_tenant_oauth_clients WHERE tenant_id=$1 AND revoked_at IS NULL`, [tenantId]
      )).rows;
    },

    async revokeOAuthClient(tenantId, clientId, actorId) {
      const row = (await q(
        `UPDATE platform_tenant_oauth_clients SET revoked_at=now() WHERE tenant_id=$1 AND id=$2::uuid AND revoked_at IS NULL
         RETURNING id::text, client_name AS "clientName", revoked_at AS "revokedAt"`, [tenantId, clientId]
      )).rows[0];
      if (row) await auditLog(tenantId, actorId, 'oauth_client.revoke', { clientId });
      return row || null;
    },

    async createWebhook(tenantId, input, actorId) {
      const secret = issueOpaqueToken(24);
      const row = (await q(
        `INSERT INTO platform_tenant_webhooks (tenant_id, url, events, secret_hash, active)
         VALUES ($1,$2,$3::jsonb,$4,$5)
         RETURNING id::text, tenant_id AS "tenantId", url, events, active, created_at AS "createdAt"`,
        [tenantId, input.url || '', JSON.stringify(input.events || []), hashToken(secret), true]
      )).rows[0];
      await auditLog(tenantId, actorId, 'webhook.create', { url: row.url });
      return { ...row, secret };
    },

    async listWebhooks(tenantId) {
      return (await q(
        `SELECT id::text, tenant_id AS "tenantId", url, events, active, last_triggered_at AS "lastTriggeredAt",
                failure_count AS "failureCount", created_at AS "createdAt"
         FROM platform_tenant_webhooks WHERE tenant_id=$1`, [tenantId]
      )).rows;
    },

    async deleteWebhook(tenantId, webhookId, actorId) {
      const row = (await q(
        `DELETE FROM platform_tenant_webhooks WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text, url`,
        [tenantId, webhookId]
      )).rows[0];
      if (row) await auditLog(tenantId, actorId, 'webhook.delete', { webhookId });
      return row || null;
    },

    // ---- Sprint 8: Usage & Monitoring ----
    async getUsageStats(tenantId) {
      const counts = {};
      for (const [key, table] of Object.entries({ usersCount: 'runtime_users', customersCount: 'customers', jobsCount: 'jobs', assetsCount: 'customer_assets' })) {
        try { counts[key] = Number((await q(`SELECT count(*)::int AS c FROM ${table} WHERE tenant_id=$1`, [tenantId])).rows[0]?.c || 0); }
        catch { counts[key] = 0; }
      }
      try { counts.storageBytes = Number((await q(`SELECT COALESCE(sum(size_bytes),0)::bigint AS b FROM media_attachments WHERE tenant_id=$1`, [tenantId])).rows[0]?.b || 0); }
      catch { counts.storageBytes = 0; }
      try { counts.loginCount = Number((await q(`SELECT count(*)::int AS c FROM auth_events WHERE tenant_id=$1 AND event_type='login'`, [tenantId])).rows[0]?.c || 0); }
      catch { counts.loginCount = 0; }
      try { counts.errorCount = Number((await q(`SELECT count(*)::int AS c FROM security_events WHERE tenant_id=$1 AND severity='error'`, [tenantId])).rows[0]?.c || 0); }
      catch { counts.errorCount = 0; }
      counts.snapshotAt = now();
      return counts;
    },

    async getHealthCheck(tenantId) {
      const usage = await this.getUsageStats(tenantId);
      const record = (await q(`SELECT status, health_score AS "healthScore" FROM platform_tenant_admin_records WHERE tenant_id=$1`, [tenantId])).rows[0] || {};
      const issues = [];
      if (record.status && record.status !== 'active') issues.push(`Tenant status: ${record.status}`);
      if (usage.usersCount === 0) issues.push('No users configured');
      if (usage.customersCount === 0) issues.push('No customer records');
      if (usage.errorCount > 10) issues.push(`High error count: ${usage.errorCount}`);
      const score = Math.max(0, 100 - issues.length * 20);
      await q(`UPDATE platform_tenant_admin_records SET health_score=$2, health_issues=$3::jsonb, last_health_check_at=now() WHERE tenant_id=$1`,
        [tenantId, score, JSON.stringify(issues)]);
      return { score, status: score >= 80 ? 'healthy' : score >= 50 ? 'attention' : 'critical', issues, usage, checkedAt: now() };
    },

    // ---- Sprint 9: Full Audit Center ----
    async searchAudit(tenantId, filters = {}) {
      let sql = `SELECT id::text, tenant_id AS "tenantId", actor_id AS "actorId", action, metadata, created_at AS "createdAt" FROM platform_tenant_admin_audit WHERE tenant_id=$1`;
      const params = [tenantId];
      let idx = 2;
      if (filters.action) { sql += ` AND action ILIKE $${idx}`; params.push(`%${filters.action}%`); idx++; }
      if (filters.actorId) { sql += ` AND actor_id=$${idx}`; params.push(filters.actorId); idx++; }
      if (filters.from) { sql += ` AND created_at >= $${idx}::timestamptz`; params.push(filters.from); idx++; }
      if (filters.to) { sql += ` AND created_at <= $${idx}::timestamptz`; params.push(filters.to); idx++; }
      sql += ` ORDER BY created_at DESC LIMIT $${idx}`;
      params.push(Number(filters.limit || 200));
      return (await q(sql, params)).rows;
    },

    async exportAudit(tenantId, filters = {}) {
      return this.searchAudit(tenantId, { ...filters, limit: 10000 });
    },

    // ---- Sprint 10: Recovery ----
    async listDeletedTenants() {
      return (await q(
        `SELECT tenant_id AS "tenantId", status, deleted_at AS "deletedAt", archived_at AS "archivedAt"
         FROM platform_tenant_admin_records WHERE deleted_at IS NOT NULL OR status='deleted' ORDER BY deleted_at DESC`
      )).rows;
    },

    async listDeletedOwners(tenantId) {
      try {
        return (await q(
          `SELECT id::text, email, name, deleted_at AS "deletedAt" FROM runtime_users WHERE tenant_id=$1 AND deleted_at IS NOT NULL`,
          [tenantId]
        )).rows;
      } catch { return []; }
    },

    async permanentPurge(tenantId, actorId) {
      const record = (await q(`SELECT status FROM platform_tenant_admin_records WHERE tenant_id=$1`, [tenantId])).rows[0];
      if (!record || record.status !== 'deleted') return null;
      // Mark as purged (actual data removal is a cascading background job in production)
      await q(`UPDATE platform_tenant_admin_records SET status='purged', permanently_purged_at=now() WHERE tenant_id=$1`, [tenantId]);
      await auditLog(tenantId, actorId, 'tenant.permanent_purge', {});
      return { tenantId, status: 'purged', purgedAt: now() };
    },

    // ---- Sprint 1: Create tenant ----
    async createTenant(input, actorId) {
      const tenantKey = input.tenantId || `tenant_${makeId('t')}`;
      try {
        await q(`INSERT INTO tenants (tenant_key, name) VALUES ($1, $2)`, [tenantKey, input.name || tenantKey]);
      } catch { return null; }
      await q(
        `INSERT INTO platform_tenant_admin_records (tenant_id, status, plan, subscription_plan, subscription_status, subscription_seats, tags, notes, feature_flags, usage_limits)
         VALUES ($1,'active',$2,$3,'active',$4,$5::jsonb,$6,$7::jsonb,$8::jsonb)`,
        [tenantKey, input.plan || 'free', input.subscriptionPlan || 'free', Number(input.seats || 5),
         JSON.stringify(input.tags || []), input.notes || '', JSON.stringify(input.featureFlags || {}), JSON.stringify(input.usageLimits || {})]
      );
      await auditLog(tenantKey, actorId, 'tenant.create', { name: input.name });
      return { tenantId: tenantKey, name: input.name || tenantKey, status: 'active' };
    },

    // ---- Sprint 1: Transfer Owner ----
    async transferOwner(ownerId, fromTenantId, toTenantId, actorId) {
      const row = (await q(
        `UPDATE runtime_users SET tenant_id=$3, updated_at=now() WHERE id=$1 AND tenant_id=$2 RETURNING id::text, email, tenant_id AS "tenantId"`,
        [ownerId, fromTenantId, toTenantId]
      )).rows[0];
      if (!row) return null;
      await auditLog(fromTenantId, actorId, 'owner.transfer_out', { ownerId, toTenantId });
      await auditLog(toTenantId, actorId, 'owner.transfer_in', { ownerId, fromTenantId });
      return row;
    },

    // ---- Sprint 2: Bulk Operations ----
    async bulkUpdateStatus(tenantIds, status, actorId) {
      const results = [];
      for (const tenantId of tenantIds) {
        const extras = status === 'archived' ? ', archived_at=now()' : status === 'deleted' ? ', deleted_at=now()' : status === 'active' ? ', archived_at=NULL, deleted_at=NULL' : '';
        await q(`UPDATE platform_tenant_admin_records SET status=$2, updated_at=now() ${extras} WHERE tenant_id=$1`, [tenantId, status]);
        await auditLog(tenantId, actorId, 'tenant.bulk_status', { status });
        results.push({ tenantId, status });
      }
      return results;
    }
  };
}

module.exports = { createTenantManagementCenterRepository };
