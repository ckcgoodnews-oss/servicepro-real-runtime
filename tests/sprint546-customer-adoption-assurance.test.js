const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'customer-adoption-assurance',name:'Customer Adoption Assurance'});
if(row.domain!=='customer-adoption-assurance'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['customer-adoption-assurance']!==1)process.exit(1);
console.log('Sprint 546 Customer Adoption Assurance test passed.');
