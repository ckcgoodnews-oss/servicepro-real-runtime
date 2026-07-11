const { makeId, now } = require('../services/id');
const svc = require('../services/phase16EnterpriseIntelligenceService');
function createPhase16EnterpriseIntelligenceRepository(store) {
  function ensure(data) { data.phase16EnterpriseIntelligenceRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase16enterpriseIntelligence'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase16EnterpriseIntelligenceRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase16EnterpriseIntelligenceRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase16EnterpriseIntelligenceRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase16EnterpriseIntelligenceRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase16EnterpriseIntelligenceRecords[index]=svc.transitionRecord(data.phase16EnterpriseIntelligenceRecords[index],action); store.write(data); return data.phase16EnterpriseIntelligenceRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase16EnterpriseIntelligenceRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase16EnterpriseIntelligenceRepository };
