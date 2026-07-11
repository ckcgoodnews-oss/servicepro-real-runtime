const { makeId, now } = require('../services/id');
const svc = require('../services/phase15PostGaLtsService');
function createPhase15PostGaLtsRepository(store) {
  function ensure(data) { data.phase15PostGaLtsRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase15postGaLts'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase15PostGaLtsRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase15PostGaLtsRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase15PostGaLtsRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase15PostGaLtsRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase15PostGaLtsRecords[index]=svc.transitionRecord(data.phase15PostGaLtsRecords[index],action); store.write(data); return data.phase15PostGaLtsRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase15PostGaLtsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase15PostGaLtsRepository };
