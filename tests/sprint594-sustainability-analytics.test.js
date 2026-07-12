const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'sustainability-analytics',name:'Sustainability Analytics'});
if(row.domain!=='sustainability-analytics'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['sustainability-analytics']!==1)process.exit(1);
console.log('Sprint 594 Sustainability Analytics test passed.');
