const svc=require('../apps/api/src/services/phase12MarketplaceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'workflow-marketplace',name:'Workflow Marketplace'});
if(row.domain!=='workflow-marketplace'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 209 Workflow Marketplace test passed.');
