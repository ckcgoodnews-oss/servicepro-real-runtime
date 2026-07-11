const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'regional-deployments',name:'Regional Deployments'});
if(row.domain!=='regional-deployments'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 191 Regional Deployments test passed.');
