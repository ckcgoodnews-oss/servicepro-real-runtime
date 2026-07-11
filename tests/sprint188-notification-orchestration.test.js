const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'notification-orchestration',name:'Notification Orchestration'});
if(row.domain!=='notification-orchestration'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 188 Notification Orchestration test passed.');
