const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'feature-flags',name:'Feature Flags'});
if(row.domain!=='feature-flags'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 196 Feature Flags test passed.');
