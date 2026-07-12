const { makeId, now } = require('../services/id');
const svc = require('../services/phase30ConnectedAssetsEdgeService');
function createPhase30ConnectedAssetsEdgeRepository(store) {
  function ensure(data) { data.phase30ConnectedAssetsEdgeRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase30'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase30ConnectedAssetsEdgeRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase30ConnectedAssetsEdgeRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase30ConnectedAssetsEdgeRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase30ConnectedAssetsEdgeRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase30ConnectedAssetsEdgeRecords[index]=svc.transitionRecord(data.phase30ConnectedAssetsEdgeRecords[index],action); store.write(data); return data.phase30ConnectedAssetsEdgeRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase30ConnectedAssetsEdgeRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase30ConnectedAssetsEdgeRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase30ConnectedAssetsEdgeRepository };
