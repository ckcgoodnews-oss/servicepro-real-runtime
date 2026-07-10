const { makeId, now } = require('../services/id');
const { normalizeAssetInput } = require('../services/customerAssetService');

function createCustomerAssetRepository(store) {
  if (store.type === 'json') return createJsonCustomerAssetRepository(store);
  if (store.type === 'postgres') return createPostgresCustomerAssetRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureAssets(data) {
  if (!data.customerAssets) data.customerAssets = [];
  return data;
}

function createJsonCustomerAssetRepository(store) {
  return {
    list(tenantId) {
      return ensureAssets(store.read()).customerAssets.filter(x => x.tenantId === tenantId);
    },
    listForCustomer(tenantId, customerId) {
      return this.list(tenantId).filter(x => x.customerId === customerId);
    },
    findById(tenantId, id) {
      return this.list(tenantId).find(x => x.id === id) || null;
    },
    create(tenantId, input) {
      const data = ensureAssets(store.read());
      const asset = { id: makeId('asset'), tenantId, ...normalizeAssetInput(input), createdAt: now(), updatedAt: now() };
      data.customerAssets.push(asset);
      store.write(data);
      return asset;
    },
    update(tenantId, id, input) {
      const data = ensureAssets(store.read());
      const idx = data.customerAssets.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.customerAssets[idx] = { ...data.customerAssets[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.customerAssets[idx];
    }
  };
}

function createPostgresCustomerAssetRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    job_id::text as "jobId", asset_type as "assetType", name, manufacturer, model,
    serial_number as "serialNumber", installed_date as "installedDate",
    warranty_expires_at as "warrantyExpiresAt", location, status, notes, metadata,
    created_at as "createdAt", updated_at as "updatedAt"
    FROM customer_assets`;
  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async listForCustomer(tenantId, customerId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND customer_id = $2 ORDER BY name`, [tenantId, customerId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      const x = normalizeAssetInput(input);
      const result = await store.query(
        `INSERT INTO customer_assets
         (tenant_id, customer_id, job_id, asset_type, name, manufacturer, model, serial_number,
          installed_date, warranty_expires_at, location, status, notes, metadata)
         VALUES ($1, $2::uuid, NULLIF($3, '')::uuid, $4, $5, $6, $7, $8, NULLIF($9, '')::date,
                 NULLIF($10, '')::date, $11, $12, $13, $14::jsonb)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", asset_type as "assetType", name, manufacturer, model,
                   serial_number as "serialNumber", installed_date as "installedDate",
                   warranty_expires_at as "warrantyExpiresAt", location, status, notes, metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.customerId, x.jobId, x.assetType, x.name, x.manufacturer, x.model, x.serialNumber, x.installedDate, x.warrantyExpiresAt, x.location, x.status, x.notes, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE customer_assets SET asset_type=$3, name=$4, manufacturer=$5, model=$6, serial_number=$7,
         installed_date=NULLIF($8, '')::date, warranty_expires_at=NULLIF($9, '')::date, location=$10,
         status=$11, notes=$12, metadata=$13::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", asset_type as "assetType", name, manufacturer, model,
                   serial_number as "serialNumber", installed_date as "installedDate",
                   warranty_expires_at as "warrantyExpiresAt", location, status, notes, metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.assetType, x.name, x.manufacturer || '', x.model || '', x.serialNumber || '', x.installedDate || '', x.warrantyExpiresAt || '', x.location || '', x.status || 'active', x.notes || '', JSON.stringify(x.metadata || {})]
      );
      return result.rows[0] || null;
    }
  };
}

module.exports = { createCustomerAssetRepository };
