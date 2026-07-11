const { makeId, now }=require('../services/id');
const svc=require('../services/phase11PlatformOperationsService');
function createPhase11PlatformoperationsRepository(store){
 function ensure(data){data.phase11PlatformOperationsRecords||=[];return data;}
 return {store,create(input){const d=ensure(store.read());const row={id:makeId('phase11platformoperations'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()};d.phase11PlatformOperationsRecords.push(row);store.write(d);return row;},list(filters={}){return ensure(store.read()).phase11PlatformOperationsRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain);},get(id){return ensure(store.read()).phase11PlatformOperationsRecords.find(x=>x.id===id)||null;},transition(id,action){const d=ensure(store.read());const i=d.phase11PlatformOperationsRecords.findIndex(x=>x.id===id);if(i<0)return null;d.phase11PlatformOperationsRecords[i]=svc.transitionRecord(d.phase11PlatformOperationsRecords[i],action);store.write(d);return d.phase11PlatformOperationsRecords[i];},metrics(tenantId){return svc.metrics(ensure(store.read()).phase11PlatformOperationsRecords.filter(x=>!tenantId||x.tenantId===tenantId));}};
}
module.exports={createPhase11PlatformoperationsRepository};
