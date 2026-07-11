const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'tenant-version-4-migration-dry-runs',name:'Tenant Version 4 Migration Dry Runs',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
