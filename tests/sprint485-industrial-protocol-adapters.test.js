const svc=require('../apps/api/src/services/phase30ConnectedAssetsEdgeService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'industrial-protocol-adapters',name:'Industrial Protocol Adapters'});
if(row.domain!=='industrial-protocol-adapters'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['industrial-protocol-adapters']!==1)process.exit(1);
console.log('Sprint 485 Industrial Protocol Adapters test passed.');
