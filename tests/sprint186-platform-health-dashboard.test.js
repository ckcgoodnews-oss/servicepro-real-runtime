const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'platform-health-dashboard',name:'Platform Health Dashboard'});
if(row.domain!=='platform-health-dashboard'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 186 Platform Health Dashboard test passed.');
