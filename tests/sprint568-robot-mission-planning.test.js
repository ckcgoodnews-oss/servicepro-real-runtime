const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'robot-mission-planning',name:'Robot Mission Planning'});
if(row.domain!=='robot-mission-planning'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['robot-mission-planning']!==1)process.exit(1);
console.log('Sprint 568 Robot Mission Planning test passed.');
