const svc=require('../apps/api/src/services/phase29AutonomousServiceOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'workflow-anomaly-detection',name:'Workflow Anomaly Detection'});
if(row.domain!=='workflow-anomaly-detection'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['workflow-anomaly-detection']!==1)process.exit(1);
console.log('Sprint 471 Workflow Anomaly Detection test passed.');
