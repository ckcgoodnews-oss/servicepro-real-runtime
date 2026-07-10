const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');

function createPortalBookingRepository(store) {
  if (store.type === 'json') return createJsonPortalBookingRepository(store);
  if (store.type === 'postgres') return createPostgresPortalBookingRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureBookings(data) {
  if (!data.portalBookings) data.portalBookings = [];
  return data;
}

function createJsonPortalBookingRepository(store) {
  return {
    list(tenantId) {
      return ensureBookings(store.read()).portalBookings.filter(b => b.tenantId === tenantId);
    },
    listForCustomer(tenantId, customerId) {
      return ensureBookings(store.read()).portalBookings.filter(b => b.tenantId === tenantId && b.customerId === customerId);
    },
    create(tenantId, input) {
      requireFields(input, ['customerId', 'serviceType', 'requestedDate']);
      const data = ensureBookings(store.read());
      const booking = {
        id: makeId('book'),
        tenantId,
        customerId: input.customerId,
        portalAccountId: input.portalAccountId || '',
        serviceType: input.serviceType,
        requestedDate: input.requestedDate,
        requestedTimeWindow: input.requestedTimeWindow || '',
        address: input.address || '',
        problemDescription: input.problemDescription || '',
        status: input.status || 'requested',
        convertedJobId: '',
        createdAt: now(),
        updatedAt: now()
      };
      data.portalBookings.push(booking);
      store.write(data);
      return booking;
    },
    updateStatus(tenantId, id, status, convertedJobId = '') {
      const data = ensureBookings(store.read());
      const idx = data.portalBookings.findIndex(b => b.tenantId === tenantId && b.id === id);
      if (idx === -1) return null;
      data.portalBookings[idx].status = status;
      data.portalBookings[idx].convertedJobId = convertedJobId || data.portalBookings[idx].convertedJobId || '';
      data.portalBookings[idx].updatedAt = now();
      store.write(data);
      return data.portalBookings[idx];
    }
  };
}

function createPostgresPortalBookingRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    portal_account_id::text as "portalAccountId", service_type as "serviceType",
    requested_date as "requestedDate", requested_time_window as "requestedTimeWindow",
    address, problem_description as "problemDescription", status, converted_job_id::text as "convertedJobId",
    created_at as "createdAt", updated_at as "updatedAt" FROM portal_booking_requests`;

  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]);
      return result.rows;
    },
    async listForCustomer(tenantId, customerId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND customer_id = $2 ORDER BY created_at DESC`, [tenantId, customerId]);
      return result.rows;
    },
    async create(tenantId, input) {
      requireFields(input, ['customerId', 'serviceType', 'requestedDate']);
      const result = await store.query(
        `INSERT INTO portal_booking_requests
         (tenant_id, customer_id, portal_account_id, service_type, requested_date, requested_time_window, address, problem_description, status)
         VALUES ($1, $2::uuid, NULLIF($3, '')::uuid, $4, $5::date, $6, $7, $8, $9)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   portal_account_id::text as "portalAccountId", service_type as "serviceType",
                   requested_date as "requestedDate", requested_time_window as "requestedTimeWindow",
                   address, problem_description as "problemDescription", status, converted_job_id::text as "convertedJobId",
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.customerId, input.portalAccountId || '', input.serviceType, input.requestedDate, input.requestedTimeWindow || '', input.address || '', input.problemDescription || '', input.status || 'requested']
      );
      return result.rows[0];
    },
    async updateStatus(tenantId, id, status, convertedJobId = '') {
      const result = await store.query(
        `UPDATE portal_booking_requests
         SET status = $3, converted_job_id = COALESCE(NULLIF($4, '')::uuid, converted_job_id), updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   portal_account_id::text as "portalAccountId", service_type as "serviceType",
                   requested_date as "requestedDate", requested_time_window as "requestedTimeWindow",
                   address, problem_description as "problemDescription", status, converted_job_id::text as "convertedJobId",
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, status, convertedJobId || '']
      );
      return result.rows[0] || null;
    }
  };
}

module.exports = { createPortalBookingRepository };
