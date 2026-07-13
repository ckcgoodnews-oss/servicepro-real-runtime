const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase43GlobalFederationSovereignCloud.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'cross-border-data-controls',name:'Cross Border Data Controls',owner:'platform'});
console.log(JSON.stringify(row,null,2));
