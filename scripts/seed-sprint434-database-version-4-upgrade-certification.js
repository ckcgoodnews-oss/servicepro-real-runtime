const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'database-version-4-upgrade-certification',name:'Database Version 4 Upgrade Certification',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
