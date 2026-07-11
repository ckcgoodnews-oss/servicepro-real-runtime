const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'forecasting-engine',name:'Forecasting Engine'});
if(row.domain!=='forecasting-engine'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 182 Forecasting Engine test passed.');
