const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'background-job-scheduler',name:'Background Job Scheduler'});
if(row.domain!=='background-job-scheduler'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 187 Background Job Scheduler test passed.');
