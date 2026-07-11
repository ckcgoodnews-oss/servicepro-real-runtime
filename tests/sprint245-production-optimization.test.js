const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'production-optimization',name:'Production Optimization'});
if(row.domain!=='production-optimization'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 245 Production Optimization test passed.');
