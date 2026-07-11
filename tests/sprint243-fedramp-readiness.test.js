const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'fedramp-readiness',name:'FedRAMP Readiness'});
if(row.domain!=='fedramp-readiness'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 243 FedRAMP Readiness test passed.');
