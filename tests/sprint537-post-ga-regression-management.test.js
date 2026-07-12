const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'post-ga-regression-management',name:'Post-Ga Regression Management'});
if(row.domain!=='post-ga-regression-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['post-ga-regression-management']!==1)process.exit(1);
console.log('Sprint 537 Post-Ga Regression Management test passed.');
