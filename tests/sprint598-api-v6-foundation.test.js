const svc=require('../apps/api/src/services/phase38Version6FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'api-v6-foundation',name:'Api V6 Foundation'});
if(row.domain!=='api-v6-foundation'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['api-v6-foundation']!==1)process.exit(1);
console.log('Sprint 598 Api V6 Foundation test passed.');
