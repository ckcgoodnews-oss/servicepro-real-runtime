const svc=require('../apps/api/src/services/phase30ConnectedAssetsEdgeService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'remote-diagnostics',name:'Remote Diagnostics'});
if(row.domain!=='remote-diagnostics'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['remote-diagnostics']!==1)process.exit(1);
console.log('Sprint 487 Remote Diagnostics test passed.');
