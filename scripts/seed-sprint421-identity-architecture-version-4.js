const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'identity-architecture-version-4',name:'Identity Architecture Version 4',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
