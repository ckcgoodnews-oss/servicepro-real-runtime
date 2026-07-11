const svc=require('../apps/api/src/services/phase13EnterpriseAnalyticsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'data-catalog',name:'Data Catalog'});
if(row.domain!=='data-catalog'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 227 Data Catalog test passed.');
