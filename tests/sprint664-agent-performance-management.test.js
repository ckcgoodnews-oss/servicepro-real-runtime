const svc=require('../apps/api/src/services/phase42AutonomousEnterpriseOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'agent-performance-management',name:'Agent Performance Management'});
if(row.domain!=='agent-performance-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['agent-performance-management']!==1)process.exit(1);
console.log('Sprint 664 Agent Performance Management test passed.');
