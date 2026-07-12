const svc=require('../apps/api/src/services/phase32Version5FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'event-platform-modernization',name:'Event Platform Modernization'});
if(row.domain!=='event-platform-modernization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['event-platform-modernization']!==1)process.exit(1);
console.log('Sprint 510 Event Platform Modernization test passed.');
