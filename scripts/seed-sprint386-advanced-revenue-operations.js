const svc=require('../apps/api/src/services/phase24FinancialGrowthOperationsService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'advanced-revenue-operations',name:'Advanced Revenue Operations',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
