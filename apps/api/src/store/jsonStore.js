const fs = require('fs');
const path = require('path');

const dataFile = path.resolve(process.env.DATA_FILE || './data/servicepro-runtime.json');

const seedData = {
  customers: [
    {
      id: 'cust_demo_1',
      tenantId: 'tenant_demo',
      firstName: 'Maria',
      lastName: 'Johnson',
      phone: '555-0101',
      email: 'maria@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  jobs: [
    {
      id: 'job_demo_1',
      tenantId: 'tenant_demo',
      customerId: 'cust_demo_1',
      title: 'Kitchen sink clog',
      status: 'open',
      priority: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

function ensureStore() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(seedData, null, 2));
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeStore(data) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function resetStore() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(seedData, null, 2));
}

module.exports = { ensureStore, readStore, writeStore, resetStore };
