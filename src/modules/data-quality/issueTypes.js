const DATA_QUALITY_ISSUE_TYPES = {
  MISSING_REQUIRED_FIELD: 'missing_required_field',
  INVALID_EMAIL: 'invalid_email',
  INVALID_PHONE: 'invalid_phone',
  DUPLICATE_RECORD: 'duplicate_record',
  INVALID_MONEY: 'invalid_money',
  UNKNOWN_SERVICE: 'unknown_service',
  CUSTOMER_NOT_FOUND: 'customer_not_found'
};

const SEVERITIES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

module.exports = { DATA_QUALITY_ISSUE_TYPES, SEVERITIES };
