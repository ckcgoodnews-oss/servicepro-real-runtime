const svc=require('../apps/api/src/services/phase35AgenticWorkforceOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'agent-workforce-analytics',name:'Agent Workforce Analytics'});
if(row.domain!=='agent-workforce-analytics'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['agent-workforce-analytics']!==1)process.exit(1);
console.log('Sprint 564 Agent Workforce Analytics test passed.');
