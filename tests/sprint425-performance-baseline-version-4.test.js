const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'performance-baseline-version-4',name:'Performance Baseline Version 4'});
if(row.domain!=='performance-baseline-version-4'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['performance-baseline-version-4']!==1)process.exit(1);
console.log('Sprint 425 Performance Baseline Version 4 test passed.');
