const svc=require('../apps/api/src/services/phase20Version3FoundationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'technical-debt-retirement',name:'Technical Debt Retirement'});
if(row.domain!=='technical-debt-retirement'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['technical-debt-retirement']!==1)process.exit(1);
console.log('Sprint 336 Technical Debt Retirement test passed.');
