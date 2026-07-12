const svc=require('../apps/api/src/services/phase30ConnectedAssetsEdgeService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'offline-command-queue',name:'Offline Command Queue'});
if(row.domain!=='offline-command-queue'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['offline-command-queue']!==1)process.exit(1);
console.log('Sprint 480 Offline Command Queue test passed.');
