const fs = require('fs');

const requiredFiles = [
  'src/db/postgres/035_customer_portal_full.sql',
  'src/modules/customer-portal/portalRoutes.js',
  'src/modules/online-booking/bookingStatuses.js',
  'src/modules/payment-portal/paymentStatuses.js',
  'src/modules/customer-chat/messageTypes.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 35 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 35 customer portal foundation test passed.');
