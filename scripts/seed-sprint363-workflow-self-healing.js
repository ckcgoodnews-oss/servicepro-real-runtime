const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'workflow-self-healing',name:'Workflow Self-Healing',owner:'platform'});
console.log(JSON.stringify(svc.transitionRecord(row,'pass'),null,2));
