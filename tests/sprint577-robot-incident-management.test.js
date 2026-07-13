const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'robot-incident-management',name:'Robot Incident Management'});
if(row.domain!=='robot-incident-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['robot-incident-management']!==1)process.exit(1);
console.log('Sprint 577 Robot Incident Management test passed.');
