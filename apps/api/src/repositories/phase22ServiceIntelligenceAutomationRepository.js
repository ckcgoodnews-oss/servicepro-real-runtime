const { makeId, now } = require('../services/id');
const svc = require('../services/phase22ServiceIntelligenceAutomationService');
function createPhase22ServiceIntelligenceAutomationRepository(store) {
  function ensure(data) { data.phase22ServiceIntelligenceAutomationRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase22ServiceIntelligenceAutomation'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase22ServiceIntelligenceAutomationRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase22ServiceIntelligenceAutomationRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase22ServiceIntelligenceAutomationRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase22ServiceIntelligenceAutomationRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase22ServiceIntelligenceAutomationRecords[index]=svc.transitionRecord(data.phase22ServiceIntelligenceAutomationRecords[index],action); store.write(data); return data.phase22ServiceIntelligenceAutomationRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase22ServiceIntelligenceAutomationRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase22ServiceIntelligenceAutomationRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase22ServiceIntelligenceAutomationRepository };
