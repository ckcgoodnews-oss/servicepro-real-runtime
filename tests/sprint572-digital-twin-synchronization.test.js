const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'digital-twin-synchronization',name:'Digital Twin Synchronization'});
if(row.domain!=='digital-twin-synchronization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['digital-twin-synchronization']!==1)process.exit(1);
console.log('Sprint 572 Digital Twin Synchronization test passed.');
