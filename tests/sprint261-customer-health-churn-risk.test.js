const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'customer-health-churn-risk',name:'Customer Health Churn Risk'});
if(row.domain!=='customer-health-churn-risk'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['customer-health-churn-risk']!==1)process.exit(1);
console.log('Sprint 261 Customer Health Churn Risk test passed.');
