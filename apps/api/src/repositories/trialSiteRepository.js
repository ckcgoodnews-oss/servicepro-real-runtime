const crypto = require('crypto');

function createTrialSiteRepository(store) {
  if (store.type === 'json') return createJsonTrialSiteRepository(store);
  if (store.type === 'postgres') return createPostgresTrialSiteRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureData(data) {
  if (!data.trialSiteSelections) data.trialSiteSelections = [];
  if (!data.trialSites) data.trialSites = [];
  return data;
}

function createJsonTrialSiteRepository(store) {
  return {
    async createSelections(records) {
      const data = ensureData(store.read());
      for (const r of records) {
        const exists = data.trialSiteSelections.find(s => s.trialId === r.trialId && s.offeringId === r.offeringId);
        if (!exists) data.trialSiteSelections.push({ ...r, createdAt: new Date().toISOString() });
      }
      store.write(data);
    },

    async createSite(site) {
      const data = ensureData(store.read());
      const exists = data.trialSites.find(s => s.trialId === site.trialId);
      if (exists) return exists;
      const record = { ...site, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      data.trialSites.push(record);
      store.write(data);
      return record;
    },

    async findByTrialId(trialId) {
      const data = ensureData(store.read());
      return data.trialSites.find(s => s.trialId === trialId || s.trial_id === trialId) || null;
    },

    async findBySlug(slug) {
      const data = ensureData(store.read());
      return data.trialSites.find(s => (s.publicSlug || s.public_slug) === slug) || null;
    },

    async updateState(siteId, state, provisionedAt) {
      const data = ensureData(store.read());
      const site = data.trialSites.find(s => s.id === siteId);
      if (!site) return null;
      site.provisioningState = state;
      site.provisioning_state = state;
      if (provisionedAt) { site.provisionedAt = provisionedAt; site.provisioned_at = provisionedAt; site.publishedAt = provisionedAt; site.published_at = provisionedAt; }
      site.updatedAt = new Date().toISOString();
      store.write(data);
      return site;
    },

    async updateContent(siteId, content, version) {
      const data = ensureData(store.read());
      const site = data.trialSites.find(s => s.id === siteId);
      if (!site) return null;
      site.siteContent = typeof content === 'string' ? content : JSON.stringify(content);
      site.site_content = site.siteContent;
      site.version = version;
      site.updatedAt = new Date().toISOString();
      store.write(data);
      return site;
    }
  };
}

function createPostgresTrialSiteRepository(store) {
  return {
    async createSelections(records) {
      for (const r of records) {
        await store.pgPool.query(
          `INSERT INTO trial_site_selections (id, trial_id, tenant_id, offering_id, offering_snapshot, sequence)
           VALUES ($1, $2::uuid, $3, $4, $5::jsonb, $6)
           ON CONFLICT (trial_id, offering_id) DO NOTHING`,
          [r.id, r.trialId, r.tenantId, r.offeringId, r.offeringSnapshot, r.sequence]
        );
      }
    },

    async createSite(site) {
      const { rows } = await store.pgPool.query(
        `INSERT INTO trial_sites (id, trial_id, tenant_id, public_slug, provisioning_state, site_content, field_states, version)
         VALUES ($1, $2::uuid, $3, $4, $5, $6::jsonb, $7::jsonb, $8)
         ON CONFLICT (trial_id) DO NOTHING
         RETURNING *`,
        [site.id, site.trialId, site.tenantId, site.publicSlug, site.provisioningState, site.siteContent, site.fieldStates, site.version]
      );
      return rows[0] || null;
    },

    async findByTrialId(trialId) {
      const { rows } = await store.pgPool.query('SELECT * FROM trial_sites WHERE trial_id = $1::uuid LIMIT 1', [trialId]);
      return rows[0] || null;
    },

    async findBySlug(slug) {
      const { rows } = await store.pgPool.query('SELECT * FROM trial_sites WHERE public_slug = $1 LIMIT 1', [slug]);
      return rows[0] || null;
    },

    async updateState(siteId, state, provisionedAt) {
      const { rows } = await store.pgPool.query(
        `UPDATE trial_sites SET provisioning_state = $2, provisioned_at = $3, published_at = $3, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [siteId, state, provisionedAt || null]
      );
      return rows[0] || null;
    },

    async updateContent(siteId, content, version) {
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      const { rows } = await store.pgPool.query(
        `UPDATE trial_sites SET site_content = $2::jsonb, version = $3, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [siteId, contentStr, version]
      );
      return rows[0] || null;
    }
  };
}

module.exports = { createTrialSiteRepository };
