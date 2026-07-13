const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase43GlobalFederationSovereignCloud.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'global-identity-federation',name:'Global Identity Federation',owner:'platform'});
console.log(JSON.stringify(row,null,2));
