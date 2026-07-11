const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'data-model-modernization',name:'Data Model Modernization'});
if(row.domain!=='data-model-modernization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['data-model-modernization']!==1)process.exit(1);
console.log('Sprint 419 Data Model Modernization test passed.');
