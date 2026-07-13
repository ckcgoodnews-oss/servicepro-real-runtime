const svc=require('../apps/api/src/services/phase42AutonomousEnterpriseOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'continuous-optimization',name:'Continuous Optimization'});
if(row.domain!=='continuous-optimization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['continuous-optimization']!==1)process.exit(1);
console.log('Sprint 661 Continuous Optimization test passed.');
