const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'compatibility-bridge-version-3-to-4',name:'Compatibility Bridge Version 3 to 4'});
if(row.domain!=='compatibility-bridge-version-3-to-4'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['compatibility-bridge-version-3-to-4']!==1)process.exit(1);
console.log('Sprint 426 Compatibility Bridge Version 3 to 4 test passed.');
