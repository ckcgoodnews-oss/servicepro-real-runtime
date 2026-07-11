const svc=require('../apps/api/src/services/phase12MarketplaceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'automation-marketplace',name:'Automation Marketplace'});
if(row.domain!=='automation-marketplace'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 210 Automation Marketplace test passed.');
