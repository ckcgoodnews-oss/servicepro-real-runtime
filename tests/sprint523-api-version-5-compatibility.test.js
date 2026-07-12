const svc=require('../apps/api/src/services/phase33Version5GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'api-version-5-compatibility',name:'Api Version 5 Compatibility'});
if(row.domain!=='api-version-5-compatibility'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['api-version-5-compatibility']!==1)process.exit(1);
console.log('Sprint 523 Api Version 5 Compatibility test passed.');
