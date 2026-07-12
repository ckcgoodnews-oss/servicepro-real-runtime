const { makeId, now } = require('../services/id');
const svc = require('../services/phase32Version5FoundationRcService');
function createPhase32Version5FoundationRcRepository(store) {
  function ensure(data) { data.phase32Version5FoundationRcRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase32'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase32Version5FoundationRcRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase32Version5FoundationRcRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase32Version5FoundationRcRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase32Version5FoundationRcRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase32Version5FoundationRcRecords[index]=svc.transitionRecord(data.phase32Version5FoundationRcRecords[index],action); store.write(data); return data.phase32Version5FoundationRcRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase32Version5FoundationRcRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase32Version5FoundationRcRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase32Version5FoundationRcRepository };
