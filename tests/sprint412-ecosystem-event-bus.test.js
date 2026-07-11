const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'ecosystem-event-bus',name:'Ecosystem Event Bus'});
if(row.domain!=='ecosystem-event-bus'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['ecosystem-event-bus']!==1)process.exit(1);
console.log('Sprint 412 Ecosystem Event Bus test passed.');
