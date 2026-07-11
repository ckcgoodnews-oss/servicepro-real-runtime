const svc=require('../apps/api/src/services/phase24FinancialGrowthOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'revenue-assurance',name:'Revenue Assurance'});
if(row.domain!=='revenue-assurance'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['revenue-assurance']!==1)process.exit(1);
console.log('Sprint 398 Revenue Assurance test passed.');
