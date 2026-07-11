const svc=require('../apps/api/src/services/phase13EnterpriseAnalyticsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'customer-analytics',name:'Customer Analytics'});
if(row.domain!=='customer-analytics'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 218 Customer Analytics test passed.');
