const { makeId, now } = require('../services/id');
const s = require('../services/policyManagementService');
function ensure(d){d.governancePolicies||=[];d.governancePolicyVersions||=[];d.governancePolicyAcknowledgements||=[];d.governancePolicyExceptions||=[];return d}
function update(a,t,id,fn){const i=a.findIndex(x=>x.id===id&&x.tenantId===t);if(i<0)return null;a[i]=fn(a[i]);return a[i]}
function createJson(store){function parent(d,t,id){return d.governancePolicies.some(x=>x.id===id&&x.tenantId===t)}return{
createPolicy(i){const d=ensure(store.read()),r={id:makeId('policy'),...s.normalizePolicy(i),createdAt:now(),updatedAt:now()};d.governancePolicies.push(r);store.write(d);return r},
createVersion(i){const d=ensure(store.read());if(!parent(d,i.tenantId,i.policyId))return null;const r={id:makeId('policyver'),...s.normalizeVersion(i),createdAt:now(),updatedAt:now()};d.governancePolicyVersions.push(r);store.write(d);return r},
submitVersion(t,id){const d=ensure(store.read()),r=update(d.governancePolicyVersions,t,id,s.submitVersion);store.write(d);return r},
decideVersion(t,id,x,by,c){const d=ensure(store.read()),r=update(d.governancePolicyVersions,t,id,v=>s.decideVersion(v,x,by,c));store.write(d);return r},
publishVersion(t,id){const d=ensure(store.read()),r=update(d.governancePolicyVersions,t,id,s.publishVersion),p=r&&update(d.governancePolicies,t,r.policyId,x=>({...x,status:'published',currentVersionId:r.id,publishedAt:r.publishedAt,updatedAt:now()}));store.write(d);return r&&p?{version:r,policy:p}:null},
createAcknowledgement(i){const d=ensure(store.read());if(!parent(d,i.tenantId,i.policyId)||!d.governancePolicyVersions.some(x=>x.id===i.versionId&&x.policyId===i.policyId&&x.tenantId===i.tenantId))return null;const r={id:makeId('policyack'),...s.normalizeAcknowledgement(i),createdAt:now(),updatedAt:now()};d.governancePolicyAcknowledgements.push(r);store.write(d);return r},
acknowledge(t,id,a){const d=ensure(store.read()),r=update(d.governancePolicyAcknowledgements,t,id,x=>s.acknowledge(x,a));store.write(d);return r},
createException(i){const d=ensure(store.read());if(!parent(d,i.tenantId,i.policyId))return null;const r={id:makeId('policyex'),...s.normalizeException(i),createdAt:now(),updatedAt:now()};d.governancePolicyExceptions.push(r);store.write(d);return r},
decideException(t,id,x,by,c){const d=ensure(store.read()),r=update(d.governancePolicyExceptions,t,id,v=>s.decideException(v,x,by,c));store.write(d);return r},
metrics(t){const d=ensure(store.read()),f=a=>a.filter(x=>!t||x.tenantId===t);return s.metrics({policies:f(d.governancePolicies),acknowledgements:f(d.governancePolicyAcknowledgements),exceptions:f(d.governancePolicyExceptions)})}
}}
function createPolicyManagementRepository(store){if(store.type==='json')return createJson(store);if(store.type==='postgres')return require('./postgresPolicyManagementRepository').createPostgresPolicyManagementRepository(store);throw new Error(`Unsupported store type: ${store.type}`)}
module.exports={createPolicyManagementRepository};
