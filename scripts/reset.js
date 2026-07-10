const fs = require('fs');
const path = require('path');
const dataFile = path.resolve(process.env.DATA_FILE || './data/servicepro.json');
fs.mkdirSync(path.dirname(dataFile), { recursive: true });
fs.writeFileSync(dataFile, JSON.stringify({
  tenants: [], users: [], tenantUsers: [], customers: [], jobs: [],
  reviews: [], reviewRequests: [], referralSources: [], serviceReminders: [],
  campaigns: [], campaignRecipients: [], auditLogs: []
}, null, 2));
console.log('Data reset complete.');
