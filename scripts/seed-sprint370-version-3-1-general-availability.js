const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-3-1-general-availability',name:'Version 3.1 General Availability',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
