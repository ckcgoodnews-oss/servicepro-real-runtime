const svc=require('../apps/api/src/services/phase30ConnectedAssetsEdgeService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'edge-security-posture',name:'Edge Security Posture'});
if(row.domain!=='edge-security-posture'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['edge-security-posture']!==1)process.exit(1);
console.log('Sprint 483 Edge Security Posture test passed.');
