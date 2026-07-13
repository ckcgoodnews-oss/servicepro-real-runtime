const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'autonomous-route-optimization',name:'Autonomous Route Optimization'});
if(row.domain!=='autonomous-route-optimization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['autonomous-route-optimization']!==1)process.exit(1);
console.log('Sprint 574 Autonomous Route Optimization test passed.');
