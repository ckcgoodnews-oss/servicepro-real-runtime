const svc=require('../apps/api/src/services/phase28Version4PostGaReliabilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'error-budget-governance',name:'Error Budget Governance'});
if(row.domain!=='error-budget-governance'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['error-budget-governance']!==1)process.exit(1);
console.log('Sprint 447 Error Budget Governance test passed.');
