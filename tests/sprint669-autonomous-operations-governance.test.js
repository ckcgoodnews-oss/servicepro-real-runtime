const svc=require('../apps/api/src/services/phase42AutonomousEnterpriseOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'autonomous-operations-governance',name:'Autonomous Operations Governance'});
if(row.domain!=='autonomous-operations-governance'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['autonomous-operations-governance']!==1)process.exit(1);
console.log('Sprint 669 Autonomous Operations Governance test passed.');
