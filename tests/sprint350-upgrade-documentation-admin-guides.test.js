const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'upgrade-documentation-admin-guides',name:'Upgrade Documentation Admin Guides'});
if(row.domain!=='upgrade-documentation-admin-guides'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['upgrade-documentation-admin-guides']!==1)process.exit(1);
console.log('Sprint 350 Upgrade Documentation Admin Guides test passed.');
