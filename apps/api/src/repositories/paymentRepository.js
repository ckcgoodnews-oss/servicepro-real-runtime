const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');

function createPaymentRepository(store) {
  if (store.type === 'json') return createJsonPaymentRepository(store);
  if (store.type === 'postgres') return createPostgresPaymentRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePayments(data) {
  if (!data.payments) data.payments = [];
  return data;
}

function createJsonPaymentRepository(store) {
  return {
    list(tenantId) {
      return ensurePayments(store.read()).payments.filter(p => p.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return ensurePayments(store.read()).payments.find(p => p.tenantId === tenantId && p.id === id) || null;
    },
    create(tenantId, input) {
      requireFields(input, ['invoiceId', 'amount']);
      const data = ensurePayments(store.read());
      const payment = {
        id: makeId('pay'),
        tenantId,
        invoiceId: input.invoiceId,
        customerId: input.customerId || '',
        amount: Math.round(Number(input.amount || 0) * 100) / 100,
        method: input.method || 'manual',
        reference: input.reference || '',
        status: input.status || 'posted',
        receivedAt: input.receivedAt || now(),
        createdAt: now(),
        updatedAt: now()
      };
      data.payments.push(payment);
      store.write(data);
      return payment;
    },
    delete(tenantId, id) {
      const data = ensurePayments(store.read());
      const before = data.payments.length;
      data.payments = data.payments.filter(p => !(p.tenantId === tenantId && p.id === id));
      const deleted = data.payments.length !== before;
      if (deleted) store.write(data);
      return deleted;
    }
  };
}

function createPostgresPaymentRepository(store) {
  return {
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId",
                customer_id::text as "customerId", amount::float, method, reference, status,
                received_at as "receivedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM payments
         WHERE tenant_id = $1
         ORDER BY received_at DESC`,
        [tenantId]
      );
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId",
                customer_id::text as "customerId", amount::float, method, reference, status,
                received_at as "receivedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM payments
         WHERE tenant_id = $1 AND id = $2
         LIMIT 1`,
        [tenantId, id]
      );
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['invoiceId', 'amount']);
      const result = await store.query(
        `INSERT INTO payments (tenant_id, invoice_id, customer_id, amount, method, reference, status, received_at)
         VALUES ($1, $2::uuid, NULLIF($3, '')::uuid, $4, $5, $6, $7, COALESCE($8::timestamptz, now()))
         RETURNING id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId",
                   customer_id::text as "customerId", amount::float, method, reference, status,
                   received_at as "receivedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.invoiceId, input.customerId || '', Number(input.amount || 0), input.method || 'manual', input.reference || '', input.status || 'posted', input.receivedAt || null]
      );
      return result.rows[0];
    },
    async delete(tenantId, id) {
      const result = await store.query('DELETE FROM payments WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
      return result.rowCount > 0;
    }
  };
}

module.exports = { createPaymentRepository };
