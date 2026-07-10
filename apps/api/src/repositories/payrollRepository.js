const { makeId, now } = require('../services/id');
const {
  normalizePayrollPeriodInput,
  normalizePayrollExportInput,
  buildPayrollExportPayload,
  approvePayrollExport,
  markPayrollExported
} = require('../services/payrollService');

function createPayrollRepository(store) {
  if (store.type === 'json') return createJsonPayrollRepository(store);
  if (store.type === 'postgres') return createPostgresPayrollRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePayroll(data) {
  if (!data.payrollPeriods) data.payrollPeriods = [];
  if (!data.payrollExports) data.payrollExports = [];
  if (!data.timeEntries) data.timeEntries = [];
  return data;
}

function createJsonPayrollRepository(store) {
  return {
    listPeriods(tenantId) {
      return ensurePayroll(store.read()).payrollPeriods.filter(x => x.tenantId === tenantId).sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)));
    },
    findPeriodById(tenantId, id) {
      return this.listPeriods(tenantId).find(x => x.id === id) || null;
    },
    createPeriod(tenantId, input) {
      const data = ensurePayroll(store.read());
      const period = { id: makeId('payperiod'), tenantId, ...normalizePayrollPeriodInput(input), createdAt: now(), updatedAt: now() };
      data.payrollPeriods.push(period);
      store.write(data);
      return period;
    },
    listExports(tenantId) {
      return ensurePayroll(store.read()).payrollExports.filter(x => x.tenantId === tenantId).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    findExportById(tenantId, id) {
      return this.listExports(tenantId).find(x => x.id === id) || null;
    },
    generateExport(tenantId, input) {
      const data = ensurePayroll(store.read());
      const period = input.periodId
        ? data.payrollPeriods.find(x => x.tenantId === tenantId && x.id === input.periodId)
        : { id: '', startDate: input.startDate, endDate: input.endDate };

      if (!period) return null;

      const entries = data.timeEntries.filter(x => x.tenantId === tenantId);
      const payload = buildPayrollExportPayload({ period, entries, format: input.format || 'json' });
      const batch = {
        id: makeId('payexport'),
        tenantId,
        ...normalizePayrollExportInput({
          ...input,
          periodId: period.id || input.periodId || '',
          startDate: period.startDate,
          endDate: period.endDate,
          itemCount: payload.itemCount,
          totalHours: payload.totalHours,
          totalLaborCost: payload.totalLaborCost,
          exportPayload: payload,
          status: 'generated'
        }),
        createdAt: now(),
        updatedAt: now()
      };
      data.payrollExports.push(batch);
      store.write(data);
      return batch;
    },
    approveExport(tenantId, id, approvedBy) {
      const data = ensurePayroll(store.read());
      const idx = data.payrollExports.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.payrollExports[idx] = approvePayrollExport(data.payrollExports[idx], approvedBy);
      store.write(data);
      return data.payrollExports[idx];
    },
    markExported(tenantId, id) {
      const data = ensurePayroll(store.read());
      const idx = data.payrollExports.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.payrollExports[idx] = markPayrollExported(data.payrollExports[idx]);
      store.write(data);
      return data.payrollExports[idx];
    }
  };
}

function createPostgresPayrollRepository(store) {
  const periodSelect = `SELECT id::text, tenant_id as "tenantId", name, start_date as "startDate",
    end_date as "endDate", status, notes, created_at as "createdAt", updated_at as "updatedAt"
    FROM payroll_periods`;
  const exportSelect = `SELECT id::text, tenant_id as "tenantId", period_id::text as "periodId",
    start_date as "startDate", end_date as "endDate", format, status, item_count as "itemCount",
    total_hours::float as "totalHours", total_labor_cost::float as "totalLaborCost",
    export_payload as "exportPayload", approved_by as "approvedBy", approved_at as "approvedAt",
    exported_at as "exportedAt", notes, created_at as "createdAt", updated_at as "updatedAt"
    FROM payroll_exports`;

  return {
    async listPeriods(tenantId) {
      const result = await store.query(`${periodSelect} WHERE tenant_id = $1 ORDER BY start_date DESC`, [tenantId]);
      return result.rows;
    },
    async findPeriodById(tenantId, id) {
      const result = await store.query(`${periodSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async createPeriod(tenantId, input) {
      const x = normalizePayrollPeriodInput(input);
      const result = await store.query(
        `INSERT INTO payroll_periods (tenant_id, name, start_date, end_date, status, notes)
         VALUES ($1,$2,$3::date,$4::date,$5,$6)
         RETURNING id::text, tenant_id as "tenantId", name, start_date as "startDate",
                   end_date as "endDate", status, notes, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.name, x.startDate, x.endDate, x.status, x.notes]
      );
      return result.rows[0];
    },
    async listExports(tenantId) {
      const result = await store.query(`${exportSelect} WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]);
      return result.rows;
    },
    async findExportById(tenantId, id) {
      const result = await store.query(`${exportSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async generateExport(tenantId, input) {
      const period = input.periodId
        ? await this.findPeriodById(tenantId, input.periodId)
        : { id: '', startDate: input.startDate, endDate: input.endDate };
      if (!period) return null;

      const entries = await store.query(
        `SELECT id::text, technician_id::text as "technicianId", started_at as "startedAt",
                duration_minutes as "durationMinutes", labor_cost::float as "laborCost", billable
         FROM time_entries
         WHERE tenant_id = $1 AND started_at::date BETWEEN $2::date AND $3::date`,
        [tenantId, period.startDate, period.endDate]
      );

      const payload = buildPayrollExportPayload({ period, entries: entries.rows, format: input.format || 'json' });
      const x = normalizePayrollExportInput({
        ...input,
        periodId: period.id || '',
        startDate: period.startDate,
        endDate: period.endDate,
        itemCount: payload.itemCount,
        totalHours: payload.totalHours,
        totalLaborCost: payload.totalLaborCost,
        exportPayload: payload,
        status: 'generated'
      });

      const result = await store.query(
        `INSERT INTO payroll_exports
         (tenant_id, period_id, start_date, end_date, format, status, item_count, total_hours, total_labor_cost, export_payload, notes)
         VALUES ($1,NULLIF($2,'')::uuid,$3::date,$4::date,$5,$6,$7,$8,$9,$10::jsonb,$11)
         RETURNING id::text, tenant_id as "tenantId", period_id::text as "periodId",
                   start_date as "startDate", end_date as "endDate", format, status, item_count as "itemCount",
                   total_hours::float as "totalHours", total_labor_cost::float as "totalLaborCost",
                   export_payload as "exportPayload", approved_by as "approvedBy", approved_at as "approvedAt",
                   exported_at as "exportedAt", notes, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.periodId, x.startDate, x.endDate, x.format, x.status, x.itemCount, x.totalHours, x.totalLaborCost, JSON.stringify(x.exportPayload), x.notes]
      );
      return result.rows[0];
    },
    async approveExport(tenantId, id, approvedBy) {
      const result = await store.query(
        `UPDATE payroll_exports SET status='approved', approved_by=$3, approved_at=now(), updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", period_id::text as "periodId",
                   start_date as "startDate", end_date as "endDate", format, status, item_count as "itemCount",
                   total_hours::float as "totalHours", total_labor_cost::float as "totalLaborCost",
                   export_payload as "exportPayload", approved_by as "approvedBy", approved_at as "approvedAt",
                   exported_at as "exportedAt", notes, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, approvedBy]
      );
      return result.rows[0] || null;
    },
    async markExported(tenantId, id) {
      const result = await store.query(
        `UPDATE payroll_exports SET status='exported', exported_at=now(), updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", period_id::text as "periodId",
                   start_date as "startDate", end_date as "endDate", format, status, item_count as "itemCount",
                   total_hours::float as "totalHours", total_labor_cost::float as "totalLaborCost",
                   export_payload as "exportPayload", approved_by as "approvedBy", approved_at as "approvedAt",
                   exported_at as "exportedAt", notes, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id]
      );
      return result.rows[0] || null;
    }
  };
}

module.exports = { createPayrollRepository };
