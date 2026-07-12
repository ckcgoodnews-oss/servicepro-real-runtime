const svc=require('../apps/api/src/services/phase33Version5GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-5-administrator-documentation',name:'Version 5 Administrator Documentation'});
if(row.domain!=='version-5-administrator-documentation'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-5-administrator-documentation']!==1)process.exit(1);
console.log('Sprint 530 Version 5 Administrator Documentation test passed.');
