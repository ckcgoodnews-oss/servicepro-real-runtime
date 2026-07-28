const { makeId, now } = require('../services/id');

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function createWorkspaceRepository(store) {
  if (store.type === 'json') {
    return {
      list() {
        const data = store.read();
        data.tenants ||= [];
        if (!data.tenants.some(row => row.tenantKey === 'tenant_demo')) {
          data.tenants.push({ id: 'tenant_demo', tenantKey: 'tenant_demo', name: data.tenantSettings?.[0]?.companyName || 'ServicePro Demo Plumbing', createdAt: now() });
          store.write(data);
        }
        const discovered = new Map();
        const add = (tenantId, name, id = tenantId) => {
          const key = String(tenantId || '').trim();
          if (!key || discovered.has(key)) return;
          discovered.set(key, { id: id || key, tenantId: key, name: String(name || key).trim() });
        };

        data.tenants.forEach(row => add(row.tenantKey, row.name, row.id));
        (data.tenantSettings || []).forEach(row => add(row.tenantId, row.companyName));
        (data.users || [])
          .filter(row => (row.roles || []).includes('owner'))
          .forEach(row => add(row.tenantId, row.businessName || row.name || row.email));
        (data.tenantAdminRecords || []).forEach(row => add(row.tenantId, row.name));

        return [...discovered.values()].sort((left, right) => left.name.localeCompare(right.name));
      },
      find(tenantId) {
        return this.list().find(row => row.tenantId === tenantId || row.id === tenantId) || null;
      },
      create(input) {
        const data = store.read();
        data.tenants ||= [];
        const base = normalizeKey(input.tenantId || input.name) || `business_${Date.now()}`;
        let tenantKey = base.startsWith('tenant_') ? base : `tenant_${base}`;
        let suffix = 2;
        while (data.tenants.some(row => row.tenantKey === tenantKey)) tenantKey = `${base}_${suffix++}`;
        const row = { id: makeId('tenant'), tenantKey, name: String(input.name || tenantKey).trim(), createdAt: now() };
        data.tenants.push(row);
        store.write(data);
        return { id: row.id, tenantId: row.tenantKey, name: row.name };
      }
    };
  }
  if (store.type === 'postgres') {
    const selectWithSettings = `WITH workspace_candidates AS (
      SELECT t.id::text AS id, t.tenant_key AS "tenantId",
        COALESCE(NULLIF(ts.company_name,''), t.name) AS name,
        t.created_at AS "createdAt", 1 AS priority
      FROM tenants t
      LEFT JOIN tenant_settings ts ON ts.tenant_id = t.tenant_key
      UNION ALL
      SELECT ts.tenant_id AS id, ts.tenant_id AS "tenantId",
        COALESCE(NULLIF(ts.company_name,''), ts.tenant_id) AS name,
        ts.created_at AS "createdAt", 2 AS priority
      FROM tenant_settings ts
      WHERE NOT EXISTS (SELECT 1 FROM tenants t WHERE t.tenant_key = ts.tenant_id OR t.id::text = ts.tenant_id)
      UNION ALL
      SELECT u.tenant_id AS id, u.tenant_id AS "tenantId",
        COALESCE(NULLIF(MAX(u.name),''), NULLIF(MAX(u.email),''), u.tenant_id) AS name,
        MIN(u.created_at) AS "createdAt", 3 AS priority
      FROM runtime_users u
      WHERE u.roles ? 'owner'
        AND NOT EXISTS (SELECT 1 FROM tenants t WHERE t.tenant_key = u.tenant_id OR t.id::text = u.tenant_id)
        AND NOT EXISTS (SELECT 1 FROM tenant_settings ts WHERE ts.tenant_id = u.tenant_id)
      GROUP BY u.tenant_id
    )
    SELECT DISTINCT ON ("tenantId") id, "tenantId", name, "createdAt"
    FROM workspace_candidates`;
    const selectBasic = `SELECT t.id::text AS id, t.tenant_key AS "tenantId",
      t.name AS name, t.created_at AS "createdAt"
      FROM tenants t`;

    async function safeQuery(sql, params = []) {
      try {
        return await store.query(sql, params);
      } catch (err) {
        // If tenant_settings table doesn't exist, fall back to basic query
        if (err?.code === '42P01') {
          const fallbackSql = sql.replace(selectWithSettings, selectBasic);
          if (fallbackSql !== sql) return store.query(fallbackSql, params);
        }
        throw err;
      }
    }

    return {
      async list() {
        try {
          return (await store.query(`${selectWithSettings} ORDER BY "tenantId", priority, name`)).rows
            .sort((left, right) => left.name.localeCompare(right.name));
        } catch (err) {
          if (err?.code === '42P01') {
            // tenant_settings table missing — use basic select
            return (await store.query(`${selectBasic} ORDER BY name`)).rows;
          }
          throw err;
        }
      },
      async find(tenantId) {
        try {
          return (await store.query(
            `SELECT id, "tenantId", name, "createdAt"
             FROM (${selectWithSettings} ORDER BY "tenantId", priority) workspaces
             WHERE "tenantId"=$1 OR id=$1
             LIMIT 1`,
            [tenantId]
          )).rows[0] || null;
        } catch (err) {
          if (err?.code === '42P01') {
            return (await store.query(`${selectBasic} WHERE t.tenant_key=$1 OR t.id::text=$1 LIMIT 1`, [tenantId])).rows[0] || null;
          }
          throw err;
        }
      },
      async create(input) {
        const base = normalizeKey(input.tenantId || input.name) || `business_${Date.now()}`;
        const preferred = base.startsWith('tenant_') ? base : `tenant_${base}`;
        const result = await store.query(
          `INSERT INTO tenants(tenant_key,name)
           VALUES (
             CASE WHEN EXISTS(SELECT 1 FROM tenants WHERE tenant_key=$1)
               THEN $1 || '_' || substr(gen_random_uuid()::text,1,8) ELSE $1 END,
             $2
           )
           RETURNING id::text AS id, tenant_key AS "tenantId", name, created_at AS "createdAt"`,
          [preferred, String(input.name || preferred).trim()]
        );
        return result.rows[0];
      }
    };
  }
  throw new Error(`Unsupported store type: ${store.type}`);
}

module.exports = { createWorkspaceRepository };
