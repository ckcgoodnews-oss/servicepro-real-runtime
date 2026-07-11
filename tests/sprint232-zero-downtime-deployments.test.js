const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'zero-downtime-deployments',name:'Zero-Downtime Deployments'});
if(row.domain!=='zero-downtime-deployments'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 232 Zero-Downtime Deployments test passed.');
