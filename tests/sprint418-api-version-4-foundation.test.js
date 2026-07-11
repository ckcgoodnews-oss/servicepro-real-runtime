const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'api-version-4-foundation',name:'API Version 4 Foundation'});
if(row.domain!=='api-version-4-foundation'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['api-version-4-foundation']!==1)process.exit(1);
console.log('Sprint 418 API Version 4 Foundation test passed.');
