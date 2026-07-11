const svc=require('../apps/api/src/services/phase12MarketplaceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'graphql-api',name:'GraphQL API'});
if(row.domain!=='graphql-api'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 205 GraphQL API test passed.');
