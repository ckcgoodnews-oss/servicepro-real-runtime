const svc=require('../apps/api/src/services/phase12MarketplaceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'plugin-sdk',name:'Plugin SDK'});
if(row.domain!=='plugin-sdk'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 202 Plugin SDK test passed.');
