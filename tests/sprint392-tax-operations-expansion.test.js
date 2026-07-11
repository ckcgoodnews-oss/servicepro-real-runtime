const svc=require('../apps/api/src/services/phase24FinancialGrowthOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'tax-operations-expansion',name:'Tax Operations Expansion'});
if(row.domain!=='tax-operations-expansion'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['tax-operations-expansion']!==1)process.exit(1);
console.log('Sprint 392 Tax Operations Expansion test passed.');
