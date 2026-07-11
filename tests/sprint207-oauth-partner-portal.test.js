const svc=require('../apps/api/src/services/phase12MarketplaceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'oauth-partner-portal',name:'OAuth Partner Portal'});
if(row.domain!=='oauth-partner-portal'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 207 OAuth Partner Portal test passed.');
