const fs = require('fs');
const path = require('path');

function mode() { return (process.env.STORAGE_MODE || 'local').toLowerCase(); }
function uploadDir() { return path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'data/uploads'); }
function publicBaseUrl(req) { return `${req.protocol}://${req.get('host')}`; }

async function saveUploadedFile(req, file, tenantId) {
  if (!file) return null;
  if (mode() === 's3') return saveS3Stub(req, file, tenantId);
  return saveLocal(req, file);
}

async function saveLocal(req, file) {
  return {
    provider: 'local',
    storage_key: file.filename,
    file_url: `/uploads/${file.filename}`,
    absolute_url: `${publicBaseUrl(req)}/uploads/${file.filename}`,
    file_name: file.filename,
    original_name: file.originalname,
    mime_type: file.mimetype,
    size_bytes: file.size
  };
}

async function saveS3Stub(req, file, tenantId) {
  // Sprint 5 intentionally stages S3 without forcing cloud credentials during local development.
  // Sprint 6 can replace this stub with a real PutObjectCommand implementation.
  const bucket = process.env.S3_BUCKET || 'servicepro-bucket-not-configured';
  const key = `tenants/${tenantId}/${Date.now()}-${file.filename}`;
  const base = (process.env.S3_PUBLIC_BASE_URL || `https://${bucket}.s3.amazonaws.com`).replace(/\/$/, '');
  return {
    provider: 's3-staged',
    storage_key: key,
    file_url: `${base}/${key}`,
    absolute_url: `${base}/${key}`,
    file_name: file.filename,
    original_name: file.originalname,
    mime_type: file.mimetype,
    size_bytes: file.size
  };
}

function ensureLocalUploadDir() {
  fs.mkdirSync(uploadDir(), { recursive: true });
}

module.exports = { mode, uploadDir, saveUploadedFile, ensureLocalUploadDir };
