const { serviceInfo } = require('../src');

const info = serviceInfo();

if (info.name !== 'ServicePro') {
  console.error('Smoke test failed: invalid service name.');
  process.exit(1);
}

console.log('Smoke test passed.');
