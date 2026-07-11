const svc=require('../apps/api/src/services/phase13EnterpriseAnalyticsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'financial-analytics',name:'Financial Analytics'});
if(row.domain!=='financial-analytics'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 217 Financial Analytics test passed.');
