const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'repair-versus-replace-optimization',name:'Repair Versus Replace Optimization'});
if(row.domain!=='repair-versus-replace-optimization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['repair-versus-replace-optimization']!==1)process.exit(1);
console.log('Sprint 587 Repair Versus Replace Optimization test passed.');
