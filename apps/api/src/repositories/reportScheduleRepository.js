const { makeId, now } = require('../services/id');
const { validationError } = require('../errors/domainError');

const FREQUENCIES=['daily','weekly','monthly'];
const REPORT_KEYS=['revenue','jobs-by-status','inventory-value','portal-bookings'];
function normalize(input={},existing={}){const reportKey=input.reportKey??existing.reportKey;const frequency=input.frequency??existing.frequency??'weekly';const recipients=Array.isArray(input.recipients)?input.recipients:String(input.recipients??existing.recipients??'').split(',').map(value=>value.trim()).filter(Boolean);if(!REPORT_KEYS.includes(reportKey))throw validationError('reportKey must be a supported report');if(!FREQUENCIES.includes(frequency))throw validationError('frequency must be daily, weekly, or monthly');if(!recipients.length)throw validationError('at least one recipient is required');return{reportKey,frequency,format:'csv',recipients,nextRunAt:String(input.nextRunAt??existing.nextRunAt??'').trim(),active:input.active===undefined?existing.active!==false:Boolean(input.active)};}
function createReportScheduleRepository(store){if(store.type==='json')return createJson(store);if(store.type==='postgres')return createPostgres(store);throw new Error(`Unsupported store type: ${store.type}`);}
function ensure(data){if(!data.reportSchedules)data.reportSchedules=[];return data;}
function createJson(store){return{
  list(tenantId){return ensure(store.read()).reportSchedules.filter(row=>row.tenantId===tenantId).sort((a,b)=>String(a.nextRunAt).localeCompare(String(b.nextRunAt)));},
  findById(tenantId,id){return ensure(store.read()).reportSchedules.find(row=>row.tenantId===tenantId&&row.id===id)||null;},
  create(tenantId,input){const data=ensure(store.read());const stamp=now();const row={id:makeId('rptsched'),tenantId,...normalize(input),lastRunAt:'',createdAt:stamp,updatedAt:stamp};data.reportSchedules.push(row);store.write(data);return row;},
  update(tenantId,id,input){const data=ensure(store.read());const index=data.reportSchedules.findIndex(row=>row.tenantId===tenantId&&row.id===id);if(index===-1)return null;data.reportSchedules[index]={...data.reportSchedules[index],...normalize(input,data.reportSchedules[index]),id,tenantId,updatedAt:now()};store.write(data);return data.reportSchedules[index];},
  remove(tenantId,id){const data=ensure(store.read());const before=data.reportSchedules.length;data.reportSchedules=data.reportSchedules.filter(row=>!(row.tenantId===tenantId&&row.id===id));if(data.reportSchedules.length===before)return false;store.write(data);return true;}
};}
const select=`SELECT id::text,tenant_id AS "tenantId",report_key AS "reportKey",frequency,format,recipients,next_run_at AS "nextRunAt",last_run_at AS "lastRunAt",active,created_at AS "createdAt",updated_at AS "updatedAt" FROM report_schedules`;
function createPostgres(store){return{
  async list(tenantId){return(await store.query(`${select} WHERE tenant_id=$1 ORDER BY next_run_at`,[tenantId])).rows;},
  async findById(tenantId,id){return(await store.query(`${select} WHERE tenant_id=$1 AND id=$2 LIMIT 1`,[tenantId,id])).rows[0]||null;},
  async create(tenantId,input){const x=normalize(input);return(await store.query(`INSERT INTO report_schedules(tenant_id,report_key,frequency,format,recipients,next_run_at,active) VALUES($1,$2,$3,$4,$5::jsonb,$6,$7) RETURNING id::text,tenant_id AS "tenantId",report_key AS "reportKey",frequency,format,recipients,next_run_at AS "nextRunAt",last_run_at AS "lastRunAt",active,created_at AS "createdAt",updated_at AS "updatedAt"`,[tenantId,x.reportKey,x.frequency,x.format,JSON.stringify(x.recipients),x.nextRunAt||null,x.active])).rows[0];},
  async update(tenantId,id,input){const old=await this.findById(tenantId,id);if(!old)return null;const x=normalize(input,old);return(await store.query(`UPDATE report_schedules SET report_key=$3,frequency=$4,recipients=$5::jsonb,next_run_at=$6,active=$7,updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING id::text,tenant_id AS "tenantId",report_key AS "reportKey",frequency,format,recipients,next_run_at AS "nextRunAt",last_run_at AS "lastRunAt",active,created_at AS "createdAt",updated_at AS "updatedAt"`,[tenantId,id,x.reportKey,x.frequency,JSON.stringify(x.recipients),x.nextRunAt||null,x.active])).rows[0]||null;},
  async remove(tenantId,id){return(await store.query('DELETE FROM report_schedules WHERE tenant_id=$1 AND id=$2',[tenantId,id])).rowCount>0;}
};}
module.exports={FREQUENCIES,REPORT_KEYS,normalizeReportSchedule:normalize,createReportScheduleRepository};
