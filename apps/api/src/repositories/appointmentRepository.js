const { makeId, now } = require('../services/id');
const { validateAppointmentInput, findConflicts } = require('../services/scheduleService');

function createAppointmentRepository(store) {
  if (store.type === 'json') return createJsonAppointmentRepository(store);
  if (store.type === 'postgres') return createPostgresAppointmentRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureAppointments(data) {
  if (!data.appointments) data.appointments = [];
  return data;
}

function createJsonAppointmentRepository(store) {
  return {
    list(tenantId) {
      return ensureAppointments(store.read()).appointments.filter(a => a.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return ensureAppointments(store.read()).appointments.find(a => a.tenantId === tenantId && a.id === id) || null;
    },
    create(tenantId, input) {
      validateAppointmentInput(input);
      const data = ensureAppointments(store.read());
      const conflicts = findConflicts(data.appointments.filter(a => a.tenantId === tenantId), input);
      if (conflicts.length) {
        const err = new Error('Schedule conflict detected for technician');
        err.status = 409;
        err.code = 'schedule_conflict';
        err.details = { conflicts };
        throw err;
      }
      const appointment = {
        id: makeId('appt'),
        tenantId,
        jobId: input.jobId,
        customerId: input.customerId || '',
        technicianId: input.technicianId,
        startTime: input.startTime,
        endTime: input.endTime,
        status: input.status || 'scheduled',
        notes: input.notes || '',
        createdAt: now(),
        updatedAt: now()
      };
      data.appointments.push(appointment);
      store.write(data);
      return appointment;
    },
    update(tenantId, id, input) {
      const data = ensureAppointments(store.read());
      const idx = data.appointments.findIndex(a => a.tenantId === tenantId && a.id === id);
      if (idx === -1) return null;
      const next = { ...data.appointments[idx], ...input, id, tenantId, updatedAt: now() };
      validateAppointmentInput(next);
      const otherAppointments = data.appointments.filter(a => a.tenantId === tenantId && a.id !== id);
      const conflicts = findConflicts(otherAppointments, next);
      if (conflicts.length) {
        const err = new Error('Schedule conflict detected for technician');
        err.status = 409;
        err.code = 'schedule_conflict';
        err.details = { conflicts };
        throw err;
      }
      data.appointments[idx] = next;
      store.write(data);
      return next;
    },
    delete(tenantId, id) {
      const data = ensureAppointments(store.read());
      const idx = data.appointments.findIndex(a => a.tenantId === tenantId && a.id === id);
      if (idx === -1) return false;
      data.appointments[idx].status = 'cancelled';
      data.appointments[idx].updatedAt = now();
      store.write(data);
      return true;
    }
  };
}

function createPostgresAppointmentRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", job_id::text as "jobId",
    customer_id::text as "customerId", technician_id::text as "technicianId",
    start_time as "startTime", end_time as "endTime", status, notes,
    created_at as "createdAt", updated_at as "updatedAt" FROM appointments`;

  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 ORDER BY start_time`, [tenantId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      validateAppointmentInput(input);
      const conflicts = await store.query(
        `SELECT id FROM appointments
         WHERE tenant_id = $1 AND technician_id = $2::uuid AND status <> 'cancelled'
           AND start_time < $4::timestamptz AND $3::timestamptz < end_time`,
        [tenantId, input.technicianId, input.startTime, input.endTime]
      );
      if (conflicts.rowCount > 0) {
        const err = new Error('Schedule conflict detected for technician');
        err.status = 409;
        err.code = 'schedule_conflict';
        throw err;
      }
      const result = await store.query(
        `INSERT INTO appointments (tenant_id, job_id, customer_id, technician_id, start_time, end_time, status, notes)
         VALUES ($1, $2::uuid, NULLIF($3, '')::uuid, $4::uuid, $5::timestamptz, $6::timestamptz, $7, $8)
         RETURNING id::text, tenant_id as "tenantId", job_id::text as "jobId",
                   customer_id::text as "customerId", technician_id::text as "technicianId",
                   start_time as "startTime", end_time as "endTime", status, notes,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.jobId, input.customerId || '', input.technicianId, input.startTime, input.endTime, input.status || 'scheduled', input.notes || '']
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const next = { ...existing, ...input };
      validateAppointmentInput(next);
      const result = await store.query(
        `UPDATE appointments
         SET job_id = $3::uuid, customer_id = NULLIF($4, '')::uuid, technician_id = $5::uuid,
             start_time = $6::timestamptz, end_time = $7::timestamptz, status = $8, notes = $9, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", job_id::text as "jobId",
                   customer_id::text as "customerId", technician_id::text as "technicianId",
                   start_time as "startTime", end_time as "endTime", status, notes,
                   created_at as "CreatedAt", updated_at as "updatedAt"`,
        [tenantId, id, next.jobId, next.customerId || '', next.technicianId, next.startTime, next.endTime, next.status, next.notes || '']
      );
      return result.rows[0] || null;
    },
    async delete(tenantId, id) {
      const result = await store.query(
        `UPDATE appointments SET status = 'cancelled', updated_at = now() WHERE tenant_id = $1 AND id = $2`,
        [tenantId, id]
      );
      return result.rowCount > 0;
    }
  };
}

module.exports = { createAppointmentRepository };
