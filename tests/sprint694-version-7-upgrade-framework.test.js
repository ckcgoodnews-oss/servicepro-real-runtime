const svc=require('../apps/api/src/services/phase44Version7FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-7-upgrade-framework',name:'Version 7 Upgrade Framework'});
if(row.domain!=='version-7-upgrade-framework'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-7-upgrade-framework']!==1)process.exit(1);
console.log('Sprint 694 Version 7 Upgrade Framework test passed.');
