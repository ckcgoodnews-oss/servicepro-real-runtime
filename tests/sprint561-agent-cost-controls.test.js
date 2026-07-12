const svc=require('../apps/api/src/services/phase35AgenticWorkforceOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'agent-cost-controls',name:'Agent Cost Controls'});
if(row.domain!=='agent-cost-controls'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['agent-cost-controls']!==1)process.exit(1);
console.log('Sprint 561 Agent Cost Controls test passed.');
