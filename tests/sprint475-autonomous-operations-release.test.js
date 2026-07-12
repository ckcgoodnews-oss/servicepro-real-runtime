const svc=require('../apps/api/src/services/phase29AutonomousServiceOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'autonomous-operations-release',name:'Autonomous Operations Release'});
if(row.domain!=='autonomous-operations-release'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['autonomous-operations-release']!==1)process.exit(1);
console.log('Sprint 475 Autonomous Operations Release test passed.');
