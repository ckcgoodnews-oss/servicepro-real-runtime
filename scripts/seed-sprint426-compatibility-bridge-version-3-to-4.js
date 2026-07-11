const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'compatibility-bridge-version-3-to-4',name:'Compatibility Bridge Version 3 to 4',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
