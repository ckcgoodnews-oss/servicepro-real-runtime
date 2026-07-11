const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'automated-root-cause-analysis',name:'Automated Root Cause Analysis',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
