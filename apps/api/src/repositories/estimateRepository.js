const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');
const { calculateLines } = require('../services/pricingService');
const { resolveServiceLines, resolveServiceLinesAsync } = require('../services/priceBookService');
const { createServiceRepository } = require('./serviceRepository');

function createEstimateRepository(store) {
  if (store.type === 'json') return createJsonEstimateRepository(store);
  if (store.type === 'postgres') return createPostgresEstimateRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureCollection(data) {
  if (!data.estimates) data.estimates = [];
  if (!data.services) data.services = [];
  return data;
}

function buildJsonLines(data, tenantId, input) {
  const services = data.services.filter(s => s.tenantId === tenantId && s.active !== false);
  return resolveServiceLines(input.lines || [], services);
}

function createJsonEstimateRepository(store) {
  return {
    list(tenantId) {
      return ensureCollection(store.read()).estimates.filter(x => x.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return ensureCollection(store.read()).estimates.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    create(tenantId, input) {
      requireFields(input, ['customerId']);
      const data = ensureCollection(store.read());
      const resolvedLines = buildJsonLines(data, tenantId, input);
      const calc = calculateLines(resolvedLines, input.taxRate || 0);
      const record = {
        id: makeId('est'),
        tenantId,
        customerId: input.customerId,
        jobId: input.jobId || '',
        status: input.status || 'draft',
        taxRate: Number(input.taxRate || 0),
        lines: calc.lines,
        subtotal: calc.subtotal,
        tax: calc.tax,
        total: calc.total,
        marginPercent: calc.marginPercent,
        createdAt: now(),
        updatedAt: now()
      };
      data.estimates.push(record);
      store.write(data);
      return record;
    },
    update(tenantId, id, input) {
      const data = ensureCollection(store.read());
      const idx = data.estimates.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      const existing = data.estimates[idx];
      const resolvedLines = input.lines ? buildJsonLines(data, tenantId, input) : existing.lines;
      const taxRate = input.taxRate ?? existing.taxRate;
      const calc = calculateLines(resolvedLines, taxRate);
      data.estimates[idx] = {
        ...existing,
        ...input,
        id,
        tenantId,
        lines: calc.lines,
        taxRate,
        subtotal: calc.subtotal,
        tax: calc.tax,
        total: calc.total,
        marginPercent: calc.marginPercent,
        updatedAt: now()
      };
      store.write(data);
      return data.estimates[idx];
    },
    delete(tenantId, id) {
      const data = ensureCollection(store.read());
      const before = data.estimates.length;
      data.estimates = data.estimates.filter(x => !(x.tenantId === tenantId && x.id === id));
      const deleted = data.estimates.length !== before;
      if (deleted) store.write(data);
      return deleted;
    }
  };
}

function createPostgresEstimateRepository(store) {
  const serviceRepository = createServiceRepository(store);

  const selectSql = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    job_id::text as "jobId", status, tax_rate::float as "taxRate", lines,
    subtotal::float, tax::float, total::float, margin_percent::float as "marginPercent",
    created_at as "createdAt", updated_at as "updatedAt" FROM estimates`;

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

      const result = await store.query(
        `INSERT INTO estimates (tenant_id, customer_id, job_id, status, tax_rate, lines, subtotal, tax, total, margin_percent)
         VALUES ($1, $2::uuid, NULLIF($3, '')::uuid, $4, $5, $6::jsonb, $7, $8, $9, $10)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", status, tax_rate::float as "taxRate", lines,
                   subtotal::float, tax::float, total::float, margin_percent::float as "marginPercent",
                   created_at as "createdAt", updated_at as "updatedAt"`,
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
          calc.marginPercent
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

      const result = await store.query(
        `UPDATE estimates
         SET customer_id = $3::uuid, job_id = NULLIF($4, '')::uuid, status = $5, tax_rate = $6,
             lines = $7::jsonb, subtotal = $8, tax = $9, total = $10, margin_percent = $11, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   job_id::text as "jobId", status, tax_rate::float as "taxRate", lines,
                   subtotal::float, tax::float, total::float, margin_percent::float as "marginPercent",
                   created_at as "createdAt", updated_at as "updatedAt"`,
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
          calc.marginPercent
        ]
      );

      return result.rows[0] || null;
    },
    async delete(tenantId, id) {
      const result = await store.query('DELETE FROM estimates WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
      return result.rowCount > 0;
    }
  };
}

module.exports = { createEstimateRepository };
