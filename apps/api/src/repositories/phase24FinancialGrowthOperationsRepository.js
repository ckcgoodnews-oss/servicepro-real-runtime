const { makeId, now } = require('../services/id');
const svc = require('../services/phase24FinancialGrowthOperationsService');
function createPhase24FinancialGrowthOperationsRepository(store) {
  function ensure(data) { data.phase24FinancialGrowthOperationsRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase24FinancialGrowthOperations'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase24FinancialGrowthOperationsRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase24FinancialGrowthOperationsRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase24FinancialGrowthOperationsRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase24FinancialGrowthOperationsRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase24FinancialGrowthOperationsRecords[index]=svc.transitionRecord(data.phase24FinancialGrowthOperationsRecords[index],action); store.write(data); return data.phase24FinancialGrowthOperationsRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase24FinancialGrowthOperationsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase24FinancialGrowthOperationsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase24FinancialGrowthOperationsRepository };
