const assert = require('assert');
const { formatDashboardActivity } = require('../apps/api/src/routes/dashboard');

assert.deepStrictEqual(
  formatDashboardActivity({ action: 'GET /api/public/storefront/aqua', entityType: 'http' }),
  { displayTitle: 'Public storefront viewed', displayContext: 'Aqua' }
);
assert.deepStrictEqual(
  formatDashboardActivity({ action: 'GET /api/public/blog/smith', entityType: 'http' }),
  { displayTitle: 'Public blog viewed', displayContext: 'Smith' }
);
assert.deepStrictEqual(
  formatDashboardActivity({ action: 'GET /', entityType: 'http' }),
  { displayTitle: 'Website homepage viewed', displayContext: 'Public website' }
);
assert.deepStrictEqual(
  formatDashboardActivity({ action: 'PATCH /api/v1/customers/123', entityType: 'http' }),
  { displayTitle: 'Application data updated', displayContext: '123' }
);

console.log('dashboard activity labels: ok');
