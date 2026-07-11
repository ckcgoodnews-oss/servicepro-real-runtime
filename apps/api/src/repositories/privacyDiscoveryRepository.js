const { makeId, now } = require('../services/id');
const svc = require('../services/privacyDiscoveryService');
function ensure(data) { data.privacyDiscoveryScans ||= []; data.privacyDiscoveredRecords ||= []; data.privacyFulfillmentPackages ||= []; return data; }
function update(rows, id, fn) { const i = rows.findIndex(x => x.id === id); if (i < 0) return null; rows[i] = fn(rows[i]); return rows[i]; }
function createPrivacyDiscoveryRepository(store) {
  if (store.type === 'postgres') return { async metrics() { return svc.discoveryMetrics({}); } };
  return {
    createScan(input) { const d=ensure(store.read()); const r={id:makeId('privscan'),...svc.normalizeScanInput(input),createdAt:now(),updatedAt:now()}; d.privacyDiscoveryScans.push(r); store.write(d); return r; },
    startScan(id) { const d=ensure(store.read()); const r=update(d.privacyDiscoveryScans,id,svc.startScan); store.write(d); return r; },
    completeScan(id,count) { const d=ensure(store.read()); const r=update(d.privacyDiscoveryScans,id,x=>svc.completeScan(x,count)); store.write(d); return r; },
    failScan(id,reason) { const d=ensure(store.read()); const r=update(d.privacyDiscoveryScans,id,x=>svc.failScan(x,reason)); store.write(d); return r; },
    addRecord(input) { const d=ensure(store.read()); const r={id:makeId('privrecord'),...svc.normalizeRecordInput(input),createdAt:now()}; d.privacyDiscoveredRecords.push(r); store.write(d); return r; },
    createPackage(input) { const d=ensure(store.read()); const r={id:makeId('privpkg'),...svc.normalizePackageInput(input),createdAt:now(),updatedAt:now()}; d.privacyFulfillmentPackages.push(r); store.write(d); return r; },
    submitPackage(id) { const d=ensure(store.read()); const r=update(d.privacyFulfillmentPackages,id,svc.submitPackage); store.write(d); return r; },
    approvePackage(id,by) { const d=ensure(store.read()); const r=update(d.privacyFulfillmentPackages,id,x=>svc.approvePackage(x,by)); store.write(d); return r; },
    deliverPackage(id,channel) { const d=ensure(store.read()); const r=update(d.privacyFulfillmentPackages,id,x=>svc.deliverPackage(x,channel)); store.write(d); return r; },
    metrics(tenantId) { const d=ensure(store.read()); return svc.discoveryMetrics({scans:d.privacyDiscoveryScans.filter(x=>!tenantId||x.tenantId===tenantId),records:d.privacyDiscoveredRecords.filter(x=>!tenantId||x.tenantId===tenantId),packages:d.privacyFulfillmentPackages.filter(x=>!tenantId||x.tenantId===tenantId)}); }
  };
}
module.exports = { createPrivacyDiscoveryRepository };
