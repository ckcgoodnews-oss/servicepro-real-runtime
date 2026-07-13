const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase38Version6FoundationRc;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'version-6-release-candidate',name:'Version 6 Release Candidate',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
