const svc=require('../apps/api/src/services/phase24FinancialGrowthOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'usage-based-billing',name:'Usage-Based Billing'});
if(row.domain!=='usage-based-billing'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['usage-based-billing']!==1)process.exit(1);
console.log('Sprint 387 Usage-Based Billing test passed.');
