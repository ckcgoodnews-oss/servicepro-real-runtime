const { makeId, now } = require('../services/id');

function createFinancingRepository(store) {
  if (store.type === 'json') return createJson(store);
  if (store.type === 'postgres') return createPostgres(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJson(store) {
  function ensure(data) { data.financingApplications ||= []; return data; }
  return {
    list(tenantId) { return ensure(store.read()).financingApplications.filter(a => a.tenantId === tenantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    submit(slug, input) {
      const data = ensure(store.read());
      const settings = (data.tenantSettings || []).find(s => (s.branding?.publicSlug || '').toLowerCase() === slug.toLowerCase() && s.branding?.publicPublished);
      if (!settings) return null;
      const app = { id: makeId('fin'), tenantId: settings.tenantId, name: input.name || '', email: input.email || '', phone: input.phone || '', amount: Number(input.amount || 0), projectDescription: input.projectDescription || '', status: 'pending', notes: '', createdAt: now(), updatedAt: now() };
      data.financingApplications.push(app); store.write(data); return app;
    },
    updateStatus(tenantId, id, status, notes) {
      const data = ensure(store.read());
      const app = data.financingApplications.find(a => a.tenantId === tenantId && a.id === id);
      if (!app) return null;
      app.status = status || app.status; app.notes = notes || app.notes; app.updatedAt = now();
      store.write(data); return app;
    }
  };
}

function createPostgres(store) {
  return {
    async list(tenantId) {
      try {
        await store.query(`CREATE TABLE IF NOT EXISTS financing_applications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, name text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', amount numeric NOT NULL DEFAULT 0, project_description text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'pending', notes text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
        return (await store.query(`SELECT id::text, tenant_id AS "tenantId", name, email, phone, amount, project_description AS "projectDescription", status, notes, created_at AS "createdAt", updated_at AS "updatedAt" FROM financing_applications WHERE tenant_id=$1 ORDER BY created_at DESC`, [tenantId])).rows;
      } catch { return []; }
    },
    async submit(slug, input) {
      try {
        await store.query(`CREATE TABLE IF NOT EXISTS financing_applications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, name text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', amount numeric NOT NULL DEFAULT 0, project_description text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'pending', notes text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
        const settings = await store.query(`SELECT tenant_id AS "tenantId" FROM tenant_settings WHERE lower(branding->>'publicSlug')=lower($1) AND (branding->>'publicPublished')::boolean=true LIMIT 1`, [slug]);
        if (!settings.rows[0]) return null;
        const tenantId = settings.rows[0].tenantId;
        const result = await store.query(`INSERT INTO financing_applications (tenant_id,name,email,phone,amount,project_description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id::text, tenant_id AS "tenantId", name, email, phone, amount, project_description AS "projectDescription", status, created_at AS "createdAt"`, [tenantId, input.name || '', input.email || '', input.phone || '', Number(input.amount || 0), input.projectDescription || '']);
        return result.rows[0];
      } catch { return null; }
    },
    async updateStatus(tenantId, id, status, notes) {
      try {
        const result = await store.query(`UPDATE financing_applications SET status=COALESCE($3,status), notes=COALESCE($4,notes), updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text, status, notes, updated_at AS "updatedAt"`, [tenantId, id, status || null, notes || null]);
        return result.rows[0] || null;
      } catch { return null; }
    }
  };
}

module.exports = { createFinancingRepository };
