// File storage service - Cloudflare R2 / S3 compatible
// Uses environment variables: STORAGE_BUCKET, STORAGE_REGION, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_ENDPOINT

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const BUCKET = process.env.STORAGE_BUCKET || '';
const REGION = process.env.STORAGE_REGION || 'auto';
const ACCESS_KEY = process.env.STORAGE_ACCESS_KEY || '';
const SECRET_KEY = process.env.STORAGE_SECRET_KEY || '';
const ENDPOINT = process.env.STORAGE_ENDPOINT || '';
const MAX_SIZE = Number(process.env.MAX_FILE_SIZE || 52428800); // 50MB
const LOCAL_DIR = process.env.STORAGE_LOCAL_DIR || './uploads';

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf', 'text/plain', 'text/csv',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

function isConfigured() { return Boolean(BUCKET && ACCESS_KEY && SECRET_KEY); }

function validateFile(filename, sizeBytes, mimeType) {
  const errors = [];
  if (sizeBytes > MAX_SIZE) errors.push(`File exceeds maximum size of ${MAX_SIZE} bytes`);
  if (!ALLOWED_TYPES.has(mimeType)) errors.push(`File type ${mimeType} is not allowed`);
  if (!filename || filename.length > 255) errors.push('Invalid filename');
  return errors.length ? { valid: false, errors } : { valid: true, errors: [] };
}

function generateKey(tenantId, folder, filename) {
  const ext = path.extname(filename);
  const hash = crypto.randomBytes(8).toString('hex');
  return `${tenantId}/${folder}/${Date.now()}-${hash}${ext}`;
}

async function uploadFile(tenantId, folder, filename, buffer, mimeType) {
  const key = generateKey(tenantId, folder, filename);

  if (!isConfigured()) {
    // Local storage fallback
    const dir = path.join(LOCAL_DIR, tenantId, folder);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, path.basename(key)), buffer);
    return { key, url: `/uploads/${key}`, size: buffer.length, mimeType, provider: 'local' };
  }

  // S3-compatible upload (R2/S3)
  const url = `${ENDPOINT}/${BUCKET}/${key}`;
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateShort = date.slice(0, 8);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Content-Length': String(buffer.length),
      'x-amz-date': date,
      'x-amz-content-sha256': crypto.createHash('sha256').update(buffer).digest('hex')
    },
    body: buffer
  });

  if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`);
  return { key, url: `${ENDPOINT}/${BUCKET}/${key}`, size: buffer.length, mimeType, provider: 'r2' };
}

async function deleteFile(key) {
  if (!isConfigured()) {
    const localPath = path.join(LOCAL_DIR, key);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    return { deleted: true };
  }

  const url = `${ENDPOINT}/${BUCKET}/${key}`;
  await fetch(url, { method: 'DELETE' });
  return { deleted: true };
}

function getPublicUrl(key) {
  if (!isConfigured()) return `/uploads/${key}`;
  return `${ENDPOINT}/${BUCKET}/${key}`;
}

module.exports = { isConfigured, validateFile, uploadFile, deleteFile, getPublicUrl, generateKey };
