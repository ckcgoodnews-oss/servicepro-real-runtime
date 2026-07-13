const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos=getRepositories();
const row=repos.phase41DigitalTwinSimulationPlatform.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'twin-security-controls',name:'Twin Security Controls',owner:'platform'});
console.log(JSON.stringify(row,null,2));
