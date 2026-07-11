const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'workflow-runtime-version-4',name:'Workflow Runtime Version 4',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
