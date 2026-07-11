const { makeId, now } = require('../services/id');
const svc = require('../services/phase20Version3FoundationService');
function createPhase20Version3FoundationRepository(store) {
  function ensure(data) { data.phase20Version3FoundationRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase20version3Foundation'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase20Version3FoundationRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase20Version3FoundationRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase20Version3FoundationRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase20Version3FoundationRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase20Version3FoundationRecords[index]=svc.transitionRecord(data.phase20Version3FoundationRecords[index],action); store.write(data); return data.phase20Version3FoundationRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase20Version3FoundationRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase20Version3FoundationRepository };
