const svc=require('../apps/api/src/services/phase42AutonomousEnterpriseOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'autonomous-financial-controls',name:'Autonomous Financial Controls'});
if(row.domain!=='autonomous-financial-controls'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['autonomous-financial-controls']!==1)process.exit(1);
console.log('Sprint 667 Autonomous Financial Controls test passed.');
