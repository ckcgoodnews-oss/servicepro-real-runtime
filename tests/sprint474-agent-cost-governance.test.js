const svc=require('../apps/api/src/services/phase29AutonomousServiceOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'agent-cost-governance',name:'Agent Cost Governance'});
if(row.domain!=='agent-cost-governance'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['agent-cost-governance']!==1)process.exit(1);
console.log('Sprint 474 Agent Cost Governance test passed.');
