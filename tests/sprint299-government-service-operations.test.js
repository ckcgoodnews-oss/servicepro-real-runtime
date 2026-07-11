const svc=require('../apps/api/src/services/phase18IndustrySolutionsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'government-service-operations',name:'Government Service Operations'});
if(row.domain!=='government-service-operations'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['government-service-operations']!==1)process.exit(1);
console.log('Sprint 299 Government Service Operations test passed.');
