const svc=require('../apps/api/src/services/phase17GlobalScaleService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'regional-compliance-packs',name:'Regional Compliance Packs'});
if(row.domain!=='regional-compliance-packs'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['regional-compliance-packs']!==1)process.exit(1);
console.log('Sprint 292 Regional Compliance Packs test passed.');
