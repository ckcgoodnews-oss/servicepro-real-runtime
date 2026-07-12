const svc=require('../apps/api/src/services/phase28Version4PostGaReliabilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'resilience-exercises',name:'Resilience Exercises'});
if(row.domain!=='resilience-exercises'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['resilience-exercises']!==1)process.exit(1);
console.log('Sprint 459 Resilience Exercises test passed.');
