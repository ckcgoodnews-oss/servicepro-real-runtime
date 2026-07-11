const { makeId, now }=require('../services/id');
const svc=require('../services/phase14EnterpriseProductionService');
function createPhase14EnterpriseproductionRepository(store){
 function ensure(data){data.phase14EnterpriseProductionRecords||=[];return data;}
 return {store,create(input){const d=ensure(store.read());const row={id:makeId('phase14enterpriseproduction'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()};d.phase14EnterpriseProductionRecords.push(row);store.write(d);return row;},list(filters={}){return ensure(store.read()).phase14EnterpriseProductionRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain);},get(id){return ensure(store.read()).phase14EnterpriseProductionRecords.find(x=>x.id===id)||null;},transition(id,action){const d=ensure(store.read());const i=d.phase14EnterpriseProductionRecords.findIndex(x=>x.id===id);if(i<0)return null;d.phase14EnterpriseProductionRecords[i]=svc.transitionRecord(d.phase14EnterpriseProductionRecords[i],action);store.write(d);return d.phase14EnterpriseProductionRecords[i];},metrics(tenantId){return svc.metrics(ensure(store.read()).phase14EnterpriseProductionRecords.filter(x=>!tenantId||x.tenantId===tenantId));}};
}
module.exports={createPhase14EnterpriseproductionRepository};
