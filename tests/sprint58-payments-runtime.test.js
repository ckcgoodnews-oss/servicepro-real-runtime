const fs = require('fs');

const required = [
  'apps/api/src/services/paymentService.js',
  'apps/api/src/repositories/paymentRepository.js',
  'apps/api/src/routes/payments.js',
  'apps/api/src/repositories/invoiceRepository.js',
  'packages/database/postgres/058_payments_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 58 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint58.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-58';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { applyPaymentToInvoice } = require('../apps/api/src/services/paymentService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const invoice = repos.invoices.findById('tenant_demo', 'inv_demo_1');
if (!invoice) {
  console.error('Seed invoice missing.');
  process.exit(1);
}

const payment = repos.payments.create('tenant_demo', {
  invoiceId: invoice.id,
  customerId: invoice.customerId,
  amount: 100,
  method: 'cash',
  reference: 'test-payment'
});

const updatedInvoice = repos.invoices.recordPayment('tenant_demo', invoice.id, payment.amount);
if (updatedInvoice.balanceDue !== 140.75 || updatedInvoice.status !== 'partially_paid') {
  console.error(`Payment application failed. Balance=${updatedInvoice.balanceDue}, Status=${updatedInvoice.status}`);
  process.exit(1);
}

const paidInvoice = applyPaymentToInvoice(updatedInvoice, 140.75);
if (paidInvoice.balanceDue !== 0 || paidInvoice.status !== 'paid') {
  console.error('Paid status calculation failed.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.PAYMENTS_WRITE)) {
  console.error('Owner missing payments.write permission.');
  process.exit(1);
}

console.log('Sprint 58 payments runtime patch test passed.');
