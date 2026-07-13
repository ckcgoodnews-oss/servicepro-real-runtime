const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'robot-compliance-evidence',name:'Robot Compliance Evidence'});
if(row.domain!=='robot-compliance-evidence'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['robot-compliance-evidence']!==1)process.exit(1);
console.log('Sprint 578 Robot Compliance Evidence test passed.');
