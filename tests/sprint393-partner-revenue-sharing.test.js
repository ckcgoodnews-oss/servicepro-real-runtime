const svc=require('../apps/api/src/services/phase24FinancialGrowthOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'partner-revenue-sharing',name:'Partner Revenue Sharing'});
if(row.domain!=='partner-revenue-sharing'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['partner-revenue-sharing']!==1)process.exit(1);
console.log('Sprint 393 Partner Revenue Sharing test passed.');
