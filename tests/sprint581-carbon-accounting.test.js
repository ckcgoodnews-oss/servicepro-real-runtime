const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'carbon-accounting',name:'Carbon Accounting'});
if(row.domain!=='carbon-accounting'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['carbon-accounting']!==1)process.exit(1);
console.log('Sprint 581 Carbon Accounting test passed.');
