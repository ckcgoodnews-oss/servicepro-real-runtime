const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'tenant-upgrade-assurance',name:'Tenant Upgrade Assurance'});
if(row.domain!=='tenant-upgrade-assurance'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['tenant-upgrade-assurance']!==1)process.exit(1);
console.log('Sprint 540 Tenant Upgrade Assurance test passed.');
