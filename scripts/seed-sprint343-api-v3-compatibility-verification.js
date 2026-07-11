const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'api-v3-compatibility-verification',name:'API V3 Compatibility Verification',owner:'release-management'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
