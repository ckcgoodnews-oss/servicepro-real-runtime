const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'accessibility-browser-compatibility',name:'Accessibility Browser Compatibility'});
if(row.domain!=='accessibility-browser-compatibility'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['accessibility-browser-compatibility']!==1)process.exit(1);
console.log('Sprint 348 Accessibility Browser Compatibility test passed.');
