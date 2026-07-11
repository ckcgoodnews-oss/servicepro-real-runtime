const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'integration-testing-lab',name:'Integration Testing Lab'});
if(row.domain!=='integration-testing-lab'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['integration-testing-lab']!==1)process.exit(1);
console.log('Sprint 322 Integration Testing Lab test passed.');
