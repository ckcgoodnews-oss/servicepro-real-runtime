const svc=require('../apps/api/src/services/phase28Version4PostGaReliabilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'customer-impact-command',name:'Customer Impact Command'});
if(row.domain!=='customer-impact-command'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['customer-impact-command']!==1)process.exit(1);
console.log('Sprint 450 Customer Impact Command test passed.');
