const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'platform-upgrade-manager',name:'Platform Upgrade Manager'});
if(row.domain!=='platform-upgrade-manager'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 198 Platform Upgrade Manager test passed.');
