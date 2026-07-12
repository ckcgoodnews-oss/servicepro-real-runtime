const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'performance-regression-control',name:'Performance Regression Control'});
if(row.domain!=='performance-regression-control'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['performance-regression-control']!==1)process.exit(1);
console.log('Sprint 541 Performance Regression Control test passed.');
