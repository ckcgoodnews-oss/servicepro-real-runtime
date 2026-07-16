const path = require('path');

process.env.PORT = process.env.PORT || '10001';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
process.env.DATA_STORE = process.env.DATA_STORE || 'json';
process.env.DATA_FILE = process.env.DATA_FILE || path.resolve(__dirname, '../data/servicepro-runtime.json');

require('../apps/api/src/server');
