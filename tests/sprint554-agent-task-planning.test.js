const svc=require('../apps/api/src/services/phase35AgenticWorkforceOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'agent-task-planning',name:'Agent Task Planning'});
if(row.domain!=='agent-task-planning'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['agent-task-planning']!==1)process.exit(1);
console.log('Sprint 554 Agent Task Planning test passed.');
