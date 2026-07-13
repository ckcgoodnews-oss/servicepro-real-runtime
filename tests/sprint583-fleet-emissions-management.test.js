const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'fleet-emissions-management',name:'Fleet Emissions Management'});
if(row.domain!=='fleet-emissions-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['fleet-emissions-management']!==1)process.exit(1);
console.log('Sprint 583 Fleet Emissions Management test passed.');
