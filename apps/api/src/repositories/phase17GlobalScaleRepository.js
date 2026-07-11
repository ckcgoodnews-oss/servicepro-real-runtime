const { makeId, now } = require('../services/id');
const svc = require('../services/phase17GlobalScaleService');
function createPhase17GlobalScaleRepository(store) {
  function ensure(data) { data.phase17GlobalScaleRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase17globalScale'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase17GlobalScaleRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase17GlobalScaleRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase17GlobalScaleRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase17GlobalScaleRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase17GlobalScaleRecords[index]=svc.transitionRecord(data.phase17GlobalScaleRecords[index],action); store.write(data); return data.phase17GlobalScaleRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase17GlobalScaleRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase17GlobalScaleRepository };
