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
        return data.tenants.map(row => ({ id: row.id || row.tenantKey, tenantId: row.tenantKey, name: row.name }));
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
    const selectWithSettings = `SELECT t.id::text AS id, t.tenant_key AS "tenantId",
      COALESCE(NULLIF(ts.company_name,''), t.name) AS name, t.created_at AS "createdAt"
      FROM tenants t LEFT JOIN tenant_settings ts ON ts.tenant_id = t.tenant_key`;
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
          return (await store.query(`${selectWithSettings} ORDER BY name`)).rows;
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
          return (await store.query(`${selectWithSettings} WHERE t.tenant_key=$1 OR t.id::text=$1 LIMIT 1`, [tenantId])).rows[0] || null;
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
