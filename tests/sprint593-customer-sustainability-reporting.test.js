const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'customer-sustainability-reporting',name:'Customer Sustainability Reporting'});
if(row.domain!=='customer-sustainability-reporting'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['customer-sustainability-reporting']!==1)process.exit(1);
console.log('Sprint 593 Customer Sustainability Reporting test passed.');
