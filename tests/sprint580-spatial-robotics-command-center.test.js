const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'spatial-robotics-command-center',name:'Spatial Robotics Command Center'});
if(row.domain!=='spatial-robotics-command-center'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['spatial-robotics-command-center']!==1)process.exit(1);
console.log('Sprint 580 Spatial Robotics Command Center test passed.');
