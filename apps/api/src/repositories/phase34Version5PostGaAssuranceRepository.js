const { makeId, now } = require('../services/id');
const svc = require('../services/phase34Version5PostGaAssuranceService');
function createPhase34version5postgaassuranceRepository(store) {
  function ensure(data) { data.phase34Version5PostGaAssuranceRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase34'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase34Version5PostGaAssuranceRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase34Version5PostGaAssuranceRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase34Version5PostGaAssuranceRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase34Version5PostGaAssuranceRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase34Version5PostGaAssuranceRecords[index]=svc.transitionRecord(data.phase34Version5PostGaAssuranceRecords[index],action); store.write(data); return data.phase34Version5PostGaAssuranceRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase34Version5PostGaAssuranceRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase34Version5PostGaAssuranceRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase34version5postgaassuranceRepository };
