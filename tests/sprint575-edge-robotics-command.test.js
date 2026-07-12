const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'edge-robotics-command',name:'Edge Robotics Command'});
if(row.domain!=='edge-robotics-command'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['edge-robotics-command']!==1)process.exit(1);
console.log('Sprint 575 Edge Robotics Command test passed.');
