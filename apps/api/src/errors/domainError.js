class DomainError extends Error {
  constructor(code, message, status = 400, details = {}) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function validationError(message, details = {}) {
  return new DomainError('validation_failed', message, 400, details);
}

function conflictError(message, details = {}) {
  return new DomainError('conflict', message, 409, details);
}

function notFoundError(message, details = {}) {
  return new DomainError('not_found', message, 404, details);
}

function toErrorPayload(err) {
  return {
    error: {
      code: err.code || 'error',
      message: err.message || 'Unexpected error',
      details: err.details || {}
    }
  };
}

module.exports = { DomainError, validationError, conflictError, notFoundError, toErrorPayload };
