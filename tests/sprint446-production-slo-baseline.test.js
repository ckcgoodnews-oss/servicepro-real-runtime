const svc=require('../apps/api/src/services/phase28Version4PostGaReliabilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'production-slo-baseline',name:'Production Slo Baseline'});
if(row.domain!=='production-slo-baseline'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['production-slo-baseline']!==1)process.exit(1);
console.log('Sprint 446 Production Slo Baseline test passed.');
