const { makeId, now } = require('../services/id');
const svc = require('../services/phase26Version4FoundationRcService');
function createPhase26Version4FoundationRcRepository(store) {
  function ensure(data) { data.phase26Version4FoundationRcRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase26Version4FoundationRc'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase26Version4FoundationRcRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase26Version4FoundationRcRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase26Version4FoundationRcRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase26Version4FoundationRcRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase26Version4FoundationRcRecords[index]=svc.transitionRecord(data.phase26Version4FoundationRcRecords[index],action); store.write(data); return data.phase26Version4FoundationRcRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase26Version4FoundationRcRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase26Version4FoundationRcRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase26Version4FoundationRcRepository };
