const svc=require('../apps/api/src/services/phase42AutonomousEnterpriseOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'autonomous-enterprise-readiness',name:'Autonomous Enterprise Readiness'});
if(row.domain!=='autonomous-enterprise-readiness'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['autonomous-enterprise-readiness']!==1)process.exit(1);
console.log('Sprint 670 Autonomous Enterprise Readiness test passed.');
