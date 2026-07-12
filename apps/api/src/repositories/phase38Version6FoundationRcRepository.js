const { makeId, now } = require('../services/id');
const svc = require('../services/phase38Version6FoundationRcService');
function createPhase38version6foundationrcRepository(store) {
  function ensure(data) { data.phase38Version6FoundationRcRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase38'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase38Version6FoundationRcRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase38Version6FoundationRcRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase38Version6FoundationRcRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase38Version6FoundationRcRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase38Version6FoundationRcRecords[index]=svc.transitionRecord(data.phase38Version6FoundationRcRecords[index],action); store.write(data); return data.phase38Version6FoundationRcRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase38Version6FoundationRcRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase38Version6FoundationRcRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase38version6foundationrcRepository };
