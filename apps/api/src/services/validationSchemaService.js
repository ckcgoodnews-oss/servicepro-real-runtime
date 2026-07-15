const { validationError } = require('../errors/domainError');

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function isIsoDateTime(value) {
  const t = Date.parse(value);
  return !Number.isNaN(t);
}

function validateRequired(input, fields) {
  const missing = fields.filter(field => input[field] === undefined || input[field] === null || input[field] === '');
  if (missing.length) throw validationError(`Missing required field(s): ${missing.join(', ')}`, { missing });
}

function validateNumber(input, field, options = {}) {
  if (input[field] === undefined || input[field] === null || input[field] === '') return;
  const value = Number(input[field]);
  if (Number.isNaN(value)) throw validationError(`${field} must be numeric`, { field });
  if (options.min !== undefined && value < options.min) throw validationError(`${field} must be at least ${options.min}`, { field, min: options.min });
  if (options.max !== undefined && value > options.max) throw validationError(`${field} must be at most ${options.max}`, { field, max: options.max });
}

function validateEmail(input, field) {
  if (input[field] && !isEmail(input[field])) throw validationError(`${field} must be a valid email address`, { field });
}

function validateDateTime(input, field) {
  if (input[field] && !isIsoDateTime(input[field])) throw validationError(`${field} must be a valid ISO date/time`, { field });
}

function validateLineItems(input) {
  if (!input.lines) return;
  if (!Array.isArray(input.lines)) throw validationError('lines must be an array');
  for (const [index, line] of input.lines.entries()) {
    if (line.quantity !== undefined && Number(line.quantity) <= 0) {
      throw validationError('line quantity must be greater than zero', { index });
    }
    if (line.unitPrice !== undefined && Number(line.unitPrice) < 0) {
      throw validationError('line unitPrice cannot be negative', { index });
    }
  }
}

const routeValidators = {
  'POST /auth/login': input => { validateRequired(input, ['email', 'password']); validateEmail(input, 'email'); },
  'POST /auth/register': input => { validateRequired(input, ['email', 'name', 'password']); validateEmail(input, 'email'); },
  'POST /auth/refresh': input => validateRequired(input, ['refreshToken']),
  'POST /auth/password-reset/request': input => { validateRequired(input, ['email']); validateEmail(input, 'email'); },
  'POST /auth/password-reset/confirm': input => validateRequired(input, ['token', 'password']),
  'POST /auth/invitations/accept': input => validateRequired(input, ['token', 'password']),
  'POST /auth/mfa/verify': input => validateRequired(input, ['challengeId', 'code']),
  'POST /api/v1/customers': input => {
    validateRequired(input, ['firstName', 'lastName']);
    validateEmail(input, 'email');
  },
  'POST /api/v1/jobs': input => {
    validateRequired(input, ['customerId', 'title']);
  },
  'POST /api/v1/estimates': input => {
    validateRequired(input, ['customerId']);
    validateNumber(input, 'taxRate', { min: 0, max: 1 });
    validateLineItems(input);
  },
  'POST /api/v1/invoices': input => {
    validateRequired(input, ['customerId']);
    validateNumber(input, 'taxRate', { min: 0, max: 1 });
    validateNumber(input, 'paidAmount', { min: 0 });
    validateLineItems(input);
  },
  'POST /api/v1/payments': input => {
    validateRequired(input, ['invoiceId', 'amount']);
    validateNumber(input, 'amount', { min: 0.01 });
  },
  'POST /api/v1/appointments': input => {
    validateRequired(input, ['jobId', 'technicianId', 'startTime', 'endTime']);
    validateDateTime(input, 'startTime');
    validateDateTime(input, 'endTime');
  },
  'POST /portal/api/bookings': input => {
    validateRequired(input, ['serviceType', 'requestedDate']);
  },
  'POST /api/v1/inventory': input => {
    validateRequired(input, ['sku', 'name']);
    validateNumber(input, 'unitCost', { min: 0 });
    validateNumber(input, 'unitPrice', { min: 0 });
    validateNumber(input, 'quantityOnHand', { min: 0 });
  }
};

function validateRoute(method, url, body) {
  const key = `${method} ${url}`;
  const validator = routeValidators[key];
  if (validator) validator(body || {});
  return true;
}

module.exports = {
  isEmail,
  isIsoDateTime,
  validateRequired,
  validateNumber,
  validateEmail,
  validateDateTime,
  validateLineItems,
  validateRoute,
  routeValidators
};
