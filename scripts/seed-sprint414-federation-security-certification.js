const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'federation-security-certification',name:'Federation Security Certification',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
