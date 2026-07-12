const svc=require('../apps/api/src/services/phase28Version4PostGaReliabilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'post-ga-defect-triage',name:'Post Ga Defect Triage'});
if(row.domain!=='post-ga-defect-triage'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['post-ga-defect-triage']!==1)process.exit(1);
console.log('Sprint 448 Post Ga Defect Triage test passed.');
