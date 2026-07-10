const { now } = require('../services/id');
const { defaultTenantSettings, sanitizeTenantSettings } = require('../services/tenantSettingsService');

function createTenantSettingsRepository(store) {
  if (store.type === 'json') return createJsonTenantSettingsRepository(store);
  if (store.type === 'postgres') return createPostgresTenantSettingsRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureSettings(data) {
  if (!data.tenantSettings) data.tenantSettings = [];
  return data;
}

function createJsonTenantSettingsRepository(store) {
  return {
    get(tenantId) {
      const data = ensureSettings(store.read());
      let settings = data.tenantSettings.find(x => x.tenantId === tenantId);
      if (!settings) {
        settings = defaultTenantSettings(tenantId);
        data.tenantSettings.push(settings);
        store.write(data);
      }
      return settings;
    },
    upsert(tenantId, input) {
      const data = ensureSettings(store.read());
      const idx = data.tenantSettings.findIndex(x => x.tenantId === tenantId);
      const existing = idx === -1 ? defaultTenantSettings(tenantId) : data.tenantSettings[idx];
      const next = sanitizeTenantSettings({
        ...existing,
        ...input,
        tenantId,
        branding: { ...(existing.branding || {}), ...(input.branding || {}) },
        features: { ...(existing.features || {}), ...(input.features || {}) },
        updatedAt: now()
      });

      if (idx === -1) data.tenantSettings.push(next);
      else data.tenantSettings[idx] = next;

      store.write(data);
      return next;
    }
  };
}

function createPostgresTenantSettingsRepository(store) {
  return {
    async get(tenantId) {
      const result = await store.query(
        `SELECT tenant_id as "tenantId", company_name as "companyName", legal_name as "legalName",
                support_email as "supportEmail", support_phone as "supportPhone", timezone, locale, currency,
                branding, features, created_at as "createdAt", updated_at as "updatedAt"
         FROM tenant_settings
         WHERE tenant_id = $1
         LIMIT 1`,
        [tenantId]
      );

      if (result.rows[0]) return result.rows[0];
      return this.upsert(tenantId, defaultTenantSettings(tenantId));
    },
    async upsert(tenantId, input) {
      const next = sanitizeTenantSettings({ ...input, tenantId });
      const result = await store.query(
        `INSERT INTO tenant_settings
         (tenant_id, company_name, legal_name, support_email, support_phone, timezone, locale, currency, branding, features)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
         ON CONFLICT (tenant_id) DO UPDATE SET
           company_name = EXCLUDED.company_name,
           legal_name = EXCLUDED.legal_name,
           support_email = EXCLUDED.support_email,
           support_phone = EXCLUDED.support_phone,
           timezone = EXCLUDED.timezone,
           locale = EXCLUDED.locale,
           currency = EXCLUDED.currency,
           branding = EXCLUDED.branding,
           features = EXCLUDED.features,
           updated_at = now()
         RETURNING tenant_id as "tenantId", company_name as "companyName", legal_name as "legalName",
                   support_email as "supportEmail", support_phone as "supportPhone", timezone, locale, currency,
                   branding, features, created_at as "createdAt", updated_at as "updatedAt"`,
        [
          tenantId,
          next.companyName,
          next.legalName,
          next.supportEmail,
          next.supportPhone,
          next.timezone,
          next.locale,
          next.currency,
          JSON.stringify(next.branding || {}),
          JSON.stringify(next.features || {})
        ]
      );

      return result.rows[0];
    }
  };
}

module.exports = { createTenantSettingsRepository };
