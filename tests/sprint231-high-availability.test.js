const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'high-availability',name:'High Availability'});
if(row.domain!=='high-availability'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 231 High Availability test passed.');
