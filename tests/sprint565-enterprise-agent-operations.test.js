const svc=require('../apps/api/src/services/phase35AgenticWorkforceOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-agent-operations',name:'Enterprise Agent Operations'});
if(row.domain!=='enterprise-agent-operations'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['enterprise-agent-operations']!==1)process.exit(1);
console.log('Sprint 565 Enterprise Agent Operations test passed.');
