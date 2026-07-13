const svc=require('../apps/api/src/services/phase42AutonomousEnterpriseOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'autonomous-incident-response',name:'Autonomous Incident Response'});
if(row.domain!=='autonomous-incident-response'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['autonomous-incident-response']!==1)process.exit(1);
console.log('Sprint 665 Autonomous Incident Response test passed.');
