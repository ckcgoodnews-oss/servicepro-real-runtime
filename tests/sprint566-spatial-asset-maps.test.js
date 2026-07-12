const svc=require('../apps/api/src/services/phase36SpatialRoboticsOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'spatial-asset-maps',name:'Spatial Asset Maps'});
if(row.domain!=='spatial-asset-maps'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['spatial-asset-maps']!==1)process.exit(1);
console.log('Sprint 566 Spatial Asset Maps test passed.');
