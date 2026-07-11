const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'api-version-4-compatibility-certification',name:'API Version 4 Compatibility Certification',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
