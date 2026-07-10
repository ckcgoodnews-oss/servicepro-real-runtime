const { validateRuntimeConfig } = require('../apps/api/src/services/configValidationService');

const result = validateRuntimeConfig();

if (result.warnings.length) {
  for (const warning of result.warnings) console.warn(`WARN: ${warning}`);
}

if (!result.ok) {
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log('Runtime configuration check passed.');
