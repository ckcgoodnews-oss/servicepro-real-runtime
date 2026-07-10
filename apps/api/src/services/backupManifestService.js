const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function buildBackupManifest(filePath, options = {}) {
  const stat = fs.statSync(filePath);
  return {
    app: process.env.APP_NAME || 'ServicePro',
    version: process.env.APP_VERSION || '0.73.0',
    backupType: options.backupType || 'json',
    sourcePath: path.resolve(filePath),
    filename: path.basename(filePath),
    sizeBytes: stat.size,
    sha256: sha256File(filePath),
    createdAt: new Date().toISOString(),
    tenantId: options.tenantId || process.env.DEFAULT_TENANT_ID || 'tenant_demo'
  };
}

function validateBackupJsonShape(data) {
  const requiredArrays = ['users', 'customers', 'jobs', 'invoices'];
  const missing = requiredArrays.filter(key => !Array.isArray(data[key]));
  return {
    ok: missing.length === 0,
    missing
  };
}

module.exports = { sha256File, buildBackupManifest, validateBackupJsonShape };
