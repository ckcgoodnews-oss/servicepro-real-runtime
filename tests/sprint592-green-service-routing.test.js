const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'green-service-routing',name:'Green Service Routing'});
if(row.domain!=='green-service-routing'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['green-service-routing']!==1)process.exit(1);
console.log('Sprint 592 Green Service Routing test passed.');
