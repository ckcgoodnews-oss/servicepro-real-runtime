const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'enterprise-delegated-administration',name:'Enterprise Delegated Administration',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
