const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'release-candidate-defect-closure',name:'Release Candidate Defect Closure',owner:'release-management'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
