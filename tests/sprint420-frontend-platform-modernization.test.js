const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'frontend-platform-modernization',name:'Frontend Platform Modernization'});
if(row.domain!=='frontend-platform-modernization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['frontend-platform-modernization']!==1)process.exit(1);
console.log('Sprint 420 Frontend Platform Modernization test passed.');
