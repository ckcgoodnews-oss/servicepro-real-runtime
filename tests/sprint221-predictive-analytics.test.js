const svc=require('../apps/api/src/services/phase13EnterpriseAnalyticsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'predictive-analytics',name:'Predictive Analytics'});
if(row.domain!=='predictive-analytics'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 221 Predictive Analytics test passed.');
