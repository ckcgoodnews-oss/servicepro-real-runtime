const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'environmental-compliance-reporting',name:'Environmental Compliance Reporting'});
if(row.domain!=='environmental-compliance-reporting'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['environmental-compliance-reporting']!==1)process.exit(1);
console.log('Sprint 589 Environmental Compliance Reporting test passed.');
