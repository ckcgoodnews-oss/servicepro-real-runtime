const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-4-migration-assistant',name:'Version 4 Migration Assistant',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
