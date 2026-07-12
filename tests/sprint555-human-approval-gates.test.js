const svc=require('../apps/api/src/services/phase35AgenticWorkforceOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'human-approval-gates',name:'Human Approval Gates'});
if(row.domain!=='human-approval-gates'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['human-approval-gates']!==1)process.exit(1);
console.log('Sprint 555 Human Approval Gates test passed.');
