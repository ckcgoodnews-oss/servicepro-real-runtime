const svc=require('../apps/api/src/services/phase29AutonomousServiceOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'autonomous-dispatch-recommendations',name:'Autonomous Dispatch Recommendations'});
if(row.domain!=='autonomous-dispatch-recommendations'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['autonomous-dispatch-recommendations']!==1)process.exit(1);
console.log('Sprint 462 Autonomous Dispatch Recommendations test passed.');
