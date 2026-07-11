const { makeId, now } = require('../services/id');
const svc = require('../services/phase18IndustrySolutionsService');
function createPhase18IndustrySolutionsRepository(store) {
  function ensure(data) { data.phase18IndustrySolutionsRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase18industrySolutions'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase18IndustrySolutionsRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase18IndustrySolutionsRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase18IndustrySolutionsRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase18IndustrySolutionsRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase18IndustrySolutionsRecords[index]=svc.transitionRecord(data.phase18IndustrySolutionsRecords[index],action); store.write(data); return data.phase18IndustrySolutionsRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase18IndustrySolutionsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase18IndustrySolutionsRepository };
