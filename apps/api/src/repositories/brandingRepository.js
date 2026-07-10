const { makeId, now } = require('../services/id');
const {
  normalizeBrandProfileInput,
  normalizeBrandAssetInput,
  normalizeTenantDomainInput,
  resolveBranding,
  generateCssVariables,
  verifyDomain
} = require('../services/brandingService');

function createBrandingRepository(store) {
  if (store.type === 'json') return createJsonBrandingRepository(store);
  if (store.type === 'postgres') return createPostgresBrandingRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureBranding(data) {
  if (!data.brandProfiles) data.brandProfiles = [];
  if (!data.brandAssets) data.brandAssets = [];
  if (!data.tenantDomains) data.tenantDomains = [];
  return data;
}

function createJsonBrandingRepository(store) {
  return {
    listBrands(tenantId, filters = {}) {
      return ensureBranding(store.read()).brandProfiles
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    findBrandById(tenantId, id) {
      return ensureBranding(store.read()).brandProfiles.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    createBrand(tenantId, input) {
      const data = ensureBranding(store.read());
      const brand = { id: makeId('brand'), tenantId, ...normalizeBrandProfileInput(input), createdAt: now(), updatedAt: now() };
      data.brandProfiles.push(brand);
      store.write(data);
      return brand;
    },
    updateBrand(tenantId, id, input) {
      const data = ensureBranding(store.read());
      const idx = data.brandProfiles.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.brandProfiles[idx] = { ...data.brandProfiles[idx], ...input, updatedAt: now() };
      store.write(data);
      return data.brandProfiles[idx];
    },
    listAssets(tenantId, brandId) {
      return ensureBranding(store.read()).brandAssets
        .filter(x => x.tenantId === tenantId && x.brandId === brandId)
        .sort((a, b) => String(a.assetType).localeCompare(String(b.assetType)));
    },
    createAsset(tenantId, input) {
      const data = ensureBranding(store.read());
      const asset = { id: makeId('basset'), tenantId, ...normalizeBrandAssetInput(input), createdAt: now(), updatedAt: now() };
      data.brandAssets.push(asset);
      store.write(data);
      return asset;
    },
    listDomains(tenantId, brandId) {
      return ensureBranding(store.read()).tenantDomains
        .filter(x => x.tenantId === tenantId && x.brandId === brandId)
        .sort((a, b) => String(a.hostname).localeCompare(String(b.hostname)));
    },
    createDomain(tenantId, input) {
      const data = ensureBranding(store.read());
      const domain = { id: makeId('bdomain'), tenantId, ...normalizeTenantDomainInput(input), createdAt: now(), updatedAt: now() };
      data.tenantDomains.push(domain);
      store.write(data);
      return domain;
    },
    verifyDomain(tenantId, id, expectedToken) {
      const data = ensureBranding(store.read());
      const idx = data.tenantDomains.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.tenantDomains[idx] = { ...verifyDomain(data.tenantDomains[idx], expectedToken), updatedAt: now() };
      store.write(data);
      return data.tenantDomains[idx];
    },
    resolve(tenantId, brandId) {
      const brand = this.findBrandById(tenantId, brandId);
      if (!brand) return null;
      return resolveBranding({ brand, assets: this.listAssets(tenantId, brandId), domains: this.listDomains(tenantId, brandId) });
    },
    css(tenantId, brandId) {
      const brand = this.findBrandById(tenantId, brandId);
      if (!brand) return null;
      return generateCssVariables(brand.theme || {});
    }
  };
}

function createPostgresBrandingRepository(store) {
  const brandSelect = `SELECT id::text, tenant_id as "tenantId", code, name, legal_name as "legalName",
    status, support_email as "supportEmail", support_phone as "supportPhone", website_url as "websiteUrl",
    default_locale as "defaultLocale", timezone, theme, metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM brand_profiles`;
  const assetSelect = `SELECT id::text, tenant_id as "tenantId", brand_id::text as "brandId",
    asset_type as "assetType", url, alt_text as "altText", media_attachment_id::text as "mediaAttachmentId",
    active, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM brand_assets`;
  const domainSelect = `SELECT id::text, tenant_id as "tenantId", brand_id::text as "brandId",
    hostname, status, is_primary as "isPrimary", verification_token as "verificationToken",
    verified_at as "verifiedAt", ssl_status as "sslStatus", metadata, created_at as "createdAt", updated_at as "updatedAt"
    FROM tenant_domains`;

  return {
    async listBrands(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id = $1';
      if (filters.status) {
        params.push(filters.status);
        where += ` AND status = $${params.length}`;
      }
      const result = await store.query(`${brandSelect} ${where} ORDER BY name`, params);
      return result.rows;
    },
    async findBrandById(tenantId, id) {
      const result = await store.query(`${brandSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createBrand(tenantId, input) {
      const x = normalizeBrandProfileInput(input);
      const result = await store.query(
        `INSERT INTO brand_profiles
         (tenant_id, code, name, legal_name, status, support_email, support_phone, website_url,
          default_locale, timezone, theme, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb)
         RETURNING id::text, tenant_id as "tenantId", code, name, legal_name as "legalName",
                   status, support_email as "supportEmail", support_phone as "supportPhone", website_url as "websiteUrl",
                   default_locale as "defaultLocale", timezone, theme, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.legalName, x.status, x.supportEmail, x.supportPhone, x.websiteUrl,
          x.defaultLocale, x.timezone, JSON.stringify(x.theme || {}), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async updateBrand(tenantId, id, input) {
      const existing = await this.findBrandById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input, theme: input.theme || existing.theme };
      const result = await store.query(
        `UPDATE brand_profiles
         SET name=$3, legal_name=$4, status=$5, support_email=$6, support_phone=$7, website_url=$8,
             default_locale=$9, timezone=$10, theme=$11::jsonb, metadata=$12::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", code, name, legal_name as "legalName",
                   status, support_email as "supportEmail", support_phone as "supportPhone", website_url as "websiteUrl",
                   default_locale as "defaultLocale", timezone, theme, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.name, x.legalName, x.status, x.supportEmail, x.supportPhone, x.websiteUrl,
          x.defaultLocale, x.timezone, JSON.stringify(x.theme || {}), JSON.stringify(x.metadata || {})]
      );
      return result.rows[0] || null;
    },
    async listAssets(tenantId, brandId) {
      const result = await store.query(`${assetSelect} WHERE tenant_id = $1 AND brand_id = $2 ORDER BY asset_type`, [tenantId, brandId]);
      return result.rows;
    },
    async createAsset(tenantId, input) {
      const x = normalizeBrandAssetInput(input);
      const result = await store.query(
        `INSERT INTO brand_assets
         (tenant_id, brand_id, asset_type, url, alt_text, media_attachment_id, active, metadata)
         VALUES ($1,$2::uuid,$3,$4,$5,NULLIF($6,'')::uuid,$7,$8::jsonb)
         RETURNING id::text, tenant_id as "tenantId", brand_id::text as "brandId",
                   asset_type as "assetType", url, alt_text as "altText", media_attachment_id::text as "mediaAttachmentId",
                   active, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.brandId, x.assetType, x.url, x.altText, x.mediaAttachmentId, x.active, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async listDomains(tenantId, brandId) {
      const result = await store.query(`${domainSelect} WHERE tenant_id = $1 AND brand_id = $2 ORDER BY hostname`, [tenantId, brandId]);
      return result.rows;
    },
    async createDomain(tenantId, input) {
      const x = normalizeTenantDomainInput(input);
      const result = await store.query(
        `INSERT INTO tenant_domains
         (tenant_id, brand_id, hostname, status, is_primary, verification_token, verified_at, ssl_status, metadata)
         VALUES ($1,$2::uuid,$3,$4,$5,$6,NULLIF($7,'')::timestamptz,$8,$9::jsonb)
         RETURNING id::text, tenant_id as "tenantId", brand_id::text as "brandId",
                   hostname, status, is_primary as "isPrimary", verification_token as "verificationToken",
                   verified_at as "verifiedAt", ssl_status as "sslStatus", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.brandId, x.hostname, x.status, x.isPrimary, x.verificationToken, x.verifiedAt, x.sslStatus, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async verifyDomain(tenantId, id, expectedToken) {
      const result = await store.query(`${domainSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      const domain = result.rows[0];
      if (!domain) return null;
      const verified = verifyDomain(domain, expectedToken);
      const update = await store.query(
        `UPDATE tenant_domains SET status=$3, verified_at=NULLIF($4,'')::timestamptz, ssl_status=$5, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", brand_id::text as "brandId",
                   hostname, status, is_primary as "isPrimary", verification_token as "verificationToken",
                   verified_at as "verifiedAt", ssl_status as "sslStatus", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, verified.status, verified.verifiedAt || '', verified.sslStatus]
      );
      return update.rows[0] || null;
    },
    async resolve(tenantId, brandId) {
      const brand = await this.findBrandById(tenantId, brandId);
      if (!brand) return null;
      const assets = await this.listAssets(tenantId, brandId);
      const domains = await this.listDomains(tenantId, brandId);
      return resolveBranding({ brand, assets, domains });
    },
    async css(tenantId, brandId) {
      const brand = await this.findBrandById(tenantId, brandId);
      if (!brand) return null;
      return generateCssVariables(brand.theme || {});
    }
  };
}

module.exports = { createBrandingRepository };
