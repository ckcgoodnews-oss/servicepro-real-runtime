function requireFields(input, fields) {
  const missing = fields.filter(field => input[field] === undefined || input[field] === null || String(input[field]).trim() === '');
  if (missing.length) {
    const err = new Error(`Missing required field(s): ${missing.join(', ')}`);
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
}

function optionalEmail(input, field) {
  const value = input[field];
  if (!value) return;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value))) {
    const err = new Error(`${field} must be a valid email address`);
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
}

module.exports = { requireFields, optionalEmail };
