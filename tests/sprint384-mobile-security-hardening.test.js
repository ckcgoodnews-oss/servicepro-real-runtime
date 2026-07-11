const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'mobile-security-hardening',name:'Mobile Security Hardening'});
if(row.domain!=='mobile-security-hardening'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['mobile-security-hardening']!==1)process.exit(1);
console.log('Sprint 384 Mobile Security Hardening test passed.');
