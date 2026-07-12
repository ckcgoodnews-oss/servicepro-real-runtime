const svc=require('../apps/api/src/services/phase29AutonomousServiceOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'field-agent-copilot',name:'Field Agent Copilot'});
if(row.domain!=='field-agent-copilot'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['field-agent-copilot']!==1)process.exit(1);
console.log('Sprint 465 Field Agent Copilot test passed.');
