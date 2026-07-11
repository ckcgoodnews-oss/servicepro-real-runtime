const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'digital-service-check-in',name:'Digital Service Check-In',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
