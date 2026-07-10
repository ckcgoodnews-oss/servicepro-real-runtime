const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');

function createDispatchRepository(store) {
  if (store.type === 'json') return createJsonDispatchRepository(store);
  if (store.type === 'postgres') return createPostgresDispatchRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureDispatch(data) {
  if (!data.dispatchAssignments) data.dispatchAssignments = [];
  return data;
}

function createJsonDispatchRepository(store) {
  return {
    list(tenantId) {
      return ensureDispatch(store.read()).dispatchAssignments.filter(d => d.tenantId === tenantId);
    },
    assign(tenantId, input) {
      requireFields(input, ['jobId', 'technicianId']);
      const data = ensureDispatch(store.read());
      const assignment = {
        id: makeId('disp'),
        tenantId,
        jobId: input.jobId,
        technicianId: input.technicianId,
        appointmentId: input.appointmentId || '',
        status: input.status || 'assigned',
        assignedAt: now(),
        createdAt: now(),
        updatedAt: now()
      };
      data.dispatchAssignments.push(assignment);
      store.write(data);
      return assignment;
    },
    updateStatus(tenantId, id, status) {
      const data = ensureDispatch(store.read());
      const idx = data.dispatchAssignments.findIndex(d => d.tenantId === tenantId && d.id === id);
      if (idx === -1) return null;
      data.dispatchAssignments[idx].status = status;
      data.dispatchAssignments[idx].updatedAt = now();
      store.write(data);
      return data.dispatchAssignments[idx];
    }
  };
}

function createPostgresDispatchRepository(store) {
  return {
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", job_id::text as "jobId",
                technician_id::text as "technicianId", appointment_id::text as "appointmentId",
                status, assigned_at as "assignedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM dispatch_assignments WHERE tenant_id = $1 ORDER BY assigned_at DESC`,
        [tenantId]
      );
      return result.rows;
    },
    async assign(tenantId, input) {
      requireFields(input, ['jobId', 'technicianId']);
      const result = await store.query(
        `INSERT INTO dispatch_assignments (tenant_id, job_id, technician_id, appointment_id, status)
         VALUES ($1, $2::uuid, $3::uuid, NULLIF($4, '')::uuid, $5)
         RETURNING id::text, tenant_id as "tenantId", job_id::text as "jobId",
                   technician_id::text as "technicianId", appointment_id::text as "appointmentId",
                   status, assigned_at as "assignedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.jobId, input.technicianId, input.appointmentId || '', input.status || 'assigned']
      );
      return result.rows[0];
    },
    async updateStatus(tenantId, id, status) {
      const result = await store.query(
        `UPDATE dispatch_assignments SET status = $3, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", job_id::text as "jobId",
                   technician_id::text as "technicianId", appointment_id::text as "appointmentId",
                   status, assigned_at as "assignedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, status]
      );
      return result.rows[0] || null;
    }
  };
}

module.exports = { createDispatchRepository };
