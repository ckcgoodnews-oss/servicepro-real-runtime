const svc=require('../apps/api/src/services/phase12MarketplaceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'desktop-synchronization',name:'Desktop Synchronization'});
if(row.domain!=='desktop-synchronization'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 212 Desktop Synchronization test passed.');
