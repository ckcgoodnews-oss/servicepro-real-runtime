const { getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repo=getRepositories().phase35AgenticWorkforceOrchestration;
const row=repo.create({tenantId:process.env.DEFAULT_TENANT_ID||'tenant_demo',domain:'agent-memory-governance',name:'Agent Memory Governance',owner:'platform'});
console.log(JSON.stringify({ok:true,row},null,2));
