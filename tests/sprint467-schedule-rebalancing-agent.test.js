const svc=require('../apps/api/src/services/phase29AutonomousServiceOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'schedule-rebalancing-agent',name:'Schedule Rebalancing Agent'});
if(row.domain!=='schedule-rebalancing-agent'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['schedule-rebalancing-agent']!==1)process.exit(1);
console.log('Sprint 467 Schedule Rebalancing Agent test passed.');
