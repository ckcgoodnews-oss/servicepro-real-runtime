const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'post-ga-defect-intake',name:'Post Ga Defect Intake'});
if(row.domain!=='post-ga-defect-intake'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['post-ga-defect-intake']!==1)process.exit(1);
console.log('Sprint 252 Post Ga Defect Intake test passed.');
