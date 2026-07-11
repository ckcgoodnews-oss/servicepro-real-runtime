const { makeId, now } = require('../services/id');
const s = require('../services/enterpriseRiskService');

const RISK_SELECT = `SELECT id::text, tenant_id AS "tenantId", code, title, description, category, owner, status,
  inherent_likelihood AS "inherentLikelihood", inherent_impact AS "inherentImpact", inherent_score AS "inherentScore",
  inherent_band AS "inherentBand", residual_likelihood AS "residualLikelihood", residual_impact AS "residualImpact",
  residual_score AS "residualScore", residual_band AS "residualBand", review_at AS "reviewAt",
  assessed_at AS "assessedAt", metadata, created_at AS "createdAt", updated_at AS "updatedAt" FROM enterprise_risks`;
const KRI_SELECT = `SELECT id::text, tenant_id AS "tenantId", risk_id::text AS "riskId", name, unit, threshold::float8,
  current_value::float8 AS "currentValue", status, measured_at AS "measuredAt", created_at AS "createdAt",
  updated_at AS "updatedAt" FROM enterprise_risk_kris`;
const TREATMENT_SELECT = `SELECT id::text, tenant_id AS "tenantId", risk_id::text AS "riskId", owner, response, plan,
  status, due_at AS "dueAt", completed_at AS "completedAt", evidence, created_at AS "createdAt",
  updated_at AS "updatedAt" FROM enterprise_risk_treatments`;

function ensure(data) {
  data.enterpriseRisks ||= [];
  data.enterpriseRiskKris ||= [];
  data.enterpriseRiskTreatments ||= [];
  return data;
}

function update(rows, tenantId, id, fn) {
  const index = rows.findIndex(row => row.id === id && row.tenantId === tenantId);
  if (index < 0) return null;
  rows[index] = fn(rows[index]);
  return rows[index];
}

function createJsonRepository(store) {
  return {
    createRisk(input) { const data = ensure(store.read()); const row = { id: makeId('risk'), ...s.normalizeRisk(input), createdAt: now(), updatedAt: now() }; data.enterpriseRisks.push(row); store.write(data); return row; },
    assessRisk(tenantId, id, likelihood, impact) { const data = ensure(store.read()); const row = update(data.enterpriseRisks, tenantId, id, value => s.assess(value, likelihood, impact)); store.write(data); return row; },
    createKri(input) { const data = ensure(store.read()); if (!data.enterpriseRisks.some(row => row.id === input.riskId && row.tenantId === input.tenantId)) return null; const row = { id: makeId('kri'), ...s.normalizeKri(input), createdAt: now(), updatedAt: now() }; data.enterpriseRiskKris.push(row); store.write(data); return row; },
    measureKri(tenantId, id, value) { const data = ensure(store.read()); const row = update(data.enterpriseRiskKris, tenantId, id, current => s.measureKri(current, value)); store.write(data); return row; },
    createTreatment(input) { const data = ensure(store.read()); if (!data.enterpriseRisks.some(row => row.id === input.riskId && row.tenantId === input.tenantId)) return null; const row = { id: makeId('treat'), ...s.normalizeTreatment(input), createdAt: now(), updatedAt: now() }; data.enterpriseRiskTreatments.push(row); store.write(data); return row; },
    completeTreatment(tenantId, id, evidence) { const data = ensure(store.read()); const row = update(data.enterpriseRiskTreatments, tenantId, id, current => s.completeTreatment(current, evidence)); store.write(data); return row; },
    metrics(tenantId) { const data = ensure(store.read()); const filter = rows => rows.filter(row => !tenantId || row.tenantId === tenantId); return s.metrics({ risks: filter(data.enterpriseRisks), kris: filter(data.enterpriseRiskKris), treatments: filter(data.enterpriseRiskTreatments) }); }
  };
}

function createPostgresRepository(store) {
  return {
    async createRisk(input) {
      const x = s.normalizeRisk(input);
      const result = await store.query(`INSERT INTO enterprise_risks
        (tenant_id,code,title,description,category,owner,status,inherent_likelihood,inherent_impact,inherent_score,inherent_band,residual_likelihood,residual_impact,residual_score,residual_band,review_at,metadata)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NULLIF($16,'')::timestamptz,$17::jsonb)
        RETURNING id::text`, [x.tenantId,x.code,x.title,x.description,x.category,x.owner,x.status,x.inherentLikelihood,x.inherentImpact,x.inherentScore,x.inherentBand,x.residualLikelihood,x.residualImpact,x.residualScore,x.residualBand,x.reviewAt,JSON.stringify(x.metadata)]);
      return this.findRisk(input.tenantId, result.rows[0].id);
    },
    async findRisk(tenantId, id) { return (await store.query(`${RISK_SELECT} WHERE tenant_id=$1 AND id=$2::uuid`, [tenantId,id])).rows[0] || null; },
    async assessRisk(tenantId, id, likelihood, impact) {
      const score = s.score(likelihood, impact);
      const result = await store.query(`UPDATE enterprise_risks SET status='assessed', residual_likelihood=$3, residual_impact=$4,
        residual_score=$5, residual_band=$6, assessed_at=now(), updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text`,
      [tenantId,id,Number(likelihood),Number(impact),score,s.band(score)]);
      return result.rowCount ? this.findRisk(tenantId,id) : null;
    },
    async createKri(input) {
      const x = s.normalizeKri(input);
      const result = await store.query(`INSERT INTO enterprise_risk_kris
        (tenant_id,risk_id,name,unit,threshold,current_value,status,measured_at)
        SELECT $1,r.id,$3,$4,$5,$6,$7,$8::timestamptz FROM enterprise_risks r WHERE r.tenant_id=$1 AND r.id=$2::uuid RETURNING id::text`,
      [x.tenantId,x.riskId,x.name,x.unit,x.threshold,x.currentValue,x.status,x.measuredAt]);
      return result.rowCount ? this.findKri(x.tenantId,result.rows[0].id) : null;
    },
    async findKri(tenantId,id) { return (await store.query(`${KRI_SELECT} WHERE tenant_id=$1 AND id=$2::uuid`,[tenantId,id])).rows[0] || null; },
    async measureKri(tenantId,id,value) {
      const numeric = Number(value);
      const result = await store.query(`UPDATE enterprise_risk_kris SET current_value=$3,
        status=CASE WHEN $3 > threshold THEN 'breached' ELSE 'normal' END, measured_at=now(), updated_at=now()
        WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text`,[tenantId,id,numeric]);
      return result.rowCount ? this.findKri(tenantId,id) : null;
    },
    async createTreatment(input) {
      const x = s.normalizeTreatment(input);
      const result = await store.query(`INSERT INTO enterprise_risk_treatments
        (tenant_id,risk_id,owner,response,plan,status,due_at,evidence)
        SELECT $1,r.id,$3,$4,$5,$6,NULLIF($7,'')::timestamptz,$8::jsonb FROM enterprise_risks r
        WHERE r.tenant_id=$1 AND r.id=$2::uuid RETURNING id::text`,
      [x.tenantId,x.riskId,x.owner,x.response,x.plan,x.status,x.dueAt,JSON.stringify(x.evidence)]);
      return result.rowCount ? this.findTreatment(x.tenantId,result.rows[0].id) : null;
    },
    async findTreatment(tenantId,id) { return (await store.query(`${TREATMENT_SELECT} WHERE tenant_id=$1 AND id=$2::uuid`,[tenantId,id])).rows[0] || null; },
    async completeTreatment(tenantId,id,evidence=[]) {
      const result = await store.query(`UPDATE enterprise_risk_treatments SET status='completed', evidence=$3::jsonb,
        completed_at=now(), updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text`,[tenantId,id,JSON.stringify(evidence)]);
      return result.rowCount ? this.findTreatment(tenantId,id) : null;
    },
    async metrics(tenantId) {
      const [risks,kris,treatments] = await Promise.all([
        store.query(`${RISK_SELECT} WHERE tenant_id=$1`,[tenantId]), store.query(`${KRI_SELECT} WHERE tenant_id=$1`,[tenantId]),
        store.query(`${TREATMENT_SELECT} WHERE tenant_id=$1`,[tenantId])
      ]);
      return s.metrics({risks:risks.rows,kris:kris.rows,treatments:treatments.rows});
    }
  };
}

function createEnterpriseRiskRepository(store) {
  if (store.type === 'json') return createJsonRepository(store);
  if (store.type === 'postgres') return createPostgresRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

module.exports = { createEnterpriseRiskRepository };
