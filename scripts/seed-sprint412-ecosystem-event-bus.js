const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'ecosystem-event-bus',name:'Ecosystem Event Bus',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
