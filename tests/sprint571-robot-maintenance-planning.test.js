const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'robot-maintenance-planning',name:'Robot Maintenance Planning'});
if(row.domain!=='robot-maintenance-planning'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['robot-maintenance-planning']!==1)process.exit(1);
console.log('Sprint 571 Robot Maintenance Planning test passed.');
