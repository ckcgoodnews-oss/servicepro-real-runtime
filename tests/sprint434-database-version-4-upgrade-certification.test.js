const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'database-version-4-upgrade-certification',name:'Database Version 4 Upgrade Certification'});
if(row.domain!=='database-version-4-upgrade-certification'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['database-version-4-upgrade-certification']!==1)process.exit(1);
console.log('Sprint 434 Database Version 4 Upgrade Certification test passed.');
