const svc=require('../apps/api/src/services/phase24FinancialGrowthOperationsService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-3-3-general-availability',name:'Version 3.3 General Availability',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
