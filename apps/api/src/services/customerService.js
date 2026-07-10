const { readStore, writeStore } = require('../store/jsonStore');
const { makeId, now } = require('./id');
const { requireFields, optionalEmail } = require('../utils/validation');

function listCustomers(tenantId) {
  return readStore().customers.filter(c => c.tenantId === tenantId);
}

function getCustomer(tenantId, id) {
  return readStore().customers.find(c => c.tenantId === tenantId && c.id === id) || null;
}

function createCustomer(tenantId, input) {
  requireFields(input, ['firstName', 'lastName']);
  optionalEmail(input, 'email');

  const data = readStore();
  const customer = {
    id: makeId('cust'),
    tenantId,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone || '',
    email: input.email || '',
    createdAt: now(),
    updatedAt: now()
  };

  data.customers.push(customer);
  writeStore(data);
  return customer;
}

function updateCustomer(tenantId, id, input) {
  optionalEmail(input, 'email');

  const data = readStore();
  const idx = data.customers.findIndex(c => c.tenantId === tenantId && c.id === id);
  if (idx === -1) return null;

  data.customers[idx] = {
    ...data.customers[idx],
    ...input,
    id,
    tenantId,
    updatedAt: now()
  };
  writeStore(data);
  return data.customers[idx];
}

function deleteCustomer(tenantId, id) {
  const data = readStore();
  const before = data.customers.length;
  data.customers = data.customers.filter(c => !(c.tenantId === tenantId && c.id === id));
  const deleted = data.customers.length !== before;
  if (deleted) writeStore(data);
  return deleted;
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
