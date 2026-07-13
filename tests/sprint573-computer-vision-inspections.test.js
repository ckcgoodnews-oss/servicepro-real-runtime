const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'computer-vision-inspections',name:'Computer Vision Inspections'});
if(row.domain!=='computer-vision-inspections'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['computer-vision-inspections']!==1)process.exit(1);
console.log('Sprint 573 Computer Vision Inspections test passed.');
