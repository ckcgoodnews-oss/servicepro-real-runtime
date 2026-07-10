const requiredSeedAreas = [
  'tenants',
  'users',
  'tenantUsers',
  'customers',
  'jobs',
  'services',
  'pricing'
];

for (const area of requiredSeedAreas) {
  if (!area || typeof area !== 'string') {
    console.error('Seed validation failed.');
    process.exit(1);
  }
}

console.log('Seed validation test passed.');
