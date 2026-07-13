const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase43GlobalFederationSovereignCloud.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'global-federation-readiness',name:'Global Federation Readiness',owner:'platform'});
console.log(JSON.stringify(row,null,2));
