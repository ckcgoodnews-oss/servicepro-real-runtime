const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'predictive-scheduling',name:'Predictive Scheduling'});
if(row.domain!=='predictive-scheduling'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 181 Predictive Scheduling test passed.');
