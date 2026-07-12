const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'production-readiness-reviews',name:'Production Readiness Reviews'});
if(row.domain!=='production-readiness-reviews'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['production-readiness-reviews']!==1)process.exit(1);
console.log('Sprint 548 Production Readiness Reviews test passed.');
