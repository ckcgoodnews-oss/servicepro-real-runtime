const { makeId, now } = require('../services/id');
const {
  normalizeTimeEntryInput,
  clockOutEntry,
  approveEntry,
  summarizeLabor
} = require('../services/timeTrackingService');

function createTimeEntryRepository(store) {
  if (store.type === 'json') return createJsonTimeEntryRepository(store);
  if (store.type === 'postgres') return createPostgresTimeEntryRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTimeEntries(data) {
  if (!data.timeEntries) data.timeEntries = [];
  return data;
}

function filterRows(rows, filters = {}) {
  return rows
    .filter(x => !filters.technicianId || x.technicianId === filters.technicianId)
    .filter(x => !filters.jobId || x.jobId === filters.jobId)
    .filter(x => !filters.status || x.status === filters.status)
    .filter(x => !filters.entryType || x.entryType === filters.entryType);
}

function createJsonTimeEntryRepository(store) {
  return {
    list(tenantId, filters = {}) {
      return filterRows(ensureTimeEntries(store.read()).timeEntries.filter(x => x.tenantId === tenantId), filters)
        .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
    },
    findById(tenantId, id) {
      return ensureTimeEntries(store.read()).timeEntries.find(x => x.tenantId === tenantId && x.id === id) || null;
    },
    create(tenantId, input) {
      const data = ensureTimeEntries(store.read());
      const entry = { id: makeId('time'), tenantId, ...normalizeTimeEntryInput(input), createdAt: now(), updatedAt: now() };
      data.timeEntries.push(entry);
      store.write(data);
      return entry;
    },
    update(tenantId, id, input) {
      const data = ensureTimeEntries(store.read());
      const idx = data.timeEntries.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.timeEntries[idx] = { ...data.timeEntries[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.timeEntries[idx];
    },
    clockOut(tenantId, id, input = {}) {
      const data = ensureTimeEntries(store.read());
      const idx = data.timeEntries.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.timeEntries[idx] = clockOutEntry(data.timeEntries[idx], input.endedAt || new Date().toISOString(), input);
      store.write(data);
      return data.timeEntries[idx];
    },
    approve(tenantId, id, approvedBy) {
      const data = ensureTimeEntries(store.read());
      const idx = data.timeEntries.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.timeEntries[idx] = approveEntry(data.timeEntries[idx], approvedBy);
      store.write(data);
      return data.timeEntries[idx];
    },
    laborSummary(tenantId, filters = {}) {
      return summarizeLabor(this.list(tenantId, filters));
    }
  };
}

function createPostgresTimeEntryRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", technician_id::text as "technicianId",
    user_id as "userId", job_id::text as "jobId", appointment_id::text as "appointmentId",
    entry_type as "entryType", status, started_at as "startedAt", ended_at as "endedAt",
    duration_minutes as "durationMinutes", hourly_rate::float as "hourlyRate", labor_cost::float as "laborCost",
    billable, notes, approved_by as "approvedBy", approved_at as "approvedAt", metadata,
    created_at as "createdAt", updated_at as "updatedAt" FROM time_entries`;

  function whereClause(tenantId, filters = {}) {
    const params = [tenantId];
    let where = 'WHERE tenant_id = $1';
    const map = {
      technicianId: 'technician_id',
      jobId: 'job_id',
      status: 'status',
      entryType: 'entry_type'
    };
    for (const [key, column] of Object.entries(map)) {
      if (filters[key]) {
        params.push(filters[key]);
        where += ` AND ${column} = $${params.length}`;
      }
    }
    return { where, params };
  }

  return {
    async list(tenantId, filters = {}) {
      const { where, params } = whereClause(tenantId, filters);
      const result = await store.query(`${selectSql} ${where} ORDER BY started_at DESC`, params);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      const x = normalizeTimeEntryInput(input);
      const result = await store.query(
        `INSERT INTO time_entries
         (tenant_id, technician_id, user_id, job_id, appointment_id, entry_type, status, started_at, ended_at,
          duration_minutes, hourly_rate, labor_cost, billable, notes, approved_by, approved_at, metadata)
         VALUES ($1,$2::uuid,$3,NULLIF($4,'')::uuid,NULLIF($5,'')::uuid,$6,$7,$8::timestamptz,
                 NULLIF($9,'')::timestamptz,$10,$11,$12,$13,$14,$15,NULLIF($16,'')::timestamptz,$17::jsonb)
         RETURNING id::text, tenant_id as "tenantId", technician_id::text as "technicianId",
                   user_id as "userId", job_id::text as "jobId", appointment_id::text as "appointmentId",
                   entry_type as "entryType", status, started_at as "startedAt", ended_at as "endedAt",
                   duration_minutes as "durationMinutes", hourly_rate::float as "hourlyRate", labor_cost::float as "laborCost",
                   billable, notes, approved_by as "approvedBy", approved_at as "approvedAt", metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.technicianId, x.userId, x.jobId, x.appointmentId, x.entryType, x.status, x.startedAt, x.endedAt,
          x.durationMinutes, x.hourlyRate, x.laborCost, x.billable, x.notes, x.approvedBy, x.approvedAt, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE time_entries SET status=$3, ended_at=NULLIF($4,'')::timestamptz, duration_minutes=$5,
         hourly_rate=$6, labor_cost=$7, billable=$8, notes=$9, metadata=$10::jsonb, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", technician_id::text as "technicianId",
                   user_id as "userId", job_id::text as "jobId", appointment_id::text as "appointmentId",
                   entry_type as "entryType", status, started_at as "startedAt", ended_at as "endedAt",
                   duration_minutes as "durationMinutes", hourly_rate::float as "hourlyRate", labor_cost::float as "laborCost",
                   billable, notes, approved_by as "approvedBy", approved_at as "approvedAt", metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.status, x.endedAt || '', Number(x.durationMinutes || 0), Number(x.hourlyRate || 0),
          Number(x.laborCost || 0), x.billable !== false, x.notes || '', JSON.stringify(x.metadata || {})]
      );
      return result.rows[0] || null;
    },
    async clockOut(tenantId, id, input = {}) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const next = clockOutEntry(existing, input.endedAt || new Date().toISOString(), input);
      return this.update(tenantId, id, next);
    },
    async approve(tenantId, id, approvedBy) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const next = approveEntry(existing, approvedBy);
      const result = await store.query(
        `UPDATE time_entries SET status='approved', approved_by=$3, approved_at=$4::timestamptz, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", technician_id::text as "technicianId",
                   user_id as "userId", job_id::text as "jobId", appointment_id::text as "appointmentId",
                   entry_type as "entryType", status, started_at as "startedAt", ended_at as "endedAt",
                   duration_minutes as "durationMinutes", hourly_rate::float as "hourlyRate", labor_cost::float as "laborCost",
                   billable, notes, approved_by as "approvedBy", approved_at as "approvedAt", metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, next.approvedBy, next.approvedAt]
      );
      return result.rows[0] || null;
    },
    async laborSummary(tenantId, filters = {}) {
      const rows = await this.list(tenantId, filters);
      return summarizeLabor(rows);
    }
  };
}

module.exports = { createTimeEntryRepository };
