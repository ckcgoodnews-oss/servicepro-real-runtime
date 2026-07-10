const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');
const { calculateLines, roundMoney } = require('../services/pricingService');
const { applyPaymentToInvoice } = require('../services/paymentService');
const { resolveServiceLines, resolveServiceLinesAsync } = require('../services/priceBookService');
const { createServiceRepository } = require('./serviceRepository');

function createInvoiceRepository(store) {
  if (store.type === 'json') return createJsonInvoiceRepository(store);
  if (store.type === 'postgres') return createPostgresInvoiceRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureCollection(data) {
  if (!data.invoices) data.invoices = [];
  if (!data.services) data.services = [];
  return data;
}

function buildJsonLines(data, tenantId, input) {
  const services = data.services.filter(s => s.tenantId === tenantId && s.active !== false);
  return resolveServiceLines(input.lines || [], services);
}

function createJsonInvoiceRepository(store) {
  return {
    list(tenantId) {
      return ensureCollection(store.read()).invoices.filter(x => x.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return ensureCollection(store.read()).invoices.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    create(tenantId, input) {
      requireFields(input, ['customerId']);
      const data = ensureCollection(store.read());
      const resolvedLines = buildJsonLines(data, tenantId, input);
      const calc = calculateLines(resolvedLines, input.taxRate || 0);
      const paidAmount = roundMoney(input.paidAmount || 0);
      const record = {
        id: makeId('inv'),
        tenantId,
        customerId: input.customerId,
        jobId: input.jobId || '',
        status: input.status || 'draft',
        taxRate: Number(input.taxRate || 0),
        lines: calc.lines,
        subtotal: calc.subtotal,
        tax: calc.tax,
        total: calc.total,
        paidAmount,
        balanceDue: roundMoney(calc.total - paidAmount),
        createdAt: now(),
        updatedAt: now()
      };
      data.invoices.push(record);
      store.write(data);
      return record;
    },
    update(tenantId, id, input) {
      const data = ensureCollection(store.read());
      const idx = data.invoices.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      const existing = data.invoices[idx];
      const resolvedLines = input.lines ? buildJsonLines(data, tenantId, input) : existing.lines;
      const taxRate = input.taxRate ?? existing.taxRate;
      const calc = calculateLines(resolvedLines, taxRate);
      const paidAmount = roundMoney(input.paidAmount ?? existing.paidAmount ?? 0);
      data.invoices[idx] = {
        ...existing,
        ...input,
        id,
        tenantId,
        lines: calc.lines,
        taxRate,
        subtotal: calc.subtotal,
        tax: calc.tax,
        total: calc.total,
        paidAmount,
        balanceDue: roundMoney(calc.total - paidAmount),
        updatedAt: now()
      };
      store.write(data);
      return data.invoices[idx];
    },
    recordPayment(tenantId, id, amount) {
      const data = ensureCollection(store.read());
      const idx = data.invoices.findIndex(i => i.tenantId === tenantId && i.id === id);
      if (idx === -1) return null;
      data.invoices[idx] = applyPaymentToInvoice(data.invoices[idx], amount);
      store.write(data);
      return data.invoices[idx];
    },
    delete(tenantId, id) {
      const data = ensureCollection(store.read());
      const before = data.invoices.length;
      data.invoices = data.invoices.filter(x => !(x.tenantId === tenantId && x.id === id));
      const deleted = data.invoices.length !== before;
      if (deleted) store.write(data);
      return deleted;
    }
  };
}

function createPostgresInvoiceRepository(store) {
  const serviceRepository = createServiceRepository(store);

  const selectSql = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    job_id::text as "jobId", status, tax_rate::float as "taxRate", lines,
    subtotal::float, tax::float, total::float, paid_amount::float as "paidAmount",
    balance_due::float as "balanceDue", created_at as "createdAt", updated_at as "updatedAt" FROM invoices`;

  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['customerId']);
      const resolvedLines = await resolveServiceLinesAsync(tenantId, input.lines || [], serviceRepository);
      const calc = calculateLines(resolvedLines, input.taxRate || 0);
      const paidAmount = roundMoney(input.paidAmount || 0);
      const balanceDue = roundMoney(calc.total - paidAmount);

      const result = await store.query(
        `INSERT INTO invoices (tenant_id, customer_id, job_id, status, tax_rate, lines, subtotal, tax, total, paid_amount, balance_due)
         VALUES ($1, $2::uuid, NULLIF($3, '')::uuid, $4, $5, $6::jsonb, $7, $8, $9, $10, $11)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", status, tax_rate::float as "taxRate", lines,
                   subtotal::float, tax::float, total::float, paid_amount::float as "paidAmount",
                   balance_due::float as "balanceDue", created_at as "createdAt", updated_at as "updatedAt"`,
        [
          tenantId,
          input.customerId,
          input.jobId || '',
          input.status || 'draft',
          Number(input.taxRate || 0),
          JSON.stringify(calc.lines),
          calc.subtotal,
          calc.tax,
          calc.total,
          paidAmount,
          balanceDue
        ]
      );

      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const resolvedLines = input.lines
        ? await resolveServiceLinesAsync(tenantId, input.lines, serviceRepository)
        : existing.lines;

      const taxRate = input.taxRate ?? existing.taxRate;
      const calc = calculateLines(resolvedLines, taxRate);
      const paidAmount = roundMoney(input.paidAmount ?? existing.paidAmount ?? 0);
      const balanceDue = roundMoney(calc.total - paidAmount);

      const result = await store.query(
        `UPDATE invoices
         SET customer_id = $3::uuid, job_id = NULLIF($4, '')::uuid, status = $5, tax_rate = $6,
             lines = $7::jsonb, subtotal = $8, tax = $9, total = $10,
             paid_amount = $11, balance_due = $12, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", status, tax_rate::float as "taxRate", lines,
                   subtotal::float, tax::float, total::float, paid_amount::float as "paidAmount",
                   balance_due::float as "balanceDue", created_at as "createdAt", updated_at as "updatedAt"`,
        [
          tenantId,
          id,
          input.customerId || existing.customerId,
          input.jobId ?? existing.jobId ?? '',
          input.status || existing.status,
          taxRate,
          JSON.stringify(calc.lines),
          calc.subtotal,
          calc.tax,
          calc.total,
          paidAmount,
          balanceDue
        ]
      );

      return result.rows[0] || null;
    },
    async recordPayment(tenantId, id, amount) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const next = applyPaymentToInvoice(existing, amount);

      const result = await store.query(
        `UPDATE invoices
         SET paid_amount = $3, balance_due = $4, status = $5, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", status, tax_rate::float as "taxRate", lines,
                   subtotal::float, tax::float, total::float, paid_amount::float as "paidAmount",
                   balance_due::float as "balanceDue", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, next.paidAmount, next.balanceDue, next.status]
      );

      return result.rows[0] || null;
    },
    async delete(tenantId, id) {
      const result = await store.query('DELETE FROM invoices WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
      return result.rowCount > 0;
    }
  };
}

module.exports = { createInvoiceRepository };
