const { makeId, now }=require('../services/id');
const svc=require('../services/phase12MarketplaceService');
function createPhase12MarketplaceRepository(store){
 function ensure(data){data.phase12MarketplaceRecords||=[];return data;}
 return {store,create(input){const d=ensure(store.read());const row={id:makeId('phase12marketplace'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()};d.phase12MarketplaceRecords.push(row);store.write(d);return row;},list(filters={}){return ensure(store.read()).phase12MarketplaceRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain);},get(id){return ensure(store.read()).phase12MarketplaceRecords.find(x=>x.id===id)||null;},transition(id,action){const d=ensure(store.read());const i=d.phase12MarketplaceRecords.findIndex(x=>x.id===id);if(i<0)return null;d.phase12MarketplaceRecords[i]=svc.transitionRecord(d.phase12MarketplaceRecords[i],action);store.write(d);return d.phase12MarketplaceRecords[i];},metrics(tenantId){return svc.metrics(ensure(store.read()).phase12MarketplaceRecords.filter(x=>!tenantId||x.tenantId===tenantId));}};
}
module.exports={createPhase12MarketplaceRepository};
