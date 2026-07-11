const svc=require('../apps/api/src/services/phase12MarketplaceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'public-rest-api',name:'Public REST API'});
if(row.domain!=='public-rest-api'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 204 Public REST API test passed.');
