const { makeId, now } = require('../services/id');
const { normalizeVendorInput } = require('../services/purchasingService');

function createVendorRepository(store) {
  if (store.type === 'json') return createJsonVendorRepository(store);
  if (store.type === 'postgres') return createPostgresVendorRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureVendors(data) {
  if (!data.vendors) data.vendors = [];
  return data;
}

function createJsonVendorRepository(store) {
  return {
    list(tenantId) {
      return ensureVendors(store.read()).vendors.filter(x => x.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return this.list(tenantId).find(x => x.id === id) || null;
    },
    create(tenantId, input) {
      const data = ensureVendors(store.read());
      const vendor = { id: makeId('vendor'), tenantId, ...normalizeVendorInput(input), createdAt: now(), updatedAt: now() };
      data.vendors.push(vendor);
      store.write(data);
      return vendor;
    },
    update(tenantId, id, input) {
      const data = ensureVendors(store.read());
      const idx = data.vendors.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.vendors[idx] = { ...data.vendors[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.vendors[idx];
    }
  };
}

function createPostgresVendorRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", name, account_number as "accountNumber",
    contact_name as "contactName", email, phone, website, address1, address2, city, state,
    postal_code as "postalCode", country, payment_terms as "paymentTerms", active, notes,
    created_at as "createdAt", updated_at as "updatedAt" FROM vendors`;
  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      const x = normalizeVendorInput(input);
      const result = await store.query(
        `INSERT INTO vendors
         (tenant_id, name, account_number, contact_name, email, phone, website, address1, address2, city, state, postal_code, country, payment_terms, active, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         RETURNING id::text, tenant_id as "tenantId", name, account_number as "accountNumber",
                   contact_name as "contactName", email, phone, website, address1, address2, city, state,
                   postal_code as "postalCode", country, payment_terms as "paymentTerms", active, notes,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.name, x.accountNumber, x.contactName, x.email, x.phone, x.website, x.address1, x.address2, x.city, x.state, x.postalCode, x.country, x.paymentTerms, x.active, x.notes]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE vendors SET name=$3, account_number=$4, contact_name=$5, email=$6, phone=$7, website=$8,
         address1=$9, address2=$10, city=$11, state=$12, postal_code=$13, country=$14, payment_terms=$15,
         active=$16, notes=$17, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", name, account_number as "accountNumber",
                   contact_name as "contactName", email, phone, website, address1, address2, city, state,
                   postal_code as "postalCode", country, payment_terms as "paymentTerms", active, notes,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.name, x.accountNumber || '', x.contactName || '', x.email || '', x.phone || '', x.website || '', x.address1 || '', x.address2 || '', x.city || '', x.state || '', x.postalCode || '', x.country || 'US', x.paymentTerms || 'Net 30', x.active !== false, x.notes || '']
      );
      return result.rows[0] || null;
    }
  };
}

module.exports = { createVendorRepository };
