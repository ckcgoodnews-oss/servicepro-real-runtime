const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-4-regression-triage',name:'Version 4 Regression Triage',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
