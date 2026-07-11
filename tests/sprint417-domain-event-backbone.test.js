const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'domain-event-backbone',name:'Domain Event Backbone'});
if(row.domain!=='domain-event-backbone'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['domain-event-backbone']!==1)process.exit(1);
console.log('Sprint 417 Domain Event Backbone test passed.');
