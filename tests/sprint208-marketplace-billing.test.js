const svc=require('../apps/api/src/services/phase12MarketplaceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'marketplace-billing',name:'Marketplace Billing'});
if(row.domain!=='marketplace-billing'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 208 Marketplace Billing test passed.');
