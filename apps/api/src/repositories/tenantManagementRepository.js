const { makeId, now } = require('../services/id');
const { hashToken } = require('../services/tokenService');

const DEFAULT_MODULES = ['operations', 'crm', 'assets', 'inventory', 'billing', 'analytics', 'knowledge', 'communications', 'marketplace', 'administration'];
const DEFAULT_STATUS = 'active';

function ensure(data) {
  data.tenants ||= [];
  data.tenantAdminRecords ||= [];
  data.tenantDomains ||= [];
  data.tenantApiKeys ||= [];
  data.tenantAdminAudit ||= [];
  return data;
}

function cleanArray(value) {
  return Array.isArray(value) ? value.map(item => String(item || '').trim()).filter(Boolean) : [];
}

function publicKey() {
  return `spk_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function adminRecord(data, tenantId) {
  data.tenantAdminRecords ||= [];
  let row = data.tenantAdminRecords.find(item => item.tenantId === tenantId);
  if (!row) {
    row = {
      tenantId,
      status: DEFAULT_STATUS,
      plan: 'manual',
      tags: [],
      notes: '',
      featureFlags: {},
      branding: {},
      storageBytes: 0,
      archivedAt: '',
      deletedAt: '',
      createdAt: now(),
      updatedAt: now()
    };
    data.tenantAdminRecords.push(row);
  }
  return row;
}

function summarizeRows(data, tenantId) {
  const count = key => (data[key] || []).filter(row => row.tenantId === tenantId).length;
  const bytes = (data.mediaAttachments || [])
    .filter(row => row.tenantId === tenantId)
    .reduce((total, row) => total + Number(row.sizeBytes || row.size_bytes || 0), 0);
  return {
    owners: (data.users || []).filter(row => row.tenantId === tenantId && cleanArray(row.roles).includes('owner')).length,
    users: count('users'),
    customers: count('customers'),
    workOrders: count('jobs'),
    assets: count('customerAssets'),
    services: count('services'),
    invoices: count('invoices'),
    mediaBytes: bytes
  };
}

async function modulesFor(repositories, tenantId) {
  try {
    if (repositories.moduleAccess?.getTenantModules) return await repositories.moduleAccess.getTenantModules(tenantId);
  } catch {
    return DEFAULT_MODULES;
  }
  return DEFAULT_MODULES;
}

function createTenantManagementRepository(store) {
  if (store.type === 'json') return createJsonTenantManagementRepository(store);
  if (store.type === 'postgres') return createPostgresTenantManagementRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonTenantManagementRepository(store) {
  function audit(data, tenantId, actorId, action, metadata = {}) {
    const event = { id: makeId('tenant_audit'), tenantId, actorId: actorId || '', action, metadata, createdAt: now() };
    data.tenantAdminAudit.push(event);
    return event;
  }

  return {
    async list(repositories) {
      const data = ensure(store.read());
      const workspaces = repositories.workspaces?.list
        ? await repositories.workspaces.list()
        : [...new Set([
            ...(data.users || []).map(row => row.tenantId),
            ...(data.customers || []).map(row => row.tenantId),
            ...(data.jobs || []).map(row => row.tenantId),
            ...(data.tenantAdminRecords || []).map(row => row.tenantId),
            ...(data.tenantSettings || []).map(row => row.tenantId)
          ].filter(Boolean))]
          .sort()
          .map(tenantId => ({
            tenantId,
            name: tenantId
          }));
      return Promise.all(workspaces.map(async workspace => {
        const record = adminRecord(data, workspace.tenantId);
        const usage = summarizeRows(data, workspace.tenantId);
        const owners = (data.users || []).filter(row => row.tenantId === workspace.tenantId && cleanArray(row.roles).includes('owner'));
        return {
          ...workspace,
          ...record,
          modules: await modulesFor(repositories, workspace.tenantId),
          usage,
          owners: owners.map(owner => ({ id: owner.id, email: owner.email, name: owner.name, roles: owner.roles, deletedAt: owner.deletedAt || '' })),
          domains: data.tenantDomains.filter(row => row.tenantId === workspace.tenantId && !row.deletedAt),
          apiKeys: data.tenantApiKeys.filter(row => row.tenantId === workspace.tenantId && !row.revokedAt).map(({ keyHash, ...row }) => row),
          health: buildHealth(record, usage)
        };
      }));
    },
    async detail(tenantId, repositories) {
      return (await this.list(repositories)).find(row => row.tenantId === tenantId || row.id === tenantId) || null;
    },
    async update(tenantId, input, actorId) {
      const data = ensure(store.read());
      const record = adminRecord(data, tenantId);
      for (const field of ['status', 'plan', 'notes']) if (input[field] !== undefined) record[field] = String(input[field] || '');
      if (input.tags !== undefined) record.tags = cleanArray(input.tags);
      if (input.featureFlags !== undefined) record.featureFlags = input.featureFlags || {};
      if (input.branding !== undefined) record.branding = input.branding || {};
      if (input.storageBytes !== undefined) record.storageBytes = Number(input.storageBytes || 0);
      if (input.deletedAt !== undefined) record.deletedAt = input.deletedAt || '';
      if (input.archivedAt !== undefined) record.archivedAt = input.archivedAt || '';
      record.updatedAt = now();
      audit(data, tenantId, actorId, 'tenant.update', input);
      store.write(data);
      return record;
    },
    async archive(tenantId, actorId) {
      return this.update(tenantId, { status: 'archived', archivedAt: now() }, actorId);
    },
    async restore(tenantId, actorId) {
      return this.update(tenantId, { status: 'active', archivedAt: '', deletedAt: '' }, actorId);
    },
    async softDelete(tenantId, actorId) {
      return this.update(tenantId, { status: 'deleted', deletedAt: now() }, actorId);
    },
    async restoreOwner(tenantId, ownerId, actorId) {
      const data = ensure(store.read());
      const owner = (data.users || []).find(row => row.tenantId === tenantId && row.id === ownerId);
      if (!owner) return null;
      owner.deletedAt = '';
      owner.updatedAt = now();
      audit(data, tenantId, actorId, 'owner.restore', { ownerId });
      store.write(data);
      return owner;
    },
    async softDeleteOwner(tenantId, ownerId, actorId) {
      const data = ensure(store.read());
      const owner = (data.users || []).find(row => row.tenantId === tenantId && row.id === ownerId);
      if (!owner) return null;
      owner.deletedAt = now();
      owner.updatedAt = now();
      audit(data, tenantId, actorId, 'owner.soft_delete', { ownerId });
      store.write(data);
      return owner;
    },
    async saveDomain(tenantId, input, actorId) {
      const data = ensure(store.read());
      const row = { id: input.id || makeId('domain'), tenantId, domain: String(input.domain || '').trim().toLowerCase(), status: input.status || 'pending_dns', sslStatus: input.sslStatus || 'pending', createdAt: now(), updatedAt: now() };
      if (!row.domain) return null;
      const idx = data.tenantDomains.findIndex(item => item.id === row.id);
      if (idx >= 0) data.tenantDomains[idx] = { ...data.tenantDomains[idx], ...row, updatedAt: now() };
      else data.tenantDomains.push(row);
      audit(data, tenantId, actorId, 'domain.save', { domain: row.domain });
      store.write(data);
      return row;
    },
    async createApiKey(tenantId, input, actorId) {
      const data = ensure(store.read());
      const raw = publicKey();
      const row = { id: makeId('api_key'), tenantId, name: String(input.name || 'Platform API key').trim(), keyHash: hashToken(raw), lastFour: raw.slice(-4), createdAt: now(), expiresAt: input.expiresAt || '', revokedAt: '' };
      data.tenantApiKeys.push(row);
      audit(data, tenantId, actorId, 'api_key.create', { name: row.name });
      store.write(data);
      return { ...row, token: raw, keyHash: undefined };
    },
    async revokeApiKey(tenantId, keyId, actorId) {
      const data = ensure(store.read());
      const row = data.tenantApiKeys.find(item => item.tenantId === tenantId && item.id === keyId && !item.revokedAt);
      if (!row) return null;
      row.revokedAt = now();
      audit(data, tenantId, actorId, 'api_key.revoke', { keyId });
      store.write(data);
      return { ...row, keyHash: undefined };
    },
    async audit(tenantId) {
      const data = ensure(store.read());
      return data.tenantAdminAudit.filter(row => row.tenantId === tenantId).slice(-100).reverse();
    }
  };
}

function buildHealth(record, usage) {
  const issues = [];
  if (record.status !== 'active') issues.push(`Tenant is ${record.status}`);
  if (usage.users === 0) issues.push('No users');
  if (usage.customers === 0) issues.push('No customer data');
  return { score: Math.max(0, 100 - issues.length * 20), status: issues.length ? 'attention' : 'healthy', issues };
}

function createPostgresTenantManagementRepository(store) {
  async function query(sql, params = []) {
    return store.query(sql, params);
  }
  async function ensureTables() {
    await query(`
      CREATE TABLE IF NOT EXISTS platform_tenant_admin_records (
        tenant_id text PRIMARY KEY,
        status text NOT NULL DEFAULT 'active',
        plan text NOT NULL DEFAULT 'manual',
        tags jsonb NOT NULL DEFAULT '[]',
        notes text NOT NULL DEFAULT '',
        feature_flags jsonb NOT NULL DEFAULT '{}',
        branding jsonb NOT NULL DEFAULT '{}',
        storage_bytes bigint NOT NULL DEFAULT 0,
        archived_at timestamptz,
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS platform_tenant_domains (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id text NOT NULL,
        domain text NOT NULL,
        status text NOT NULL DEFAULT 'pending_dns',
        ssl_status text NOT NULL DEFAULT 'pending',
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS platform_tenant_api_keys (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id text NOT NULL,
        name text NOT NULL,
        key_hash text NOT NULL,
        last_four text NOT NULL,
        expires_at timestamptz,
        revoked_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS platform_tenant_admin_audit (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id text NOT NULL,
        actor_id text NOT NULL DEFAULT '',
        action text NOT NULL,
        metadata jsonb NOT NULL DEFAULT '{}',
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  }
  async function audit(tenantId, actorId, action, metadata = {}) {
    await ensureTables();
    await query(`INSERT INTO platform_tenant_admin_audit (tenant_id, actor_id, action, metadata) VALUES ($1,$2,$3,$4::jsonb)`, [tenantId, actorId || '', action, JSON.stringify(metadata || {})]);
  }
  return {
    async list(repositories) {
      await ensureTables();
      const workspaces = repositories.workspaces?.list
        ? await repositories.workspaces.list()
        : [...new Set([
            ...(data.users || []).map(row => row.tenantId),
            ...(data.customers || []).map(row => row.tenantId),
            ...(data.jobs || []).map(row => row.tenantId),
            ...(data.tenantAdminRecords || []).map(row => row.tenantId),
            ...(data.tenantSettings || []).map(row => row.tenantId)
          ].filter(Boolean))]
          .sort()
          .map(tenantId => ({
            tenantId,
            name: tenantId
          }));
      const rows = (await query(`SELECT * FROM platform_tenant_admin_records`)).rows;
      const domains = (await query(`SELECT id::text, tenant_id AS "tenantId", domain, status, ssl_status AS "sslStatus", created_at AS "createdAt", updated_at AS "updatedAt" FROM platform_tenant_domains WHERE deleted_at IS NULL`)).rows;
      const apiKeys = (await query(`SELECT id::text, tenant_id AS "tenantId", name, last_four AS "lastFour", expires_at AS "expiresAt", created_at AS "createdAt" FROM platform_tenant_api_keys WHERE revoked_at IS NULL`)).rows;
      return Promise.all(workspaces.map(async workspace => {
        const record = rows.find(row => row.tenant_id === workspace.tenantId) || {};
        const usage = await postgresUsage(store, workspace.tenantId);
        const owners = (await query(`SELECT id::text, tenant_id AS "tenantId", email, name, roles, NULL::text AS "deletedAt" FROM runtime_users WHERE tenant_id=$1 AND roles ? 'owner' ORDER BY lower(email)`, [workspace.tenantId])).rows;
        return {
          ...workspace,
          status: record.status || DEFAULT_STATUS,
          plan: record.plan || 'manual',
          tags: record.tags || [],
          notes: record.notes || '',
          featureFlags: record.feature_flags || {},
          branding: record.branding || {},
          storageBytes: Number(record.storage_bytes || 0),
          archivedAt: record.archived_at || '',
          deletedAt: record.deleted_at || '',
          modules: await modulesFor(repositories, workspace.tenantId),
          usage,
          owners,
          domains: domains.filter(row => row.tenantId === workspace.tenantId),
          apiKeys: apiKeys.filter(row => row.tenantId === workspace.tenantId),
          health: buildHealth({ status: record.status || DEFAULT_STATUS }, usage)
        };
      }));
    },
    async detail(tenantId, repositories) {
      return (await this.list(repositories)).find(row => row.tenantId === tenantId || row.id === tenantId) || null;
    },
    async update(tenantId, input, actorId) {
      await ensureTables();
      const next = {
        status: input.status,
        plan: input.plan,
        notes: input.notes,
        tags: input.tags,
        featureFlags: input.featureFlags,
        branding: input.branding,
        storageBytes: input.storageBytes,
        archivedAt: input.archivedAt,
        deletedAt: input.deletedAt
      };
      const existing = (await query(`SELECT * FROM platform_tenant_admin_records WHERE tenant_id=$1`, [tenantId])).rows[0] || {};
      const merged = { ...existing, ...Object.fromEntries(Object.entries(next).filter(([, value]) => value !== undefined)) };
      const row = (await query(
        `INSERT INTO platform_tenant_admin_records (tenant_id,status,plan,tags,notes,feature_flags,branding,storage_bytes,archived_at,deleted_at)
         VALUES ($1,$2,$3,$4::jsonb,$5,$6::jsonb,$7::jsonb,$8,NULLIF($9,'')::timestamptz,NULLIF($10,'')::timestamptz)
         ON CONFLICT (tenant_id) DO UPDATE SET status=EXCLUDED.status, plan=EXCLUDED.plan, tags=EXCLUDED.tags, notes=EXCLUDED.notes, feature_flags=EXCLUDED.feature_flags, branding=EXCLUDED.branding, storage_bytes=EXCLUDED.storage_bytes, archived_at=EXCLUDED.archived_at, deleted_at=EXCLUDED.deleted_at, updated_at=now()
         RETURNING tenant_id AS "tenantId", status, plan, tags, notes, feature_flags AS "featureFlags", branding, storage_bytes AS "storageBytes", archived_at AS "archivedAt", deleted_at AS "deletedAt", updated_at AS "updatedAt"`,
        [tenantId, merged.status || DEFAULT_STATUS, merged.plan || 'manual', JSON.stringify(merged.tags || []), merged.notes || '', JSON.stringify(merged.featureFlags || merged.feature_flags || {}), JSON.stringify(merged.branding || {}), Number(merged.storageBytes || merged.storage_bytes || 0), merged.archivedAt || merged.archived_at || '', merged.deletedAt || merged.deleted_at || '']
      )).rows[0];
      await audit(tenantId, actorId, 'tenant.update', input);
      return row;
    },
    archive(tenantId, actorId) { return this.update(tenantId, { status: 'archived', archivedAt: now() }, actorId); },
    restore(tenantId, actorId) { return this.update(tenantId, { status: 'active', archivedAt: '', deletedAt: '' }, actorId); },
    softDelete(tenantId, actorId) { return this.update(tenantId, { status: 'deleted', deletedAt: now() }, actorId); },
    async saveDomain(tenantId, input, actorId) {
      await ensureTables();
      const domain = String(input.domain || '').trim().toLowerCase();
      if (!domain) return null;
      const row = (await query(`INSERT INTO platform_tenant_domains (tenant_id,domain,status,ssl_status) VALUES ($1,$2,$3,$4) RETURNING id::text, tenant_id AS "tenantId", domain, status, ssl_status AS "sslStatus", created_at AS "createdAt", updated_at AS "updatedAt"`, [tenantId, domain, input.status || 'pending_dns', input.sslStatus || 'pending'])).rows[0];
      await audit(tenantId, actorId, 'domain.save', { domain });
      return row;
    },
    async createApiKey(tenantId, input, actorId) {
      await ensureTables();
      const raw = publicKey();
      const row = (await query(`INSERT INTO platform_tenant_api_keys (tenant_id,name,key_hash,last_four,expires_at) VALUES ($1,$2,$3,$4,NULLIF($5,'')::timestamptz) RETURNING id::text, tenant_id AS "tenantId", name, last_four AS "lastFour", expires_at AS "expiresAt", created_at AS "createdAt"`, [tenantId, input.name || 'Platform API key', hashToken(raw), raw.slice(-4), input.expiresAt || ''])).rows[0];
      await audit(tenantId, actorId, 'api_key.create', { name: row.name });
      return { ...row, token: raw };
    },
    async revokeApiKey(tenantId, keyId, actorId) {
      await ensureTables();
      const row = (await query(`UPDATE platform_tenant_api_keys SET revoked_at=now() WHERE tenant_id=$1 AND id=$2::uuid AND revoked_at IS NULL RETURNING id::text, tenant_id AS "tenantId", name, last_four AS "lastFour", revoked_at AS "revokedAt"`, [tenantId, keyId])).rows[0] || null;
      if (row) await audit(tenantId, actorId, 'api_key.revoke', { keyId });
      return row;
    },
    async audit(tenantId) {
      await ensureTables();
      return (await query(`SELECT id::text, tenant_id AS "tenantId", actor_id AS "actorId", action, metadata, created_at AS "createdAt" FROM platform_tenant_admin_audit WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 100`, [tenantId])).rows;
    }
  };
}

async function postgresUsage(store, tenantId) {
  const counts = {};
  for (const [key, table] of Object.entries({ users: 'runtime_users', customers: 'customers', workOrders: 'jobs', assets: 'customer_assets', services: 'services', invoices: 'invoices' })) {
    try {
      counts[key] = Number((await store.query(`SELECT count(*)::int AS count FROM ${table} WHERE tenant_id=$1`, [tenantId])).rows[0]?.count || 0);
    } catch {
      counts[key] = 0;
    }
  }
  counts.owners = 0;
  try {
    counts.owners = Number((await store.query(`SELECT count(*)::int AS count FROM runtime_users WHERE tenant_id=$1 AND roles ? 'owner'`, [tenantId])).rows[0]?.count || 0);
  } catch {}
  counts.mediaBytes = 0;
  try {
    counts.mediaBytes = Number((await store.query(`SELECT COALESCE(sum(size_bytes),0)::bigint AS bytes FROM media_attachments WHERE tenant_id=$1`, [tenantId])).rows[0]?.bytes || 0);
  } catch {}
  return counts;
}

module.exports = { createTenantManagementRepository };

