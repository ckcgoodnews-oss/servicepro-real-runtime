const svc=require('../apps/api/src/services/phase42AutonomousEnterpriseOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'autonomous-compliance-monitoring',name:'Autonomous Compliance Monitoring'});
if(row.domain!=='autonomous-compliance-monitoring'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['autonomous-compliance-monitoring']!==1)process.exit(1);
console.log('Sprint 668 Autonomous Compliance Monitoring test passed.');
