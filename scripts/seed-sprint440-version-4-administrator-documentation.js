const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-4-administrator-documentation',name:'Version 4 Administrator Documentation',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
