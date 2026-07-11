const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-4-defect-closure',name:'Version 4 Defect Closure',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
