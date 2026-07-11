const svc=require('../apps/api/src/services/phase24FinancialGrowthOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'advanced-revenue-operations',name:'Advanced Revenue Operations'});
if(row.domain!=='advanced-revenue-operations'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['advanced-revenue-operations']!==1)process.exit(1);
console.log('Sprint 386 Advanced Revenue Operations test passed.');
