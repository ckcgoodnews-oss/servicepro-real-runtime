const svc=require('../apps/api/src/services/phase32Version5FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-5-pilot',name:'Version 5 Pilot'});
if(row.domain!=='version-5-pilot'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-5-pilot']!==1)process.exit(1);
console.log('Sprint 518 Version 5 Pilot test passed.');
