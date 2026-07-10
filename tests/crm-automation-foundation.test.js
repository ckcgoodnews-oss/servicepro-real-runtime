const fs = require('fs');

const requiredFiles = [
  'packages/crm/src/leadTypes.ts',
  'packages/crm/src/campaignTypes.ts',
  'packages/crm/src/followUpTypes.ts',
  'packages/crm/src/reputationTypes.ts',
  'packages/crm/src/referralTypes.ts',
  'packages/workflows/src/workflowTypes.ts',
  'packages/workflows/src/workflowExecutorContract.ts',
  'packages/database/postgres/046_crm_workflow_automation.sql'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 46 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 46 CRM automation foundation test passed.');
