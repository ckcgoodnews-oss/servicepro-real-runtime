const { validationError } = require('../errors/domainError');

function parseJsonText(text) {
  if (!text || !text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw validationError('Request body must be valid JSON');
  }
}

function assertPlainObject(value, label = 'body') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw validationError(`${label} must be a JSON object`);
  }
  return value;
}

module.exports = { parseJsonText, assertPlainObject };
