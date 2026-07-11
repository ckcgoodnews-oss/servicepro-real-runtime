const svc=require('../apps/api/src/services/phase13EnterpriseAnalyticsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'data-warehouse-integration',name:'Data Warehouse Integration'});
if(row.domain!=='data-warehouse-integration'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 229 Data Warehouse Integration test passed.');
