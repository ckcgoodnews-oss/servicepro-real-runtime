const { makeId, now } = require('../services/id');
const { normalizeAgreementInput, agreementStatus } = require('../services/agreementService');

function createServiceAgreementRepository(store) {
  if (store.type === 'json') return createJsonServiceAgreementRepository(store);
  if (store.type === 'postgres') return createPostgresServiceAgreementRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureAgreements(data) {
  if (!data.serviceAgreements) data.serviceAgreements = [];
  return data;
}

function createJsonServiceAgreementRepository(store) {
  return {
    list(tenantId) {
      return ensureAgreements(store.read()).serviceAgreements.filter(x => x.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return ensureAgreements(store.read()).serviceAgreements.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    create(tenantId, input) {
      const data = ensureAgreements(store.read());
      const agreement = { id: makeId('agreement'), tenantId, ...normalizeAgreementInput(input), createdAt: now(), updatedAt: now() };
      data.serviceAgreements.push(agreement);
      store.write(data);
      return agreement;
    },
    update(tenantId, id, input) {
      const data = ensureAgreements(store.read());
      const idx = data.serviceAgreements.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.serviceAgreements[idx] = { ...data.serviceAgreements[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.serviceAgreements[idx];
    },
    dueForRenewal(tenantId, today) {
      return this.list(tenantId).filter(x => ['renewal_due', 'expired'].includes(agreementStatus(x, today)));
    }
  };
}

function createPostgresServiceAgreementRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    name, description, frequency, term_months as "termMonths", start_date as "startDate",
    end_date as "endDate", renewal_date as "renewalDate", visit_count as "visitCount",
    price::float, status, notes, created_at as "createdAt", updated_at as "updatedAt"
    FROM service_agreements`;
  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 ORDER BY renewal_date, name`, [tenantId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      const x = normalizeAgreementInput(input);
      const result = await store.query(
        `INSERT INTO service_agreements
         (tenant_id, customer_id, name, description, frequency, term_months, start_date, end_date, renewal_date, visit_count, price, status, notes)
         VALUES ($1, $2::uuid, $3, $4, $5, $6, $7::date, $8::date, $9::date, $10, $11, $12, $13)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   name, description, frequency, term_months as "termMonths", start_date as "startDate",
                   end_date as "endDate", renewal_date as "renewalDate", visit_count as "visitCount",
                   price::float, status, notes, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.customerId, x.name, x.description, x.frequency, x.termMonths, x.startDate, x.endDate, x.renewalDate, x.visitCount, x.price, x.status, x.notes]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE service_agreements
         SET name=$3, description=$4, frequency=$5, term_months=$6, start_date=$7::date, end_date=$8::date,
             renewal_date=$9::date, visit_count=$10, price=$11, status=$12, notes=$13, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   name, description, frequency, term_months as "termMonths", start_date as "startDate",
                   end_date as "endDate", renewal_date as "renewalDate", visit_count as "visitCount",
                   price::float, status, notes, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.name, x.description || '', x.frequency, x.termMonths || 12, x.startDate, x.endDate, x.renewalDate, x.visitCount || 1, x.price || 0, x.status || 'active', x.notes || '']
      );
      return result.rows[0] || null;
    },
    async dueForRenewal(tenantId, today) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND status = 'active' AND renewal_date <= $2::date ORDER BY renewal_date`, [tenantId, today]);
      return result.rows;
    }
  };
}

module.exports = { createServiceAgreementRepository };
