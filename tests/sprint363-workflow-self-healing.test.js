const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'workflow-self-healing',name:'Workflow Self-Healing'});
if(row.domain!=='workflow-self-healing'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['workflow-self-healing']!==1)process.exit(1);
console.log('Sprint 363 Workflow Self-Healing test passed.');
