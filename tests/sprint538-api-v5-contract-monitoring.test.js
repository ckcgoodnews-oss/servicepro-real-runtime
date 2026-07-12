const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'api-v5-contract-monitoring',name:'Api V5 Contract Monitoring'});
if(row.domain!=='api-v5-contract-monitoring'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['api-v5-contract-monitoring']!==1)process.exit(1);
console.log('Sprint 538 Api V5 Contract Monitoring test passed.');
