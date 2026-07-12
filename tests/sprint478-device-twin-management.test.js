const svc=require('../apps/api/src/services/phase30ConnectedAssetsEdgeService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'device-twin-management',name:'Device Twin Management'});
if(row.domain!=='device-twin-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['device-twin-management']!==1)process.exit(1);
console.log('Sprint 478 Device Twin Management test passed.');
