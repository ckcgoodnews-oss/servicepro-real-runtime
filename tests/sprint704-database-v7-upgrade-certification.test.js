const svc=require('../apps/api/src/services/phase45Version7GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'database-v7-upgrade-certification',name:'Database V7 Upgrade Certification'});
if(row.domain!=='database-v7-upgrade-certification'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['database-v7-upgrade-certification']!==1)process.exit(1);
console.log('Sprint 704 Database V7 Upgrade Certification test passed.');
