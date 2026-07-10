const { makeId, now } = require('../services/id');
const { calculateNextVisitDate } = require('../services/agreementService');

function createAgreementVisitRepository(store) {
  if (store.type === 'json') return createJsonAgreementVisitRepository(store);
  if (store.type === 'postgres') return createPostgresAgreementVisitRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureVisits(data) {
  if (!data.agreementVisits) data.agreementVisits = [];
  return data;
}

function createJsonAgreementVisitRepository(store) {
  return {
    list(tenantId) {
      return ensureVisits(store.read()).agreementVisits.filter(x => x.tenantId === tenantId);
    },
    listForAgreement(tenantId, agreementId) {
      return this.list(tenantId).filter(x => x.agreementId === agreementId);
    },
    create(tenantId, input) {
      const data = ensureVisits(store.read());
      const visit = {
        id: makeId('visit'), tenantId, agreementId: input.agreementId, customerId: input.customerId,
        jobId: input.jobId || '', scheduledDate: input.scheduledDate, completedDate: input.completedDate || '',
        status: input.status || 'scheduled', notes: input.notes || '', createdAt: now(), updatedAt: now()
      };
      data.agreementVisits.push(visit);
      store.write(data);
      return visit;
    },
    generateNextVisit(tenantId, agreement, completedVisitCount = 0) {
      return this.create(tenantId, {
        agreementId: agreement.id,
        customerId: agreement.customerId,
        scheduledDate: calculateNextVisitDate(agreement.startDate, agreement.frequency, completedVisitCount),
        status: 'scheduled'
      });
    }
  };
}

function createPostgresAgreementVisitRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", agreement_id::text as "agreementId",
    customer_id::text as "customerId", job_id::text as "jobId", scheduled_date as "scheduledDate",
    completed_date as "completedDate", status, notes, created_at as "createdAt", updated_at as "updatedAt"
    FROM agreement_visits`;
  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 ORDER BY scheduled_date`, [tenantId]);
      return result.rows;
    },
    async listForAgreement(tenantId, agreementId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND agreement_id = $2 ORDER BY scheduled_date`, [tenantId, agreementId]);
      return result.rows;
    },
    async create(tenantId, input) {
      const result = await store.query(
        `INSERT INTO agreement_visits
         (tenant_id, agreement_id, customer_id, job_id, scheduled_date, completed_date, status, notes)
         VALUES ($1, $2::uuid, $3::uuid, NULLIF($4, '')::uuid, $5::date, NULLIF($6, '')::date, $7, $8)
         RETURNING id::text, tenant_id as "tenantId", agreement_id::text as "agreementId",
                   customer_id::text as "customerId", job_id::text as "jobId", scheduled_date as "scheduledDate",
                   completed_date as "completedDate", status, notes, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.agreementId, input.customerId, input.jobId || '', input.scheduledDate, input.completedDate || '', input.status || 'scheduled', input.notes || '']
      );
      return result.rows[0];
    },
    async generateNextVisit(tenantId, agreement, completedVisitCount = 0) {
      return this.create(tenantId, {
        agreementId: agreement.id,
        customerId: agreement.customerId,
        scheduledDate: calculateNextVisitDate(agreement.startDate, agreement.frequency, completedVisitCount),
        status: 'scheduled'
      });
    }
  };
}

module.exports = { createAgreementVisitRepository };
