const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'api-version-4-foundation',name:'API Version 4 Foundation',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
