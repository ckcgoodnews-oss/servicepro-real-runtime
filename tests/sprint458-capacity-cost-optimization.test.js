const svc=require('../apps/api/src/services/phase28Version4PostGaReliabilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'capacity-cost-optimization',name:'Capacity Cost Optimization'});
if(row.domain!=='capacity-cost-optimization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['capacity-cost-optimization']!==1)process.exit(1);
console.log('Sprint 458 Capacity Cost Optimization test passed.');
