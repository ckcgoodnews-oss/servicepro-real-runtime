const svc=require('../apps/api/src/services/phase30ConnectedAssetsEdgeService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'firmware-campaigns',name:'Firmware Campaigns'});
if(row.domain!=='firmware-campaigns'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['firmware-campaigns']!==1)process.exit(1);
console.log('Sprint 481 Firmware Campaigns test passed.');
