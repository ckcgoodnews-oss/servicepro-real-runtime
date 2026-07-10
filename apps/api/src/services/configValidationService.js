function requireEnv(name, errors) {
  if (!process.env[name] || String(process.env[name]).trim() === '') {
    errors.push(`${name} is required`);
  }
}

function requireLongSecret(name, errors) {
  const value = String(process.env[name] || '');
  if (value.length < 32) {
    errors.push(`${name} must be at least 32 characters`);
  }
}

function validateRuntimeConfig() {
  const errors = [];
  const warnings = [];

  if ((process.env.NODE_ENV || 'development') === 'production') {
    requireEnv('PORT', errors);
    requireEnv('DEFAULT_TENANT_ID', errors);
    requireEnv('DATA_STORE', errors);
    requireLongSecret('JWT_SECRET', errors);
    requireLongSecret('PORTAL_TOKEN_SECRET', errors);

    if (process.env.DATA_STORE === 'postgres') {
      requireEnv('DATABASE_URL', errors);
    }

    if (!process.env.CORS_ALLOWED_ORIGINS) {
      warnings.push('CORS_ALLOWED_ORIGINS is not set; browser clients may be blocked or overly permissive defaults may be used');
    }
  }

  if (process.env.DATA_STORE && !['json', 'postgres'].includes(process.env.DATA_STORE)) {
    errors.push('DATA_STORE must be json or postgres');
  }

  const numericFields = [
    'PORT',
    'ACCESS_TOKEN_TTL_SECONDS',
    'PORTAL_TOKEN_TTL_SECONDS',
    'MAX_JSON_BODY_BYTES',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'AUTH_RATE_LIMIT_MAX_REQUESTS'
  ];

  for (const field of numericFields) {
    if (process.env[field] && Number.isNaN(Number(process.env[field]))) {
      errors.push(`${field} must be numeric`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

function assertRuntimeConfig() {
  const result = validateRuntimeConfig();
  if (!result.ok) {
    const err = new Error(`Runtime configuration failed: ${result.errors.join('; ')}`);
    err.status = 500;
    err.code = 'configuration_failed';
    err.details = result;
    throw err;
  }
  return result;
}

module.exports = { validateRuntimeConfig, assertRuntimeConfig };
