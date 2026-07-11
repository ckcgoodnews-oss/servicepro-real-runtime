const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'observability',name:'Observability'});
if(row.domain!=='observability'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 194 Observability test passed.');
