const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'customer-pilot-acceptance-tracking',name:'Customer Pilot Acceptance Tracking',owner:'release-management'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
