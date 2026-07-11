const { makeId, now } = require('../services/id');
const s = require('../services/businessContinuityService');

const PLAN_SELECT = `SELECT id::text,tenant_id AS "tenantId",code,name,type,owner,status,business_service AS "businessService",rto_minutes AS "rtoMinutes",rpo_minutes AS "rpoMinutes",dependencies,approved_by AS "approvedBy",approved_at AS "approvedAt",activated_at AS "activatedAt",next_exercise_at AS "nextExerciseAt",metadata,created_at AS "createdAt",updated_at AS "updatedAt" FROM continuity_plans`;
const EXERCISE_SELECT = `SELECT id::text,tenant_id AS "tenantId",plan_id::text AS "planId",name,type,status,scheduled_at AS "scheduledAt",started_at AS "startedAt",completed_at AS "completedAt",actual_rto_minutes AS "actualRtoMinutes",actual_rpo_minutes AS "actualRpoMinutes",findings,evidence,facilitator,created_at AS "createdAt",updated_at AS "updatedAt" FROM continuity_exercises`;
const PROCEDURE_SELECT = `SELECT id::text,tenant_id AS "tenantId",plan_id::text AS "planId",name,sort_order AS "order",steps,owner,checklist,metadata,created_at AS "createdAt",updated_at AS "updatedAt" FROM recovery_procedures`;

function ensure(d){d.continuityPlans||=[];d.recoveryProcedures||=[];d.continuityExercises||=[];return d}
function update(rows,tenantId,id,fn){const i=rows.findIndex(x=>x.id===id&&x.tenantId===tenantId);if(i<0)return null;rows[i]=fn(rows[i]);return rows[i]}
function hasPlan(d,tenantId,id){return d.continuityPlans.some(x=>x.id===id&&x.tenantId===tenantId)}

function createJsonRepository(store){return{
  createPlan(x){const d=ensure(store.read()),r={id:makeId('bcplan'),...s.normalizePlan(x),createdAt:now(),updatedAt:now()};d.continuityPlans.push(r);store.write(d);return r},
  approvePlan(t,id,by){const d=ensure(store.read()),r=update(d.continuityPlans,t,id,x=>s.approvePlan(x,by));store.write(d);return r},
  activatePlan(t,id){const d=ensure(store.read()),r=update(d.continuityPlans,t,id,s.activatePlan);store.write(d);return r},
  createProcedure(x){const d=ensure(store.read());if(!hasPlan(d,x.tenantId,x.planId))return null;const r={id:makeId('recproc'),...s.normalizeProcedure(x),createdAt:now(),updatedAt:now()};d.recoveryProcedures.push(r);store.write(d);return r},
  createExercise(x){const d=ensure(store.read());if(!hasPlan(d,x.tenantId,x.planId))return null;const r={id:makeId('bcex'),...s.normalizeExercise(x),createdAt:now(),updatedAt:now()};d.continuityExercises.push(r);store.write(d);return r},
  startExercise(t,id){const d=ensure(store.read()),r=update(d.continuityExercises,t,id,s.startExercise);store.write(d);return r},
  completeExercise(t,id,x){const d=ensure(store.read()),r=update(d.continuityExercises,t,id,v=>s.completeExercise(v,x));store.write(d);return r},
  metrics(t){const d=ensure(store.read()),f=a=>a.filter(x=>!t||x.tenantId===t);return s.metrics({plans:f(d.continuityPlans),exercises:f(d.continuityExercises)})}
}}

function createPostgresRepository(store){return{
  async findPlan(t,id){return(await store.query(`${PLAN_SELECT} WHERE tenant_id=$1 AND id=$2::uuid`,[t,id])).rows[0]||null},
  async findExercise(t,id){return(await store.query(`${EXERCISE_SELECT} WHERE tenant_id=$1 AND id=$2::uuid`,[t,id])).rows[0]||null},
  async createPlan(input){const x=s.normalizePlan(input),q=await store.query(`INSERT INTO continuity_plans(tenant_id,code,name,type,owner,status,business_service,rto_minutes,rpo_minutes,dependencies,next_exercise_at,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,NULLIF($11,'')::timestamptz,$12::jsonb) RETURNING id::text`,[x.tenantId,x.code,x.name,x.type,x.owner,x.status,x.businessService,x.rtoMinutes,x.rpoMinutes,JSON.stringify(x.dependencies),x.nextExerciseAt,JSON.stringify(x.metadata)]);return this.findPlan(x.tenantId,q.rows[0].id)},
  async approvePlan(t,id,by){if(!by)s.approvePlan({},by);const q=await store.query(`UPDATE continuity_plans SET status='approved',approved_by=$3,approved_at=now(),updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text`,[t,id,by]);return q.rowCount?this.findPlan(t,id):null},
  async activatePlan(t,id){const q=await store.query(`UPDATE continuity_plans SET status='active',activated_at=now(),updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid AND status='approved' RETURNING id::text`,[t,id]);return q.rowCount?this.findPlan(t,id):null},
  async createProcedure(input){const x=s.normalizeProcedure(input),q=await store.query(`INSERT INTO recovery_procedures(tenant_id,plan_id,name,sort_order,steps,owner,checklist,metadata) SELECT $1,p.id,$3,$4,$5::jsonb,$6,$7::jsonb,$8::jsonb FROM continuity_plans p WHERE p.tenant_id=$1 AND p.id=$2::uuid RETURNING id::text`,[x.tenantId,x.planId,x.name,x.order,JSON.stringify(x.steps),x.owner,JSON.stringify(x.checklist),JSON.stringify(x.metadata)]);if(!q.rowCount)return null;return(await store.query(`${PROCEDURE_SELECT} WHERE tenant_id=$1 AND id=$2::uuid`,[x.tenantId,q.rows[0].id])).rows[0]},
  async createExercise(input){const x=s.normalizeExercise(input),q=await store.query(`INSERT INTO continuity_exercises(tenant_id,plan_id,name,type,status,scheduled_at,findings,evidence,facilitator) SELECT $1,p.id,$3,$4,$5,$6::timestamptz,$7::jsonb,$8::jsonb,$9 FROM continuity_plans p WHERE p.tenant_id=$1 AND p.id=$2::uuid RETURNING id::text`,[x.tenantId,x.planId,x.name,x.type,x.status,x.scheduledAt,JSON.stringify(x.findings),JSON.stringify(x.evidence),x.facilitator]);return q.rowCount?this.findExercise(x.tenantId,q.rows[0].id):null},
  async startExercise(t,id){const q=await store.query(`UPDATE continuity_exercises SET status='running',started_at=now(),updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid AND status='planned' RETURNING id::text`,[t,id]);return q.rowCount?this.findExercise(t,id):null},
  async completeExercise(t,id,outcome={}){if(!['passed','failed'].includes(outcome.status))s.completeExercise({},outcome);const q=await store.query(`UPDATE continuity_exercises SET status=$3,actual_rto_minutes=$4,actual_rpo_minutes=$5,findings=$6::jsonb,evidence=$7::jsonb,completed_at=now(),updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid AND status='running' RETURNING id::text`,[t,id,outcome.status,Number(outcome.actualRtoMinutes||0),Number(outcome.actualRpoMinutes||0),JSON.stringify(outcome.findings||[]),JSON.stringify(outcome.evidence||[])]);return q.rowCount?this.findExercise(t,id):null},
  async metrics(t){const[plans,exercises]=await Promise.all([store.query(`${PLAN_SELECT} WHERE tenant_id=$1`,[t]),store.query(`${EXERCISE_SELECT} WHERE tenant_id=$1`,[t])]);return s.metrics({plans:plans.rows,exercises:exercises.rows})}
}}

function createBusinessContinuityRepository(store){if(store.type==='json')return createJsonRepository(store);if(store.type==='postgres')return createPostgresRepository(store);throw new Error(`Unsupported store type: ${store.type}`)}
module.exports={createBusinessContinuityRepository};
