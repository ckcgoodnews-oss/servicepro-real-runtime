const svc=require('../apps/api/src/services/phase30ConnectedAssetsEdgeService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'site-gateway-management',name:'Site Gateway Management'});
if(row.domain!=='site-gateway-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['site-gateway-management']!==1)process.exit(1);
console.log('Sprint 484 Site Gateway Management test passed.');
